#!/usr/bin/env python3
"""Focused tests for source-derived reference and validation parsing."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from reference_catalog import (
    parse_conformance_log,
    parse_markdown_tables,
    require_table,
    render_reference,
    parse_nightly_configuration,
    validation_artifact_data,
    workspace_metadata,
)


class MarkdownTableTests(unittest.TestCase):
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
