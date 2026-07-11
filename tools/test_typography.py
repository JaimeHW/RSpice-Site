#!/usr/bin/env python3
"""Readability contracts for the static website typography."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
MINIMUM_TEXT_SIZE_PX = 10.0
DECORATIVE_EXCEPTIONS = {".engine__matrix li::before"}

BLOCK_PATTERN = re.compile(r"([^{}]+)\{([^{}]*)\}")
PIXEL_FONT_PATTERN = re.compile(
    r"(?:font-size\s*:\s*|font\s*:\s*)(\d+(?:\.\d+)?)px",
    re.IGNORECASE,
)


class TypographyContractTests(unittest.TestCase):
    def test_website_text_never_drops_below_readability_floor(self) -> None:
        violations: list[str] = []

        for stylesheet in sorted(ASSETS.glob("*.css")):
            source = stylesheet.read_text(encoding="utf-8")
            for raw_selector, declarations in BLOCK_PATTERN.findall(source):
                selector = raw_selector.strip()
                sizes = [float(value) for value in PIXEL_FONT_PATTERN.findall(declarations)]
                for size in sizes:
                    if size >= MINIMUM_TEXT_SIZE_PX or selector in DECORATIVE_EXCEPTIONS:
                        continue
                    violations.append(f"{stylesheet.name}: {selector} uses {size:g}px")

        self.assertEqual(
            violations,
            [],
            "Website text must remain at least 10px; use a decorative exception only "
            f"for non-text glyphs. Violations: {violations}",
        )


if __name__ == "__main__":
    unittest.main()
