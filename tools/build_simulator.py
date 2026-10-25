#!/usr/bin/env python3
r"""Build, verify, and assemble a complete browser release into _site/.

This site-owned release assembler compiles an exact RSpice checkout and
overlays its browser runtimes on an already-built RSpice-Site tree.

    python3 tools/build_simulator.py --rspice-source ../RSpice \
        --site-source dist --out _site-production

    # Windows:
    py tools\build_simulator.py --rspice-source ..\RSpice \
        --site-source dist --out _site-production

Stages:
  1. toolchain gate    - wasm-bindgen CLI must match Cargo.lock
  2. build             - separate UI and simulation-worker images with the
                         generated device catalog
  3. assemble          - RSpice-Site/dist + client-owned browser shells,
                         generated wasm packages, and build.json
  4. static gates      - \0asm magic + wasm-bindgen export signature
  5. headless gate     - client-owned JIT, production UI startup, and Python
                         debugger checks in Chrome

Any failed gate exits non-zero; tools/deploy.py owns publication.
Pure stdlib, no third-party deps - runs the same on the Ubuntu CI runner
(python3) and on Windows (py). The local HTTP server uses this very
interpreter (sys.executable), sidestepping the Windows python-stub probe
the old shell script needed.
"""

import argparse
import datetime
import gzip
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ASSET_ROOT_PLACEHOLDER = "__RSPICE_ASSET_ROOT__"
IMMUTABLE_ASSET_ID_RE = re.compile(r"[0-9a-f]{64}")
UI_PROFILE = "web-release"
UI_MODULES = (
    ("rspice-ui", ("generated-veriloga-catalog",)),
    ("rspice-ui-worker", ("browser-worker", "generated-veriloga-catalog")),
)
IDE_EXECUTABLE_FILES = (
    "simulation-worker.js", "wasm-loader.js", "automation-worker.js",
    "rspice-ui.js", "rspice-ui_bg.wasm.gz",
    "rspice-ui-worker.js", "rspice-ui-worker_bg.wasm.gz",
)


def fail(msg):
    print("FAIL: " + msg, file=sys.stderr)
    sys.exit(1)


def run(cmd, **kw):
    """Run a command inheriting stdio; raise CalledProcessError on failure."""
    return subprocess.run(cmd, check=True, **kw)


def run_cargo_build(cmd, root):
    """Retry one transient Windows compiler-process failure."""
    try:
        return run(cmd, cwd=root)
    except subprocess.CalledProcessError:
        if os.name != "nt":
            raise
        print("cargo build failed once on Windows; retrying from cached artifacts")
        return run(cmd, cwd=root)


def build_ui_images(root):
    for name, features in UI_MODULES:
        print("building %s..." % name)
        # Separate invocations keep the worker feature out of the interactive image.
        run_cargo_build(
            ["cargo", "build", "--locked", "-p", "rspice-ui", "--bin", name,
             "--features", ",".join(features), "--target", "wasm32-unknown-unknown",
             "--profile", UI_PROFILE], root)


def qualify_client_sources(root):
    for name in ("test_ide_worker.py", "test_automation_runtime_assets.py"):
        run([sys.executable, "-B", str(root / "tools/ci" / name)], cwd=root)


def capture(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, check=True, **kw).stdout.strip()


# 1. toolchain gate
def locked_wasm_bindgen(root):
    """Version pinned in Cargo.lock - the first wasm-bindgen package entry,
    matching the shell `grep -A1 '^name = "wasm-bindgen"$' | grep '^version'`."""
    lines = (root / "Cargo.lock").read_text(encoding="utf-8").splitlines()
    for i, line in enumerate(lines):
        if line.strip() == 'name = "wasm-bindgen"':
            for nxt in lines[i + 1:i + 4]:
                m = re.match(r'version = "([^"]+)"', nxt.strip())
                if m:
                    return m.group(1)
    fail("could not find wasm-bindgen version in Cargo.lock")


def installed_wasm_bindgen():
    try:
        out = subprocess.run(["wasm-bindgen", "--version"],
                             capture_output=True, text=True, check=True).stdout
    except FileNotFoundError:
        fail("wasm-bindgen CLI not found on PATH "
             "(install the version Cargo.lock pins, or pass --skip-headless "
             "only skips the solve gate; the build still needs it)")
    return out.split()[1]  # "wasm-bindgen 0.2.114" -> "0.2.114"


