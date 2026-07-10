#!/usr/bin/env python3
"""Refresh the public Workbench snapshot from the existing simulator mockup."""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from build_site import (
    REPOSITORY_ROOT,
    WORKBENCH_ASSET_REWRITES,
    default_workbench_source,
    safe_workbench_source,
)


PUBLIC = REPOSITORY_ROOT / "public"
DESTINATION = PUBLIC / "workbench"
FONT_DESTINATION = PUBLIC / "assets" / "fonts"


def rewrite_asset_urls(destination: Path) -> None:
    counts = {source_url: 0 for source_url in WORKBENCH_ASSET_REWRITES}
    text_files = tuple(destination.rglob("*.html")) + tuple(destination.rglob("*.css"))
    for text_file in text_files:
        content = text_file.read_text(encoding="utf-8")
        rewritten = content
        for source_url, public_url in WORKBENCH_ASSET_REWRITES.items():
            occurrences = rewritten.count(source_url)
            counts[source_url] += occurrences
            rewritten = rewritten.replace(source_url, public_url)
        if rewritten != content:
            text_file.write_text(rewritten, encoding="utf-8", newline="\n")

    missing = [source_url for source_url, count in counts.items() if not count]
    if missing:
        raise ValueError(
            "Workbench source is missing expected asset URL(s): " + ", ".join(missing)
        )


def sync(source: Path) -> None:
    font_source = source.parent / "crates" / "rspice-ui" / "assets" / "fonts"
    destination = DESTINATION.resolve()
    if destination.parent != PUBLIC.resolve() or destination.name != "workbench":
        raise ValueError("refusing unsafe public Workbench destination")
    if DESTINATION.is_symlink() or getattr(DESTINATION, "is_junction", lambda: False)():
        raise ValueError("refusing public Workbench through a link or junction")
    if DESTINATION.exists():
        shutil.rmtree(DESTINATION)
    shutil.copytree(source, DESTINATION, copy_function=shutil.copy2)
    shutil.copytree(
        font_source,
        FONT_DESTINATION,
        copy_function=shutil.copy2,
        dirs_exist_ok=True,
    )
    rewrite_asset_urls(DESTINATION)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--workbench-source",
        type=Path,
        default=default_workbench_source(),
        help="existing Workbench source (default: local sibling or deploy checkout)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        source = safe_workbench_source(args.workbench_source)
        sync(source)
    except (OSError, shutil.Error, ValueError) as exc:
        print(f"Workbench sync failed: {exc}", file=sys.stderr)
        return 1
    print(f"synced existing Workbench mockup to {DESTINATION}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
