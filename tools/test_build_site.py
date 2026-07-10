#!/usr/bin/env python3
"""Safety and fallback tests for static-site assembly."""

from __future__ import annotations

import unittest

from build_site import SOURCE, safe_destination, safe_workbench_source, workbench_font_source
from sync_workbench import DESTINATION, sync


class BuildBoundaryTests(unittest.TestCase):
    def test_reviewed_workbench_snapshot_is_a_valid_build_source(self) -> None:
        source = safe_workbench_source(SOURCE / "workbench")

        self.assertEqual(source, DESTINATION.resolve())
        self.assertEqual(workbench_font_source(source), SOURCE / "assets" / "fonts")

    def test_sync_never_deletes_its_own_vendor_source(self) -> None:
        with self.assertRaisesRegex(ValueError, "already the public vendor snapshot"):
            sync(DESTINATION.resolve())
        self.assertTrue((DESTINATION / "index.html").is_file())

    def test_build_output_cannot_overlap_public_source(self) -> None:
        with self.assertRaises(ValueError):
            safe_destination(SOURCE)


if __name__ == "__main__":
    unittest.main()
