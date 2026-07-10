#!/usr/bin/env python3
"""Validate and assemble the deployable RSpice static site."""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from check_site import print_result, validate_site


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SOURCE = (REPOSITORY_ROOT / "public").resolve()
DEFAULT_WORKBENCH_SOURCE = (
    REPOSITORY_ROOT.parent
    / "RSpice"
    / "mockups"
    / "rspice-workbench-host"
    / "public"
    / "rspice"
)
WORKBENCH_FILES = ("index.html", "styles.css", "app.js")
WORKBENCH_ASSET_REWRITES = {
    "../../assets/brand/logo.svg": "../assets/brand/logo.svg",
    "../../crates/rspice-ui/assets/fonts/": "fonts/",
}
PROTECTED_PATHS = {
    REPOSITORY_ROOT.resolve(),
    SOURCE,
    (REPOSITORY_ROOT / ".git").resolve(),
    (REPOSITORY_ROOT / ".github").resolve(),
    (REPOSITORY_ROOT / "tools").resolve(),
}


def is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def safe_destination(raw_output: Path) -> Path:
    unresolved = (
        raw_output if raw_output.is_absolute() else REPOSITORY_ROOT / raw_output
    )
    is_junction = getattr(unresolved, "is_junction", lambda: False)
    if unresolved.is_symlink() or is_junction():
        raise ValueError("output must not be a symbolic link or directory junction")
    try:
        output = unresolved.resolve()
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"output cannot be resolved: {exc}") from exc

    if not is_within(output, REPOSITORY_ROOT):
        raise ValueError("output must stay inside the repository")
    if output in PROTECTED_PATHS:
        raise ValueError(f"refusing protected output path: {output}")
    if is_within(output, SOURCE) or is_within(SOURCE, output):
        raise ValueError("output must not contain, equal, or sit inside public/")
    for protected in PROTECTED_PATHS - {REPOSITORY_ROOT, SOURCE}:
        if is_within(output, protected) or is_within(protected, output):
            raise ValueError(
                f"refusing output that overlaps protected path: {protected}"
            )

    relative = output.relative_to(REPOSITORY_ROOT)
    if not relative.parts or relative.parts[0].startswith("."):
        raise ValueError("output must use a non-hidden build directory")
    return output


def safe_workbench_source(raw_source: Path) -> Path:
    is_junction = getattr(raw_source, "is_junction", lambda: False)
    if raw_source.is_symlink() or is_junction():
        raise ValueError("workbench source must not be a symbolic link or directory junction")
    try:
        source = raw_source.resolve()
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"workbench source cannot be resolved: {exc}") from exc
    if not source.is_dir():
        raise ValueError(f"workbench source is not a directory: {source}")
    for name in WORKBENCH_FILES:
        if not (source / name).is_file():
            raise ValueError(f"workbench source is missing required file: {name}")
    font_source = source.parent / "crates" / "rspice-ui" / "assets" / "fonts"
    if not font_source.is_dir():
        raise ValueError(f"workbench source is missing bundled fonts: {font_source}")
    return source


def overlay_workbench(output: Path, source: Path) -> None:
    destination = output / "workbench"
    font_source = source.parent / "crates" / "rspice-ui" / "assets" / "fonts"
    font_destination = destination / "fonts"

    shutil.copytree(source, destination, copy_function=shutil.copy2)
    shutil.copytree(font_source, font_destination, copy_function=shutil.copy2)

    rewrite_counts = {source_url: 0 for source_url in WORKBENCH_ASSET_REWRITES}
    text_files = tuple(destination.rglob("*.html")) + tuple(destination.rglob("*.css"))
    for text_file in text_files:
        content = text_file.read_text(encoding="utf-8")
        rewritten = content
        for source_url, deploy_url in WORKBENCH_ASSET_REWRITES.items():
            occurrences = rewritten.count(source_url)
            if occurrences:
                rewrite_counts[source_url] += occurrences
                rewritten = rewritten.replace(source_url, deploy_url)
        if rewritten != content:
            text_file.write_text(rewritten, encoding="utf-8", newline="\n")

    if not rewrite_counts["../../assets/brand/logo.svg"]:
        raise ValueError("workbench source does not contain the expected brand asset URL")
    if not rewrite_counts["../../crates/rspice-ui/assets/fonts/"]:
        raise ValueError("workbench source does not contain the expected font asset URLs")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        "--output",
        dest="output",
        type=Path,
        default=Path("dist"),
        help="repository-local output directory (default: dist)",
    )
    parser.add_argument(
        "--workbench-source",
        type=Path,
        default=DEFAULT_WORKBENCH_SOURCE,
        help="existing RSpice Workbench static-host source to overlay (default: sibling RSpice mockup host)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        output = safe_destination(args.output)
        workbench_source = safe_workbench_source(args.workbench_source)
    except ValueError as exc:
        print(f"build refused: {exc}", file=sys.stderr)
        return 2

    source_result = validate_site(SOURCE)
    print_result(source_result)
    if not source_result.ok:
        print("build stopped because public/ did not pass validation", file=sys.stderr)
        return 1

    try:
        if output.exists():
            if not output.is_dir():
                print(
                    f"build refused: output exists and is not a directory: {output}",
                    file=sys.stderr,
                )
                return 2
            shutil.rmtree(output)
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(SOURCE, output, copy_function=shutil.copy2)
        overlay_workbench(output, workbench_source)
    except (OSError, shutil.Error) as exc:
        print(f"build failed while assembling {output}: {exc}", file=sys.stderr)
        return 1

    output_result = validate_site(output)
    print_result(output_result)
    if not output_result.ok:
        print("build output failed validation", file=sys.stderr)
        return 1

    print(f"static site built at {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
