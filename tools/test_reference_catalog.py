#!/usr/bin/env python3
"""Focused tests for source-derived reference and validation parsing."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest import mock

from reference_catalog import (
    collect_catalog,
    copy_source_artifacts,
    SOURCE_ARTIFACTS,
    parse_conformance_log,
    parse_markdown_tables,
    require_table,
    render_reference,
    strip_markdown,
    parse_nightly_configuration,
    validation_artifact_data,
    workspace_metadata,
)


class MarkdownTableTests(unittest.TestCase):
    def test_reference_preserves_technical_punctuation(self) -> None:
        self.assertEqual(
            strip_markdown("**Path** `~/runs/*.raw` and `RSPICE_OUTPUT_DIRECTORY` with `a*b`"),
            "Path ~/runs/*.raw and RSPICE_OUTPUT_DIRECTORY with a*b",
        )
        self.assertEqual(strip_markdown("_value_ RSPICE_CONFIG x * y ~~old~~"),
                         "value RSPICE_CONFIG x * y old")
        self.assertEqual(strip_markdown("``a`b_*`` [guide](https://example.test)<br>next &lt; 5"),
                         "a`b_* guide / next < 5")
        self.assertEqual(strip_markdown("**[`RSPICE_CONFIG`](guide.html)** and `[x](y)`"),
                         "RSPICE_CONFIG and [x](y)")

    def test_catalog_preserves_cli_tables_after_sections_are_reorganized(self) -> None:
        inputs = {
            "README.md": "\n".join(
                f"## {heading}\n| {headers} |\n| --- | --- |\n| sample | purpose |"
                for heading, headers in (("Analyses", "Analysis | Trigger"),
                                         ("Devices", "Device | Description"),
                                         ("Command line", "Command | Purpose"),
                                         ("Repository", "Crate | Purpose"))
            ),
            "Cargo.toml": '[workspace.package]\nversion = "1"\nrust-version = "1.94"\n',
            "crates/rspice-cli/README.md": "\n".join(
                f"## {heading}\n| Option | Meaning |\n| --- | --- |\n| {value} | documented |"
                for heading, value in (("How analyses are selected", "--tran"),
                                       ("Output files", "raw"),
                                       ("Configuration file", "RSPICE_CONFIG"),
                                       ("Exit codes", "80"))
            ),
            "tests/ngspice/validation-manifest.tsv": "circuit.cir\top\n",
            "tests/xyce/RSPICE-HARNESS-MANIFEST.tsv": "circuit.cir\ttran\n",
            ".github/workflows/nightly.yml": '# TOTAL +2 tests\nMAX_FAILING: "0"\n',
            "benchmarks/scoreboards/scoreboard.json": "{}",
        }
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary)
            for name, content in inputs.items():
                path = source / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
            with mock.patch("reference_catalog.git_value", side_effect=["", "a" * 40, "2026-09-08"]):
                catalog = collect_catalog(source)
        self.assertEqual([table["rows"][0][0] for table in catalog["cli_tables"]],
                         ["--tran", "raw", "RSPICE_CONFIG", "80"])
        page = render_reference(catalog)
        for value in ("--tran", "raw", "RSPICE_CONFIG", "80"):
            self.assertIn(f"<td>{value}</td>", page)

    def test_repository_table_identity_survives_heading_rename(self) -> None:
        for heading in ("Workspace", "Repository"):
            tables = parse_markdown_tables(f"## {heading}\n| Crate | Purpose |\n| --- | --- |\n| rspice-ui | IDE |\n")
            self.assertEqual(require_table(tables, None, ["Crate", "Purpose"])["rows"], [["rspice-ui", "IDE"]])

    def test_reference_keeps_analysis_notes_visible_and_escaped(self) -> None:
        catalog = {"source": {"repository": "https://example.test", "revision": "a" * 40,
                              "short_revision": "a" * 12, "revision_date": "2026-09-08", "version": "1", "rust_version": "1"},
                   "analyses": [{"Analysis": "Transient", "Invoked by": ".TRAN", "Notes": "limit < 5"}],
                   "devices": [], "commands": [], "workspace": [], "cli_tables": []}
        page = render_reference(catalog)
        self.assertIn("<th>Notes</th>", page)
        self.assertIn("<td>limit &lt; 5</td>", page)

    def test_command_table_is_selected_by_schema_beside_exit_codes(self) -> None:
        tables = parse_markdown_tables("""### Command line
