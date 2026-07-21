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
  2. build             - rspice-ui (IDE, bin target) + rspice-wasm
                         (playground, lib) for wasm32, release
  3. assemble          - RSpice-Site/dist + client-owned browser shells,
                         generated wasm packages, and build.json
  4. static gates      - \0asm magic + wasm-bindgen export signature
  5. headless gate     - serve _site, load play/ and the IDE worker smoke
                         page in headless Chrome, require completed solves

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
import socket
import subprocess
import sys
import time
from pathlib import Path


ASSET_ROOT_PLACEHOLDER = "__RSPICE_ASSET_ROOT__"
IMMUTABLE_ASSET_ID_RE = re.compile(r"[0-9a-f]{64}")


def fail(msg):
    print("FAIL: " + msg, file=sys.stderr)
    sys.exit(1)


def run(cmd, **kw):
    """Run a command inheriting stdio; raise CalledProcessError on failure."""
    return subprocess.run(cmd, check=True, **kw)


def capture(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout.strip()


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
        r'const RELEASE_ASSET_ROOT = "\./assets/([0-9a-f]{64})";',
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
        'executableAsset("rspice-ui_bg.wasm.gz")',
        'new DecompressionStream("gzip")',
        'addEventListener("error"',
        'addEventListener("messageerror"',
    ))
    if ASSET_ROOT_PLACEHOLDER in index_source:
        fail(str(index) + " contains an unstamped browser asset root")
    if "innerHTML =" in index_source:
        fail(str(index) + " must render startup errors with text nodes, not innerHTML")
    require_tokens(worker, worker_source, (
        'import(executableAsset("rspice-ui.js").href)',
        'executableAsset("rspice-ui_bg.wasm.gz")',
        'new DecompressionStream("gzip")',
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
    for required in ("rspice-ui.js", "rspice-ui_bg.wasm.gz"):
        if not (asset_root / required).is_file():
            fail(str(asset_root / required) + " is missing")
    expected_entries = {
        "simulation-worker.js",
        "rspice-ui.js",
        "rspice-ui_bg.wasm.gz",
    }
    actual_entries = {entry.name for entry in asset_root.iterdir()}
    if actual_entries != expected_entries:
        fail("IDE executable asset directory contains unexpected outputs")
    mutable_aliases = (
        out / "ide" / "simulation-worker.js",
        out / "ide" / "rspice-ui.js",
        out / "ide" / "rspice-ui_bg.wasm.gz",
        out / "ide" / "pkg",
    )
    if any(alias.exists() or alias.is_symlink() for alias in mutable_aliases):
        fail("IDE release contains a mutable executable asset alias")
    if executable_asset_identity(asset_root) != asset_identity:
        fail("IDE executable asset directory does not match its content digest")
    print("ok: ide simulation worker (%s)" % asset_identity)
    return asset_identity


def gate_ide_worker_sources(root):
    contract = root / "crates" / "rspice-ui" / "src" / "simulation" / "runner" / "worker_contract.rs"
    bridge = root / "crates" / "rspice-ui" / "src" / "simulation" / "runner" / "wasm_worker.rs"
    contract_source = contract.read_text(encoding="utf-8")
    bridge_source = bridge.read_text(encoding="utf-8")

    require_tokens(contract, contract_source, (
        "WorkerProgressSnapshot",
        "WorkerResponseTransport",
        "WorkerF64Series",
        "worker_response_transport_value",
        "worker_response_from_value",
        "validate_worker_response_id",
        "Float64Array",
        "emit_worker_progress_snapshot",
        'JsValue::from_str("progress")',
        "run_simulation_thread_with_progress_observer",
    ))
    require_tokens(bridge, bridge_source, (
        '"progress" => handle_progress_message',
        "active_progress",
        "WorkerProgressSnapshot",
        "worker_response_from_value",
        "validate_worker_response_id",
        "set_onmessageerror(Some",
        "drop_cached_worker",
        "__RSPICE_SIM_WORKER_ERROR",
        "__RSPICE_SIM_WORKER_URL",
        "let worker_url = global_worker_url()?",
        "new_with_options(&worker_url, &options)",
    ))
    if 'new_with_options("./simulation-worker.js"' in bridge_source:
        fail(str(bridge) + " recreates a worker through a mutable path")
    print("ok: ide worker source contract")


def gate_playground_worker(out):
    worker = out / "play" / "engine-worker.js"
    if not worker.exists():
        fail(str(worker) + " is missing")
    worker_source = worker.read_text(encoding="utf-8")
    require_tokens(worker, worker_source, (
        "summarizeNetlist",
        "runDcOperatingPoint",
        "runAcAnalysis",
        "runTransientAnalysis",
        'case "summary"',
        'case "op"',
        'case "ac"',
        'case "tran"',
        "runAcAnalysis(payload.source, payload.frequencies)",
        "let initPromise = null",
        "initPromise = init()",
        'type: "ready"',
        'type: "result"',
        'type: "error"',
    ))
    print("ok: playground engine worker")


# 5. headless solve gate
def find_chrome():
    env = os.environ.get("CHROME")
    if env and (Path(env).exists() or shutil.which(env)):
        return env
    for name in ("google-chrome", "chromium-browser", "chromium", "chrome"):
        found = shutil.which(name)
        if found:
            return found
    for path in (
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ):
        if Path(path).exists():
            return path
    return None


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def validate_playground_dom(dom):
    if "worker ready" not in dom:
        m = re.search(r"module failed|init failed[^<]*", dom)
        if m:
            print(m.group(0), file=sys.stderr)
        fail("playground never reached 'worker ready'")
    if "solved in" not in dom:
        m = re.search(r"tran error[^<]*", dom)
        if m:
            print(m.group(0), file=sys.stderr)
        fail("playground loaded but the on-load transient did not solve")


def validate_ide_dom(dom):
    if 'id="rspice_canvas"' not in dom:
        fail("browser IDE route did not expose the RSpice canvas")
    if '<p class="err">' in dom:
        m = re.search(r'<p class="err">([^<]*)</p>', dom)
        if m:
            print(m.group(1), file=sys.stderr)
        fail("browser IDE rendered a startup error")


def validate_ide_worker_smoke_dom(dom):
    if "ide worker solved" in dom:
        return
    m = re.search(r"ide worker error:[^<]*", dom)
    if m:
        print(m.group(0), file=sys.stderr)
    fail("browser IDE worker loaded but did not complete the smoke solve")


def write_ide_worker_smoke_page(out, asset_identity):
    smoke = out / "ide-worker-smoke.html"
    smoke.write_text(
        """<!doctype html>
<html>
<body>
<pre id="ide-worker-smoke">starting</pre>
<script type="module">
const status = document.getElementById("ide-worker-smoke");
const setStatus = (text) => { status.textContent = text; };
let finished = false;
let sent = false;

function fail(message) {
  if (finished) return;
  finished = true;
  setStatus(`ide worker error: ${message}`);
  worker.terminate();
}

function complete(message) {
  if (finished) return;
  finished = true;
  setStatus(message);
  worker.terminate();
}

const worker = new Worker(new URL("./ide/assets/%s/simulation-worker.js", import.meta.url), {
  type: "module",
});

const request = {
  id: 314,
  request: { Config: "DcOp" },
  netlist: "* ide worker smoke\\nV1 in 0 1\\nR1 in 0 1k\\n.op\\n.end\\n",
  source_path: null,
};

function sendRequest() {
  if (sent) return;
  sent = true;
  setStatus("ide worker request sent");
  worker.postMessage({ type: "run", id: 314, request });
}

worker.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "ready") {
    sendRequest();
    return;
  }
  if (message.type === "result" && message.id === 314) {
    const response = message.response && message.response.response;
    const outcome = response && response.outcome;
    if (outcome && Object.prototype.hasOwnProperty.call(outcome, "Success")) {
      complete("ide worker solved");
    } else {
      fail(JSON.stringify(outcome || message.response || message));
    }
    return;
  }
  if (message.type === "error") {
    fail(message.error || message.message || "unknown worker error");
  }
});

worker.addEventListener("error", (event) => {
  fail(event.message || "worker error");
});
worker.addEventListener("messageerror", () => {
  fail("worker messageerror");
});
setTimeout(() => {
  if (!finished) fail("timeout");
}, 15000);
</script>
</body>
</html>
""" % asset_identity,
        encoding="utf-8",
    )
    return smoke


def chrome_headless_args(chrome, url, width=1280, height=900):
    return [
        chrome,
        "--headless=new",
        "--no-sandbox",
        "--enable-unsafe-webgpu",
        "--ignore-gpu-blocklist",
        "--enable-features=Vulkan",
        "--use-vulkan=swiftshader",
        "--window-size=%d,%d" % (width, height),
        "--virtual-time-budget=20000",
        "--dump-dom",
        url,
    ]


def dump_chrome_dom(chrome, url, width=1280, height=900):
    try:
        return subprocess.run(
            chrome_headless_args(chrome, url, width, height),
            capture_output=True, text=True, timeout=90).stdout
    except subprocess.TimeoutExpired as e:
        return e.stdout.decode() if isinstance(e.stdout, bytes) else (e.stdout or "")


def headless_solve_gate(out, asset_identity):
    chrome = find_chrome()
    if not chrome:
        fail("no Chrome found for the headless gate "
             "(set CHROME or pass --skip-headless)")

    port = free_port()
    smoke_page = write_ide_worker_smoke_page(out, asset_identity)
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--directory", str(out)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(1)
        # play/index.html runs a transient on load; a healthy bundle yields
        # the "worker ready" badge and a "solved in" log line in the DOM.
        play_url = "http://127.0.0.1:%d/play/" % port
        ide_url = "http://127.0.0.1:%d/ide/" % port
        viewports = (
            ("desktop", 1280, 900),
            ("tablet", 820, 1180),
            ("phone", 390, 844),
        )
        viewport_doms = [
            (
                label,
                dump_chrome_dom(chrome, play_url, width, height),
                dump_chrome_dom(chrome, ide_url, width, height),
            )
            for label, width, height in viewports
        ]
        ide_smoke_dom = dump_chrome_dom(
            chrome, "http://127.0.0.1:%d/ide-worker-smoke.html" % port
        )
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
        smoke_page.unlink(missing_ok=True)

    for label, play_dom, ide_dom in viewport_doms:
        validate_playground_dom(play_dom)
        print("ok: headless solve (%s viewport) - worker ready, transient completed" % label)
        validate_ide_dom(ide_dom)
        print("ok: headless IDE (%s viewport) - route loaded without startup error" % label)
    validate_ide_worker_smoke_dom(ide_smoke_dom)
    print("ok: headless IDE worker - request solved")


def validate_site_source(site_source):
    """Validate the cross-repository static-source boundary before building."""
    if not site_source.is_dir():
        fail("site source directory does not exist: %s" % site_source)
    for required in ("index.html", "404.html"):
        if not (site_source / required).is_file():
            fail("site source is missing required file: %s" % (site_source / required))
    if not (site_source / "assets").is_dir():
        fail("site source is missing required directory: %s" % (site_source / "assets"))
    for reserved in ("ide", "play"):
        if (site_source / reserved).exists():
            fail(
                "site source must not provide the client-owned runtime route '%s/'"
                % reserved
            )
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
    digest.update(b"RSpice IDE executable assets v1\0")
    for name in ("simulation-worker.js", "rspice-ui.js", "rspice-ui_bg.wasm.gz"):
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
            "./assets/" + asset_identity,
        ),
        encoding="utf-8",
    )


