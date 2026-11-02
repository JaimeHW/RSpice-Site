#!/usr/bin/env python3
"""Tests for the release manifest the application's update check reads."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

import check_site
from check_site import SiteValidator, header_rules, validate_site


PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title></head>
<body><main><h1>{title}</h1>{body}</main></body></html>
"""
MANIFEST = {
    "version": "0.1.0",
    "date": "2026-11-01",
    "download_url": "https://rspice.app/download",
    "notes_url": "https://rspice.app/changelog#v0.1.0",
}


class ReleaseManifestTests(unittest.TestCase):
    def manifest_errors(self, manifest: object, *, raw: str | None = None) -> list[str]:
        """The manifest errors a small site with a 0.1.0 changelog entry reports."""
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "changelog.html").write_text(
                PAGE.format(title="Changelog", body='<section id="v0.1.0"></section>'),
                encoding="utf-8",
            )
            (root / "download.html").write_text(
                PAGE.format(title="Download", body=""), encoding="utf-8"
            )
            releases = root / "releases"
            releases.mkdir()
            text = raw if raw is not None else json.dumps(manifest)
            (releases / "latest.json").write_text(text, encoding="utf-8")
            validator = SiteValidator(root)
            for page in ("changelog.html", "download.html"):
                validator.parse_page(root / page)
            validator.validate_release_manifest(releases / "latest.json")
            return validator.errors

    def test_the_contract_manifest_is_valid(self) -> None:
        self.assertEqual(self.manifest_errors(MANIFEST), [])

    def test_unknown_extra_keys_are_allowed(self) -> None:
        self.assertEqual(self.manifest_errors({**MANIFEST, "channel": "stable"}), [])

    def test_version_must_be_semver(self) -> None:
        for version in ("0.1", "v0.1.0", "01.1.0", "0.1.0-", ""):
            with self.subTest(version=version):
                errors = self.manifest_errors({**MANIFEST, "version": version})
                self.assertTrue(errors, version)
        prerelease = {
            **MANIFEST,
            "version": "0.2.0-rc.1+build.5",
            "notes_url": "https://rspice.app/changelog#v0.2.0-rc.1+build.5",
        }
        self.assertTrue(
            any("missing" in error for error in self.manifest_errors(prerelease)),
            "a valid SemVer version is checked against the changelog entry",
        )

    def test_date_must_be_an_iso_calendar_date(self) -> None:
        for value in ("2026-11-1", "20261101", "2026-13-01", "2026-02-30", "1 Nov 2026"):
            with self.subTest(date=value):
                self.assertTrue(self.manifest_errors({**MANIFEST, "date": value}))

    def test_urls_must_be_https_on_rspice_app_and_name_real_pages(self) -> None:
        for key, url in (
            ("download_url", "http://rspice.app/download"),
            ("download_url", "https://example.com/download"),
            ("download_url", "https://rspice.app:8443/download"),
            ("download_url", "https://rspice.app/download?channel=beta"),
            ("download_url", "https://rspice.app/missing"),
            ("download_url", "https://rspice.app/download#v0.1.0"),
            ("notes_url", "https://rspice.app/changelog.html#v0.1.0"),
            ("notes_url", "/changelog#v0.1.0"),
        ):
            with self.subTest(key=key, url=url):
                self.assertTrue(self.manifest_errors({**MANIFEST, key: url}))

    def test_notes_url_must_name_this_version_entry_in_the_changelog(self) -> None:
        errors = self.manifest_errors(
            {**MANIFEST, "notes_url": "https://rspice.app/changelog#v0.0.9"}
        )
        self.assertTrue(any("#v0.1.0" in error for error in errors), errors)
        errors = self.manifest_errors(
            {
                **MANIFEST,
                "version": "0.2.0",
                "notes_url": "https://rspice.app/changelog#v0.2.0",
            }
        )
        self.assertTrue(any("'#v0.2.0' is missing" in error for error in errors), errors)

    def test_manifest_must_be_a_json_object_with_string_values(self) -> None:
        self.assertTrue(self.manifest_errors(None, raw="not json"))
        self.assertTrue(self.manifest_errors(["0.1.0"]))
        self.assertTrue(self.manifest_errors({**MANIFEST, "version": 1}))
        missing = dict(MANIFEST)
        del missing["date"]
        self.assertTrue(self.manifest_errors(missing))

    def test_missing_manifest_is_reported(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            validator = SiteValidator(Path(temporary))
            validator.validate_release_manifest(Path(temporary) / "releases" / "latest.json")
            self.assertEqual(len(validator.errors), 1)

    def test_release_rule_must_disable_caching(self) -> None:
        rules = header_rules(
            ["/*", "  X-Frame-Options: SAMEORIGIN", "", "/releases/*", "  Cache-Control:  no-cache"]
        )
        self.assertEqual(rules["/releases/*"], ["Cache-Control:  no-cache"])
        with tempfile.TemporaryDirectory() as temporary:
            headers = Path(temporary) / "_headers"
            headers.write_text("/releases/*\n  Cache-Control: max-age=60\n", encoding="utf-8")
            validator = SiteValidator(Path(temporary))
            validator.validate_headers(headers)
            self.assertTrue(any("no-cache" in error for error in validator.errors))

    def test_published_site_manifest_and_headers_are_valid(self) -> None:
        result = validate_site(check_site.DEFAULT_ROOT)
        related = [
            error
            for error in result.errors
            if "release" in error or check_site.RELEASE_HEADERS_RULE in error
        ]
        self.assertEqual(related, [])
        manifest = json.loads(
            (check_site.DEFAULT_ROOT / check_site.RELEASE_MANIFEST).read_text(encoding="utf-8")
        )
        self.assertEqual(sorted(manifest), sorted(MANIFEST))


if __name__ == "__main__":
    unittest.main()