| Command | Purpose |
| --- | --- |
| rspice run | Execute analyses |

| Exit code | Meaning |
| --- | --- |
| 0 | Success |
""")
        self.assertEqual(require_table(tables, "Command line", ["Command", "Purpose"])["rows"],
                         [["rspice run", "Execute analyses"]])
        for invalid in (tables[1:], [*tables, tables[0]]):
            with self.assertRaises(ValueError):
                require_table(invalid, "Command line", ["Command", "Purpose"])

    def test_ignores_fenced_headings_and_uses_nearby_bold_label(self) -> None:
        source = """# CLI
## Commands
```toml
# Not a heading
| fake | table |
| --- | --- |
| no | no |
```
### rspice run
**Analysis-mode options** (selection rules):

| Flag | Description |
| --- | --- |
| `--ac` | Run AC analysis |
"""

        tables = parse_markdown_tables(source)

        self.assertEqual(len(tables), 1)
        self.assertEqual(
            tables[0]["context"],
            "CLI / Commands / rspice run / Analysis-mode options",
        )
        self.assertEqual(tables[0]["rows"], [["--ac", "Run AC analysis"]])


class ValidationParserTests(unittest.TestCase):
    def test_source_downloads_have_identical_bytes_across_checkout_line_endings(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for ending in (b"\n", b"\r\n"):
                for name in SOURCE_ARTIFACTS:
                    source = root / "source" / name
                    source.parent.mkdir(parents=True, exist_ok=True)
                    source.write_bytes(ending.join((b"first", b"second", b"")))
                copy_source_artifacts(root / "source", root / "output")
                for name in SOURCE_ARTIFACTS.values():
                    self.assertEqual((root / "output/reference/raw" / name).read_bytes(),
                                     b"first\nsecond\n")

    def test_parses_nightly_gate_and_conformance_aggregate(self) -> None:
        workflow = 'RUST_TOOLCHAIN: "1.94.0"\nMAX_FAILING: "2"\n# TOTAL +113 tests\n'
        self.assertEqual(
            parse_nightly_configuration(workflow),
            {"configured_total": 113, "max_failing": 2, "rust_toolchain": "1.94.0"},
        )
        self.assertEqual(
            parse_conformance_log("detail\nTOTAL 113 tests: 112 passed, 1 failed\n"),
            {
                "aggregate_found": True,
                "aggregate": "TOTAL 113 tests: 112 passed, 1 failed",
                "total": 113,
                "passed": 112,
                "failed": 1,
            },
        )

    def test_marks_imported_artifacts_against_exact_source_revision(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            (directory / "validation-metadata.json").write_text(
                '{"source_revision":"abc123","run_conclusion":"success","run_url":"https://example.test/run/1"}',
                encoding="utf-8",
            )
            (directory / "conformance.log").write_text(
                "TOTAL 4 tests: 4 passed, 0 failed\n",
                encoding="utf-8",
            )

            result = validation_artifact_data(directory, "abc123", None)

        self.assertTrue(result["available"])
        self.assertTrue(result["revision_match"])
        self.assertEqual(result["run_conclusion"], "success")
        self.assertEqual(result["conformance"]["passed"], 4)


class WorkspaceMetadataTests(unittest.TestCase):
    def test_reads_workspace_version_contract(self) -> None:
        cargo = """[workspace]
members = []

[workspace.package]
version = "0.1.0"
rust-version = "1.94"

[profile.release]
lto = true
"""
        self.assertEqual(
            workspace_metadata(cargo),
            {"version": "0.1.0", "rust_version": "1.94"},
        )


if __name__ == "__main__":
    unittest.main()