def enable_compressed_ide_wasm(ide):
    """Make the release shell fetch and inflate the Pages-safe WASM asset."""
    loader = '''
  async function loadCompressedWasm() {
    const response = await fetch(executableAsset("rspice-ui_bg.wasm.gz"));
    if (!response.ok || !response.body) {
      throw new Error(`Failed to fetch compressed RSpice module (${response.status}).`);
    }
    const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).arrayBuffer();
  }
'''
    index = ide / "index.html"
    source = index.read_text(encoding="utf-8")
    marker = "\n  function showStartupError(message) {"
    if source.count(marker) != 1:
        fail("IDE shell is missing the compressed-WASM insertion point")
    source = source.replace(marker, loader + marker)
    old = '''  const wasmModule = executableAsset("rspice-ui_bg.wasm");
  import(executableAsset("rspice-ui.js").href)
    .then(({ default: init }) => init({ module_or_path: wasmModule }))'''
    new = '''  import(executableAsset("rspice-ui.js").href)
    .then(async ({ default: init }) =>
      init({ module_or_path: await loadCompressedWasm() }),
    )'''
    if source.count(old) != 1:
        fail("IDE shell has an unexpected WASM initialization contract")
    index.write_text(source.replace(old, new), encoding="utf-8")

    worker = ide / "simulation-worker.js"
    source = worker.read_text(encoding="utf-8")
    marker = "\nlet initPromise = null;"
    worker_loader = loader.replace("  async", "async").replace("\n    ", "\n  ")
    if source.count(marker) != 1:
        fail("IDE worker is missing the compressed-WASM insertion point")
    source = source.replace(marker, worker_loader + marker)
    old = '''  const wasmModule = executableAsset("rspice-ui_bg.wasm");
  await module.default({ module_or_path: wasmModule });'''
    new = '''  await module.default({ module_or_path: await loadCompressedWasm() });'''
    if source.count(old) != 1:
        fail("IDE worker has an unexpected WASM initialization contract")
    worker.write_text(source.replace(old, new), encoding="utf-8")


