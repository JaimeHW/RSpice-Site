#!/usr/bin/env python3
"""Refresh the checked-in generated reference snapshot from an RSpice checkout."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from reference_catalog import generate_reference_bundle


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = REPOSITORY_ROOT.parent / "RSpice"
OUTPUT = REPOSITORY_ROOT / "public"
SOURCE_REVISION = REPOSITORY_ROOT / "RSPICE_SOURCE_REVISION"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rspice-source", type=Path, default=DEFAULT_SOURCE)
    return parser.parse_args()


def sync_reference(
    rspice_source: Path,
    output: Path = OUTPUT,
    revision_file: Path = SOURCE_REVISION,
) -> dict:
    """Regenerate the snapshot and pin it to the exact inspected revision."""
    catalog = generate_reference_bundle(output, rspice_source)
    revision = catalog.get("source", {}).get("revision", "")
    if not isinstance(revision, str) or not re.fullmatch(r"[0-9a-f]{40}", revision):
        raise ValueError("generated catalog did not report a full lowercase source revision")
    revision_file.write_text(revision + "\n", encoding="utf-8")
    return catalog


def main() -> int:
    args = parse_args()
    try:
        catalog = sync_reference(args.rspice_source)
    except ValueError as exc:
        print(f"reference sync failed: {exc}")
        return 1
    print(
        f"synced generated reference and source pin for "
        f"{catalog['source']['short_revision']} to {OUTPUT}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
