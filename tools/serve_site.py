#!/usr/bin/env python3
"""Build the deployable RSpice site, then serve that exact artifact locally."""

from __future__ import annotations

import argparse
import functools
import http.server
import subprocess
import sys
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BUILD_SCRIPT = REPOSITORY_ROOT / "tools" / "build_site.py"


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1", help="bind host")
    parser.add_argument("--port", type=int, default=48917, help="bind port")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("dist"),
        help="repository-local build directory (default: dist)",
    )
    parser.add_argument(
        "--workbench-source",
        type=Path,
        help="existing Workbench mockup source; defaults to build_site.py resolution",
    )
    parser.add_argument(
        "--rspice-source",
        type=Path,
        help="RSpice source used for generated reference data; defaults to build_site.py resolution",
    )
    parser.add_argument(
        "--validation-artifacts",
        type=Path,
        help="optional validation artifact directory to include in the preview",
    )
    parser.add_argument("--validation-run-url")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    command = [sys.executable, str(BUILD_SCRIPT), "--out", str(args.out)]
    if args.workbench_source:
        command.extend(("--workbench-source", str(args.workbench_source)))
    if args.rspice_source:
        command.extend(("--rspice-source", str(args.rspice_source)))
    if args.validation_artifacts:
        command.extend(("--validation-artifacts", str(args.validation_artifacts)))
    if args.validation_run_url:
        command.extend(("--validation-run-url", args.validation_run_url))
    subprocess.run(command, cwd=REPOSITORY_ROOT, check=True)

    output = (REPOSITORY_ROOT / args.out).resolve()
    handler = functools.partial(NoCacheHandler, directory=str(output))
    with http.server.ThreadingHTTPServer((args.host, args.port), handler) as server:
        print(f"Serving {output} at http://{args.host}:{args.port}/")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nPreview server stopped.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