def package_ide_executable_assets(ide):
    """Move fixed-name build outputs behind their immutable bundle digest."""
    staging = ide / ".executable-asset-stage"
    if staging.exists():
        fail("browser executable staging path already exists: %s" % staging)
    staging.mkdir()
    raw_wasm = ide / "pkg" / "rspice-ui_bg.wasm"
    compressed_wasm = ide / "pkg" / "rspice-ui_bg.wasm.gz"
    with raw_wasm.open("rb") as source, compressed_wasm.open("wb") as destination:
        with gzip.GzipFile(fileobj=destination, mode="wb", mtime=0) as archive:
            shutil.copyfileobj(source, archive)
    raw_wasm.unlink()
    enable_compressed_ide_wasm(ide)
    sources = {
        "simulation-worker.js": ide / "simulation-worker.js",
        "rspice-ui.js": ide / "pkg" / "rspice-ui.js",
        "rspice-ui_bg.wasm.gz": compressed_wasm,
    }
    for name, source in sources.items():
        if not source.is_file() or source.is_symlink():
            fail("browser executable build output is missing or unsafe: %s" % source)
        shutil.move(str(source), str(staging / name))

    pkg = ide / "pkg"
    leftovers = list(pkg.iterdir()) if pkg.exists() else []
    if leftovers:
        fail("wasm-bindgen emitted unexpected mutable IDE package files")
    if pkg.exists():
        pkg.rmdir()

    asset_identity = executable_asset_identity(staging)
    destination = ide / "assets" / asset_identity
    destination.parent.mkdir()
    if destination.exists():
        fail("content-addressed browser asset destination already exists: %s" % destination)
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
        ("index.html", "simulation-worker.js"),
    )
    copy_runtime_shell(
        rspice_root / "crates" / "rspice-wasm" / "web",
        out / "play",
        ("index.html", "engine-worker.js"),
    )


