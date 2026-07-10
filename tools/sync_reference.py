#!/usr/bin/env python3
"""Refresh the checked-in generated reference snapshot from an RSpice checkout."""

from __future__ import annotations

import argparse
from pathlib import Path

from reference_catalog import generate_reference_bundle


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = REPOSITORY_ROOT.parent / "RSpice"
OUTPUT = REPOSITORY_ROOT / "public"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rspice-source", type=Path, default=DEFAULT_SOURCE)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        catalog = generate_reference_bundle(OUTPUT, args.rspice_source)
    except ValueError as exc:
        print(f"reference sync failed: {exc}")
        return 1
    print(
        f"synced generated reference for {catalog['source']['short_revision']} to {OUTPUT}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
