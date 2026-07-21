#!/usr/bin/env python3
"""Build both RSpice sources locally and publish a verified static branch."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1]
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
PRODUCTION_BRANCH = "production"
MAX_FILE_BYTES = 25 * 1024 * 1024
MANIFEST_NAME = "release-manifest.json"


def run(
    command: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
) -> None:
    print("+ " + subprocess.list2cmdline(command), flush=True)
    subprocess.run(command, cwd=cwd, env=env, check=True)


def capture(command: list[str], *, cwd: Path | None = None) -> str:
    return subprocess.run(
        command, cwd=cwd, check=True, capture_output=True, text=True
    ).stdout.strip()


def require_program(name: str) -> None:
    if shutil.which(name) is None:
        raise RuntimeError(f"required program is not on PATH: {name}")


def resolve_source(repository: Path, ref: str) -> str:
    repository = repository.resolve()
    if not (repository / ".git").exists():
        raise ValueError(f"source repository does not exist: {repository}")
    run(["git", "worktree", "prune"], cwd=repository)
    run(["git", "fetch", "--quiet", "origin", ref], cwd=repository)
    candidate = ref if SHA_RE.fullmatch(ref) else f"origin/{ref}"
    sha = capture(["git", "rev-parse", f"{candidate}^{{commit}}"], cwd=repository)
    if not SHA_RE.fullmatch(sha):
        raise ValueError(f"source ref did not resolve to a commit: {ref}")
    return sha


def add_worktree(repository: Path, destination: Path, sha: str) -> None:
    run(
        ["git", "worktree", "add", "--quiet", "--detach", str(destination), sha],
        cwd=repository,
    )


def remove_worktree(repository: Path, destination: Path) -> None:
    if destination.exists():
        run(
            ["git", "worktree", "remove", "--force", str(destination)],
            cwd=repository,
        )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def release_files(root: Path) -> list[dict[str, object]]:
    files: list[dict[str, object]] = []
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"release contains a symbolic link: {path}")
        if not path.is_file() or path.name == MANIFEST_NAME:
            continue
        relative = path.relative_to(root).as_posix()
        size = path.stat().st_size
        if size > MAX_FILE_BYTES:
            raise ValueError(f"static host file limit exceeded: {relative} ({size} bytes)")
        lowered = {part.lower() for part in path.relative_to(root).parts}
        if ".git" in lowered or "node_modules" in lowered:
            raise ValueError(f"source metadata leaked into release: {relative}")
        if path.name.lower() in {".env", ".dev.vars", "id_rsa", "id_ed25519"}:
            raise ValueError(f"secret-shaped file is forbidden: {relative}")
        if path.suffix.lower() in {".key", ".pem", ".p12", ".pfx"}:
            raise ValueError(f"secret-shaped file is forbidden: {relative}")
        files.append({"path": relative, "size": size, "sha256": sha256_file(path)})
    return files


def tree_digest(files: list[dict[str, object]]) -> str:
    digest = hashlib.sha256()
    for entry in files:
        digest.update(
            f"{entry['path']}\0{entry['size']}\0{entry['sha256']}\n".encode("utf-8")
        )
    return digest.hexdigest()


def write_and_validate_manifest(
    artifact: Path, site_sha: str, rspice_sha: str
) -> tuple[int, int, str]:
    (artifact / ".nojekyll").write_text("", encoding="utf-8")
    (artifact / "CNAME").write_text("rspice.app\n", encoding="utf-8")
    required = {
        "index.html",
        "404.html",
        "_headers",
        ".nojekyll",
        "CNAME",
        "build.json",
        "workbench/index.html",
        "ide/index.html",
        "play/index.html",
        "play/pkg/rspice_wasm_bg.wasm",
    }
    actual = {
        path.relative_to(artifact).as_posix()
        for path in artifact.rglob("*")
        if path.is_file()
    }
    missing = sorted(required - actual)
    if missing:
        raise ValueError("release is missing required files: " + ", ".join(missing))
    ide_wasm = sorted(artifact.glob("ide/assets/*/rspice-ui_bg.wasm.gz"))
    if len(ide_wasm) != 1:
        raise ValueError("release must contain one compressed, content-addressed IDE WASM")
    if gzip.decompress(ide_wasm[0].read_bytes())[:4] != b"\x00asm":
        raise ValueError(f"invalid compressed WebAssembly module: {ide_wasm[0]}")
    play_wasm = artifact / "play/pkg/rspice_wasm_bg.wasm"
    if play_wasm.read_bytes()[:4] != b"\x00asm":
        raise ValueError(f"invalid WebAssembly module: {play_wasm}")
    build = json.loads((artifact / "build.json").read_text(encoding="utf-8"))
    if build.get("site_source_sha") != site_sha:
        raise ValueError("build artifact has the wrong site revision")
    if build.get("client_source_sha") != rspice_sha:
        raise ValueError("build artifact has the wrong simulator revision")

    files = release_files(artifact)
    digest = tree_digest(files)
    manifest = {
        "schema": 1,
        "sources": {
            "site": {"repository": "JaimeHW/RSpice-Site", "sha": site_sha},
            "rspice": {"repository": "JaimeHW/RSpice", "sha": rspice_sha},
        },
        "build": {
            "built_utc": build.get("built_utc"),
            "publisher": "local-static-branch",
            "rust": capture(["rustc", "--version"]),
        },
        "artifact": {
            "file_count": len(files),
            "byte_count": sum(int(entry["size"]) for entry in files),
            "tree_sha256": digest,
            "files": files,
        },
    }
    (artifact / MANIFEST_NAME).write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    return len(files), manifest["artifact"]["byte_count"], digest


def build_release(
    site: Path,
    rspice: Path,
    site_sha: str,
    rspice_sha: str,
    shared_target: Path,
) -> Path:
    build_environment = os.environ.copy()
    build_environment["CARGO_TARGET_DIR"] = str(shared_target.resolve())
    run(
        [
            sys.executable,
            str(site / "tools" / "build_site.py"),
            "--out",
            "dist",
            "--rspice-source",
            str(rspice),
            "--workbench-source",
            str(site / "public" / "workbench"),
        ],
        cwd=site,
    )
    run(
        [
            sys.executable,
            str(site / "tools" / "build_simulator.py"),
            "--rspice-source",
            str(rspice),
            "--site-source",
            str(site / "dist"),
            "--out",
            "_site-production",
        ],
        cwd=site,
        env=build_environment,
    )
    artifact = site / "_site-production"
    count, byte_count, digest = write_and_validate_manifest(
        artifact, site_sha, rspice_sha
    )
    print(f"verified artifact: {count} files, {byte_count} bytes, tree {digest}")
    return artifact


def clear_publish_tree(root: Path) -> None:
    for child in root.iterdir():
        if child.name == ".git":
            continue
        if child.is_dir() and not child.is_symlink():
            shutil.rmtree(child)
        else:
            child.unlink()


def publish_branch(
    artifact: Path,
    destination: Path,
    remote: str,
    site_sha: str,
    rspice_sha: str,
) -> None:
    run(["git", "init", "--quiet", "--initial-branch", PRODUCTION_BRANCH], cwd=destination)
    run(["git", "remote", "add", "origin", remote], cwd=destination)
    fetched = subprocess.run(
        ["git", "fetch", "--quiet", "--depth=1", "origin", PRODUCTION_BRANCH],
        cwd=destination,
        check=False,
    )
    if fetched.returncode == 0:
        run(
            ["git", "checkout", "--quiet", "-B", PRODUCTION_BRANCH, "FETCH_HEAD"],
            cwd=destination,
        )
    clear_publish_tree(destination)
    shutil.copytree(artifact, destination, dirs_exist_ok=True)
    run(["git", "add", "--all"], cwd=destination)
    if not capture(["git", "status", "--porcelain"], cwd=destination):
        print("production branch already contains the exact artifact")
        return
    run(["git", "config", "user.name", "RSpice Release"], cwd=destination)
    run(["git", "config", "user.email", "release@rspice.app"], cwd=destination)
    run(
        [
            "git",
            "commit",
            "--quiet",
            "-m",
            f"Deploy site {site_sha[:12]} with simulator {rspice_sha[:12]}",
        ],
        cwd=destination,
    )
    run(
        ["git", "push", "origin", f"HEAD:refs/heads/{PRODUCTION_BRANCH}"],
        cwd=destination,
    )


def verify_live(base_url: str, site_sha: str, rspice_sha: str, timeout: int) -> None:
    deadline = time.monotonic() + timeout
    url = base_url.rstrip("/") + "/build.json"
    last_error = "not attempted"
    while time.monotonic() < deadline:
        try:
            request = urllib.request.Request(
                url,
                headers={"Cache-Control": "no-cache", "User-Agent": "RSpice-Deploy/1"},
            )
            with urllib.request.urlopen(request, timeout=20) as response:
                build = json.load(response)
            if (
                build.get("site_source_sha") == site_sha
                and build.get("client_source_sha") == rspice_sha
            ):
                print(f"verified live release at {base_url}")
                return
            last_error = "live revisions do not match the published artifact"
        except (OSError, urllib.error.URLError, json.JSONDecodeError) as error:
            last_error = str(error)
        time.sleep(10)
    raise RuntimeError(f"live verification timed out: {last_error}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "rspice_repository",
        type=Path,
        help="path to the local RSpice simulator Git repository",
    )
    parser.add_argument("--site-ref", default="main")
    parser.add_argument("--rspice-ref", default="main")
    parser.add_argument("--base-url", default="https://rspice.app")
    parser.add_argument("--verify-timeout", type=int, default=600)
    parser.add_argument("--skip-verify", action="store_true")
    parser.add_argument("--build-only", action="store_true")
    args = parser.parse_args()

    for program in ("git", "cargo", "rustc", "wasm-bindgen"):
        require_program(program)
    rspice_repository = args.rspice_repository.resolve()
    site_sha = resolve_source(SITE_ROOT, args.site_ref.lower())
    rspice_sha = resolve_source(rspice_repository, args.rspice_ref.lower())
    remote = capture(["git", "remote", "get-url", "origin"], cwd=SITE_ROOT)
    print(f"site source: {site_sha}")
    print(f"simulator:   {rspice_sha}")

    with tempfile.TemporaryDirectory(prefix="rspice-deploy-") as temporary:
        temporary_root = Path(temporary)
        site_worktree = temporary_root / "site"
        rspice_worktree = temporary_root / "rspice"
        publisher = temporary_root / "publisher"
        publisher.mkdir()
        try:
            add_worktree(SITE_ROOT, site_worktree, site_sha)
            add_worktree(rspice_repository, rspice_worktree, rspice_sha)
            artifact = build_release(
                site_worktree,
                rspice_worktree,
                site_sha,
                rspice_sha,
                rspice_repository / "target",
            )
            if args.build_only:
                print("build-only release passed; nothing was published")
            else:
                publish_branch(artifact, publisher, remote, site_sha, rspice_sha)
        finally:
            remove_worktree(rspice_repository, rspice_worktree)
            remove_worktree(SITE_ROOT, site_worktree)

    if not args.build_only and not args.skip_verify:
        verify_live(args.base_url, site_sha, rspice_sha, args.verify_timeout)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        raise SystemExit(f"deployment failed: {error}") from error