def main():
    ap = argparse.ArgumentParser(description="Build, verify, and assemble _site/.")
    ap.add_argument("--skip-headless", action="store_true",
                    help="skip the headless playground solve gate (no local Chrome)")
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
    target = target_root / "wasm32-unknown-unknown" / "release"
    site_source = Path(args.site_source).resolve()
    validate_site_source(site_source)
    out = validated_output_path(site_root, site_source, args.out)
    site_sha = site_source_revision(site_source)
    client_sha = capture(["git", "-C", str(root), "rev-parse", "HEAD"])
    if not re.fullmatch(r"[0-9a-f]{40}", client_sha):
        fail("client source revision is not a full commit SHA")
    require_clean_client_checkout(root)

    # 1. toolchain gate
    locked = locked_wasm_bindgen(root)
    have = installed_wasm_bindgen()
    if locked != have:
        fail("wasm-bindgen CLI is %s but Cargo.lock pins %s" % (have, locked))
    print("ok: wasm-bindgen CLI %s matches Cargo.lock" % have)

    # 2. build
    print("building rspice-ui (browser IDE, bin target)...")
    run(["cargo", "build", "--locked", "-p", "rspice-ui", "--bins",
         "--target", "wasm32-unknown-unknown", "--release"], cwd=root)
    print("building rspice-wasm (engine playground)...")
    run(["cargo", "build", "--locked", "-p", "rspice-wasm", "--lib",
         "--target", "wasm32-unknown-unknown", "--release"], cwd=root)

    # 3. assemble
    assemble_site_sources(site_root, root, site_source, out)

    run(["wasm-bindgen", str(target / "rspice-ui.wasm"),
         "--out-dir", str(out / "ide" / "pkg"),
         "--out-name", "rspice-ui", "--target", "web", "--no-typescript"])
    run(["wasm-bindgen", str(target / "rspice_wasm.wasm"),
         "--out-dir", str(out / "play" / "pkg"),
         "--out-name", "rspice_wasm", "--target", "web", "--no-typescript"])
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
            },
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )

    # 4. static gates
    gate_bundle(out, "ide/assets/%s/rspice-ui" % ide_asset_identity, compressed=True)
    gate_bundle(out, "play/pkg/rspice_wasm")
    if gate_ide_worker(out) != ide_asset_identity:
        fail("IDE shell and executable asset gate disagree on bundle identity")
    gate_ide_worker_sources(root)
    gate_playground_worker(out)

    # 5. headless solve gate
    if args.skip_headless:
        print("skipped: headless solve gate (--skip-headless)")
    else:
        headless_solve_gate(out, ide_asset_identity)

    print(
        "site assembled at %s (client %s, site %s, IDE assets %s)"
        % (out, client_sha, site_sha, ide_asset_identity)
    )


if __name__ == "__main__":
    main()