# 4. static gates
def gate_bundle(out, stem, compressed=False):
    wasm = out / (stem + ("_bg.wasm.gz" if compressed else "_bg.wasm"))
    js = out / (stem + ".js")
    payload = gzip.decompress(wasm.read_bytes()) if compressed else wasm.read_bytes()
    if payload[:4] != b"\x00asm":
        fail("%s is not a wasm module (magic %s)"
             % (wasm, payload[:4].hex()))
    if "export { initSync, __wbg_init as default }" not in js.read_text(encoding="utf-8"):
        fail(str(js) + " is missing the wasm-bindgen export signature")
    print("ok: %s (%d KiB wasm)" % (stem, wasm.stat().st_size // 1024))


def require_tokens(path, source, tokens):
    for token in tokens:
        if token not in source:
            fail(str(path) + " is missing " + token)


def stamped_ide_asset_identity(index_source):
    match = re.search(
        r'const RELEASE_ASSET_ROOT = "/ide/assets/([0-9a-f]{64})";',
        index_source,
    )
    if not match:
        fail("IDE index does not name a content-addressed executable asset directory")
    return match.group(1)


def gate_ide_worker(out):
    index = out / "ide" / "index.html"
    index_source = index.read_text(encoding="utf-8")
    asset_identity = stamped_ide_asset_identity(index_source)
    asset_root = out / "ide" / "assets" / asset_identity
    if (
        not asset_root.is_dir()
        or asset_root.is_symlink()
        or asset_root.parent.is_symlink()
    ):
        fail(str(asset_root) + " is missing or is not an immutable local directory")
    worker = asset_root / "simulation-worker.js"
    if not worker.exists():
        fail(str(worker) + " is missing")

    worker_source = worker.read_text(encoding="utf-8")
    require_tokens(index, index_source, (
        "__RSPICE_SIM_WORKER",
        "__RSPICE_SIM_WORKER_URL",
        "__RSPICE_SIM_WORKER_ERROR",
        'executableAsset("simulation-worker.js")',
        'executableAsset("rspice-ui.js")',
        '"rspice-ui_bg.wasm.gz"',
        'import(executableAsset("wasm-loader.js").href)',
        'await loadWasm(wasmModule)',
        'addEventListener("error"',
        'addEventListener("messageerror"',
    ))
    if ASSET_ROOT_PLACEHOLDER in index_source:
        fail(str(index) + " contains an unstamped browser asset root")
    if "innerHTML =" in index_source:
        fail(str(index) + " must render startup errors with text nodes, not innerHTML")
    require_tokens(worker, worker_source, (
        'import(executableAsset("rspice-ui-worker.js").href)',
        '"rspice-ui-worker_bg.wasm.gz"',
        'import(executableAsset("wasm-loader.js").href)',
        'await loadWasm(wasmModule)',
        "runRspiceUiWorkerRequest",
        "responseTransferList(response)",
        "ArrayBuffer.isView(view)",
        "transferBuffers.add(view.buffer)",
        'id: message.id',
        'id: message.id ?? 0',
        'type: "ready"',
        'type: "result"',
        'type: "error"',
    ))
    for required in IDE_EXECUTABLE_FILES:
        if not (asset_root / required).is_file():
            fail(str(asset_root / required) + " is missing")
    expected_entries = {*IDE_EXECUTABLE_FILES, "python"}
    actual_entries = {entry.name for entry in asset_root.iterdir()}
    if actual_entries != expected_entries:
        fail("IDE executable asset directory contains unexpected outputs")
    mutable_aliases = [out / "ide" / name for name in (*IDE_EXECUTABLE_FILES, "pkg", "python")]
    if any(alias.exists() or alias.is_symlink() for alias in mutable_aliases):
        fail("IDE release contains a mutable executable asset alias")
    if executable_asset_identity(asset_root) != asset_identity:
        fail("IDE executable asset directory does not match its content digest")
    print("ok: ide simulation worker (%s)" % asset_identity)
    return asset_identity


# The client owns browser qualification and its evolving worker protocols.
def headless_solve_gate(out, asset_identity, client_root, target_root):
    try:
        jit = capture([sys.executable, "-B", str(client_root / "tools/ci/check_wasm_jit_browser.py"),
             "--web-root", str(out), "--worker-path",
             "ide/assets/%s/simulation-worker.js" % asset_identity], cwd=client_root)
    except subprocess.CalledProcessError as error:
        print(error.stdout or "", end="", flush=True)
        print(error.stderr or "", end="", file=sys.stderr, flush=True)
        raise
    print(jit)
    evidence_root = target_root / "browser-release-qualification"
    evidence_root.mkdir(parents=True, exist_ok=True)
    evidence = tempfile.mkdtemp(prefix="release-", dir=evidence_root)
    run([sys.executable, "-B", str(client_root / "tools/ci/check_browser_release.py"),
         "--web-root", str(out), "--output", evidence], cwd=client_root)
    # Qualification serves virtual fixture pages without altering release bytes.
    gate_ide_worker(out)
    report = json.loads((Path(evidence) / "release.json").read_text(encoding="utf-8"))
    report["jit_qualification"] = {"status": "passed", "output": jit}
    (out / "browser-qualification.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8")
    verify_browser_qualification(out)


def verify_browser_qualification(out):
    """Bind a successful client qualification to the exact packaged inputs."""
    report_path = out / "browser-qualification.json"
    if not report_path.is_file():
        raise ValueError("release has no completed browser qualification")
    report = json.loads(report_path.read_text(encoding="utf-8"))
    if report.get("schema_version") != 2:
        raise ValueError("release needs browser qualification with rendered playground results")
    if report.get("status") != "passed" or report.get("jit_qualification", {}).get("status") != "passed":
        raise ValueError("release browser qualification did not pass")
    build = json.loads((out / "build.json").read_text(encoding="utf-8"))
    if report.get("build") != build:
        raise ValueError("browser qualification has a different build identity")
    expected_images = [
        {"name": name, "profile": UI_PROFILE, "target": "wasm32-unknown-unknown",
         "features": list(features)} for name, features in UI_MODULES
    ]
    if build.get("browser_images") != expected_images:
        raise ValueError("release does not declare the required isolated catalog images")
    observed = {"_headers": hashlib.sha256((out / "_headers").read_bytes()).hexdigest()}
    for path in sorted((out / "ide").rglob("*")):
        if path.is_symlink():
            raise ValueError("release qualification input is a symbolic link: %s" % path)
        if path.is_file():
            observed[path.relative_to(out).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    if not observed or report.get("inputs") != observed:
        raise ValueError("release inputs differ from the browser-qualified files")
    return report


def validate_site_source(site_source):
    """Validate the cross-repository static-source boundary before building."""
    if not site_source.is_dir():
        fail("site source directory does not exist: %s" % site_source)
    for required in ("index.html", "404.html"):
        if not (site_source / required).is_file():
            fail("site source is missing required file: %s" % (site_source / required))
    if not (site_source / "assets").is_dir():
        fail("site source is missing required directory: %s" % (site_source / "assets"))
    if (site_source / "ide").exists():
        fail("site source must not provide the client-owned runtime route 'ide/'")
    for path in site_source.rglob("*"):
        if path.is_symlink():
            fail("site source must not contain symlinks: %s" % path)


def validated_output_path(root, site_source, output):
    """Resolve an assembler output without permitting destructive path overlap."""
    root = root.resolve()
    site_source = site_source.resolve()
    candidate = Path(output)
    if not candidate.is_absolute():
        candidate = root / candidate

    # Never follow an operator-supplied output link into an otherwise valid
    # directory. Parent links are resolved below and still have to remain inside
    # the allowed release boundary.
    is_junction = getattr(candidate, "is_junction", lambda: False)
    if candidate.is_symlink() or is_junction():
        fail("output directory must not be a symlink or junction: %s" % candidate)
    out = candidate.resolve()

    # Assembly is site-owned and may only replace one reserved directory at the
    # root of the RSpice-Site checkout.
    boundary = root
    if out == boundary or boundary not in out.parents:
        fail("output directory must be below the site checkout: %s" % boundary)
    if out == root or out in root.parents:
        fail("output directory must not be the RSpice checkout or one of its ancestors")
    if out.parent != root or not (
        out.name == "dist" or out.name == "_site" or out.name.startswith("_site-")
    ):
        fail(
            "output must be a direct site child named dist, _site, or _site-*"
        )
    if (
        out == site_source
        or out in site_source.parents
        or site_source in out.parents
    ):
        fail("output directory must not overlap the standalone site source")
    if out.exists() and not out.is_dir():
        fail("output path exists but is not a directory: %s" % out)
    return out


def site_source_revision(site_source):
    """Return the exact source commit for the standalone site checkout."""
    try:
        revision = capture(["git", "-C", str(site_source), "rev-parse", "HEAD"])
    except subprocess.CalledProcessError:
        revision = os.environ.get("RSPICE_SITE_SOURCE_SHA", "")
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        fail(
            "site source is not in a Git checkout and RSPICE_SITE_SOURCE_SHA "
            "is not a full commit SHA"
        )
    return revision


def copy_runtime_shell(source, destination, names):
    destination.mkdir(parents=True)
    for name in names:
        path = source / name
        if not path.is_file():
            fail("browser runtime source is missing: %s" % path)
        shutil.copy2(path, destination / name)


def require_clean_client_checkout(root):
    """Release identities must never conceal uncommitted source inputs."""
    result = subprocess.run(
        ["git", "-C", str(root), "status", "--porcelain=v1", "--untracked-files=all"],
        capture_output=True,
        text=True,
        check=True,
    )
    dirty = result.stdout.strip()
    if dirty:
        preview = "; ".join(dirty.splitlines()[:5])
        fail("browser release requires a clean client checkout: " + preview)


def executable_asset_identity(asset_root):
    """Digest the exact executable browser bundle with stable framing."""
    digest = hashlib.sha256()
    digest.update(b"RSpice IDE executable assets v2\0")
    python = asset_root / "python"
    if not python.is_dir() or python.is_symlink():
        fail("browser Python runtime is missing or unsafe")
    runtime_files = []
    for path in python.rglob("*"):
        if path.is_symlink():
            fail("browser Python runtime contains a symlink: %s" % path)
        if path.is_file():
            runtime_files.append(path.relative_to(asset_root).as_posix())
    if not runtime_files:
        fail("browser Python runtime is empty")
    for name in (*IDE_EXECUTABLE_FILES, *sorted(runtime_files)):
        path = asset_root / name
        if not path.is_file() or path.is_symlink():
            fail("browser executable asset is missing or unsafe: %s" % path)
        payload = path.read_bytes()
        encoded_name = name.encode("utf-8")
        digest.update(len(encoded_name).to_bytes(4, "big"))
        digest.update(encoded_name)
        digest.update(len(payload).to_bytes(8, "big"))
        digest.update(payload)
    return digest.hexdigest()


def stamp_ide_asset_root(ide, asset_identity):
    """Bind the IDE shell to one content-addressed executable directory."""
    if not IMMUTABLE_ASSET_ID_RE.fullmatch(asset_identity):
        fail("browser executable asset identity is not a SHA-256 digest")
    index = ide / "index.html"
    source = index.read_text(encoding="utf-8")
    count = source.count(ASSET_ROOT_PLACEHOLDER)
    if count != 1:
        fail(
            "%s must contain exactly one browser asset-root token (found %d)"
            % (index, count)
        )
    index.write_text(
        source.replace(
            ASSET_ROOT_PLACEHOLDER,
            "/ide/assets/" + asset_identity,
        ),
        encoding="utf-8",
    )


def package_ide_executable_assets(ide):
    """Bind both client-owned modules and loaders to one immutable asset cohort."""
    staging = ide / ".executable-asset-stage"
    if staging.exists():
        fail("browser executable staging path already exists: %s" % staging)
    pkg = ide / "pkg"
    expected_pkg = {name + suffix for name, _ in UI_MODULES
                    for suffix in (".js", "_bg.wasm")}
    if not pkg.is_dir() or {entry.name for entry in pkg.iterdir()} != expected_pkg:
        fail("wasm-bindgen must emit exactly the UI and worker package files")
    sources = {name: ide / name for name in ("simulation-worker.js", "wasm-loader.js", "automation-worker.js")}
    sources.update({name: pkg / name for name in expected_pkg})
    for source in sources.values():
        if not source.is_file() or source.is_symlink():
            fail("browser executable build output is missing or unsafe: %s" % source)

    if not (ide / "python").is_dir() or (ide / "python").is_symlink():
        fail("browser Python runtime is missing or unsafe")
    staging.mkdir()
    for name, source in sources.items():
        destination = staging / (name + ".gz" if name.endswith(".wasm") else name)
        if name.endswith(".wasm"):
            with source.open("rb") as raw, destination.open("wb") as compressed:
                with gzip.GzipFile(filename="", fileobj=compressed, mode="wb", mtime=0) as archive:
                    shutil.copyfileobj(raw, archive)
            source.unlink()
        else:
            shutil.move(str(source), str(destination))
    pkg.rmdir()
    shutil.move(str(ide / "python"), str(staging / "python"))
    asset_identity = executable_asset_identity(staging)
    destination = ide / "assets" / asset_identity
    destination.parent.mkdir()
    if destination.exists():
        fail("content-addressed executable output already exists: %s" % destination)
    staging.rename(destination)
    stamp_ide_asset_root(ide, asset_identity)
    return asset_identity


def assemble_site_sources(site_root, rspice_root, site_source, out):
    """Combine static site source with client-owned browser runtime shells."""
    out = validated_output_path(site_root, site_source, out)
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(site_source, out)
    copy_runtime_shell(
        rspice_root / "crates" / "rspice-ui" / "web",
        out / "ide",
        ("index.html", "simulation-worker.js", "wasm-loader.js", "automation-worker.js"),
    )
    shutil.copytree(rspice_root / "crates/rspice-ui/web/python", out / "ide/python")


def main():
    ap = argparse.ArgumentParser(description="Build, verify, and assemble _site/.")
    ap.add_argument("--skip-headless", action="store_true",
                    help="assemble locally without browser qualification; output cannot be published")
    ap.add_argument(
        "--rspice-source",
        required=True,
        help="clean RSpice simulator Git checkout to compile",
    )
    ap.add_argument(
        "--out",
        default="_site",
        help="reserved output directory: dist, _site, or _site-* (default: _site)",
    )
    ap.add_argument(
        "--site-source",
        default="_site-source/dist",
        help="built RSpice-Site dist directory (default: _site-source/dist)",
    )
    args = ap.parse_args()

    site_root = Path(__file__).resolve().parents[1]
    root = Path(args.rspice_source).resolve()
    if not (root / "Cargo.toml").is_file() or not (root / ".git").exists():
        fail("--rspice-source must be an RSpice Git checkout: %s" % root)
    target_root = Path(os.environ.get("CARGO_TARGET_DIR", root / "target"))
    if not target_root.is_absolute():
        target_root = root / target_root
    target = target_root / "wasm32-unknown-unknown"
    ui_target = target / UI_PROFILE
    site_source = Path(args.site_source).resolve()
    validate_site_source(site_source)
    out = validated_output_path(site_root, site_source, args.out)
    site_sha = site_source_revision(site_source)
    client_sha = capture(["git", "-C", str(root), "rev-parse", "HEAD"])
    if not re.fullmatch(r"[0-9a-f]{40}", client_sha):
        fail("client source revision is not a full commit SHA")
    require_clean_client_checkout(root)
    require_clean_client_checkout(site_root)

    # Fail source contracts before expensive compilation.
    qualify_client_sources(root)

    # 1. toolchain gate
    locked = locked_wasm_bindgen(root)
    have = installed_wasm_bindgen()
    if locked != have:
        fail("wasm-bindgen CLI is %s but Cargo.lock pins %s" % (have, locked))
    print("ok: wasm-bindgen CLI %s matches Cargo.lock" % have)

    # 2. build
    build_ui_images(root)

    # 3. assemble
    assemble_site_sources(site_root, root, site_source, out)

    for name, _ in UI_MODULES:
        run(["wasm-bindgen", str(ui_target / (name + ".wasm")),
             "--out-dir", str(out / "ide" / "pkg"), "--out-name", name,
             "--target", "web", "--no-typescript"])
    ide_asset_identity = package_ide_executable_assets(out / "ide")

    built_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    (out / "build.json").write_text(
        json.dumps(
            {
                # Keep source_sha as a compatibility alias for existing monitors.
                "source_sha": client_sha,
                "client_source_sha": client_sha,
                "site_source_sha": site_sha,
                "ide_executable_asset_sha256": ide_asset_identity,
                "built_utc": built_utc,
                "wasm_bindgen": have,
                "dependency_lock_sha256": hashlib.sha256((root / "Cargo.lock").read_bytes()).hexdigest(),
                "rustc": capture(["rustc", "--version", "--verbose"], cwd=root),
                "cargo": capture(["cargo", "--version"], cwd=root),
                "browser_images": [
                    {"name": name, "profile": UI_PROFILE, "target": "wasm32-unknown-unknown",
                     "features": list(features)} for name, features in UI_MODULES
                ],
            },
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )

    # 4. static gates
    for name, _ in UI_MODULES:
        gate_bundle(out, "ide/assets/%s/%s" % (ide_asset_identity, name), compressed=True)
    if gate_ide_worker(out) != ide_asset_identity:
        fail("IDE shell and executable asset gate disagree on bundle identity")

    # 5. headless solve gate
    if args.skip_headless:
        print("skipped: headless solve gate (--skip-headless)")
    else:
        headless_solve_gate(out, ide_asset_identity, root, target_root)

    require_clean_client_checkout(root)
    require_clean_client_checkout(site_root)
    if capture(["git", "-C", str(root), "rev-parse", "HEAD"]) != client_sha:
        fail("client source revision changed during assembly")
    if site_source_revision(site_source) != site_sha:
        fail("site source revision changed during assembly")

    print(
        "site assembled at %s (client %s, site %s, IDE assets %s)"
        % (out, client_sha, site_sha, ide_asset_identity)
    )


if __name__ == "__main__":
    main()
