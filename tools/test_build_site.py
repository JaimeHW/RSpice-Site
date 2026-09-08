#!/usr/bin/env python3
"""Safety and fallback tests for static-site assembly."""

from __future__ import annotations

import unittest
import tempfile
from pathlib import Path
from unittest import mock

import build_site
from build_site import SOURCE, safe_destination, safe_workbench_source, workbench_font_source
from sync_workbench import DESTINATION, sync


class BuildBoundaryTests(unittest.TestCase):
    def test_incomplete_local_mockup_uses_the_reviewed_vendor_source(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "site"
            public = root / "public"
            vendor = public / "workbench"
            vendor.mkdir(parents=True)
            local = root.parent / "RSpice" / build_site.WORKBENCH_SOURCE_SUFFIX
            local.mkdir(parents=True)
            (local / "index.html").write_text("split module mockup", encoding="utf-8")
            for name in build_site.WORKBENCH_FILES:
                (vendor / name).write_text("reviewed fixture", encoding="utf-8")
            with mock.patch.object(build_site, "REPOSITORY_ROOT", root), mock.patch.object(build_site, "SOURCE", public):
                self.assertEqual(build_site.default_workbench_source(), vendor)
                for name in build_site.WORKBENCH_FILES:
                    (local / name).write_text("compatible fixture", encoding="utf-8")
                self.assertEqual(build_site.default_workbench_source(), local)

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
