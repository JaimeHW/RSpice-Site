#!/usr/bin/env python3
"""Generate revision-pinned RSpice reference and validation site artifacts."""

from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import quote


SITE_ORIGIN = "https://rspice.app"
SOURCE_REPOSITORY = "https://github.com/JaimeHW/RSpice"
ALLOWED_CI_SUFFIXES = {".csv", ".json", ".log", ".tap", ".tsv", ".txt", ".xml"}
MAX_CI_ARTIFACT_BYTES = 25 * 1024 * 1024
SOURCE_ARTIFACTS = {
    Path("tests/ngspice/validation-manifest.tsv"): "ngspice-validation-manifest.tsv",
    Path("tests/xyce/RSPICE-HARNESS-MANIFEST.tsv"): "xyce-harness-manifest.tsv",
    Path(".github/workflows/nightly.yml"): "nightly.yml",
    Path("benchmarks/scoreboards/scoreboard.json"): "benchmark-scoreboard.json",
}


def read_utf8(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise ValueError(f"cannot read {path}: {exc}") from exc


def git_value(source: Path, *arguments: str) -> str:
    try:
        completed = subprocess.run(
            ["git", "-C", str(source), *arguments],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=15,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise ValueError(f"cannot inspect source revision at {source}: {exc}") from exc
    return completed.stdout.strip()


def strip_markdown(value: str) -> str:
    value = html.unescape(value.strip())
    value = re.sub(r"!\[([^]]*)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"<br\s*/?>", " / ", value, flags=re.I)
    value = re.sub(r"[`*_~]", "", value)
    value = value.replace("†", "").replace("&rarr;", "→")
    return " ".join(value.split())


def split_markdown_row(line: str) -> list[str]:
    return [strip_markdown(cell) for cell in line.strip().strip("|").split("|")]


def is_table_separator(line: str) -> bool:
    cells = line.strip().strip("|").split("|")
    return bool(cells) and all(re.fullmatch(r"\s*:?-{3,}:?\s*", cell) for cell in cells)


def parse_markdown_tables(text: str) -> list[dict[str, Any]]:
    lines = text.splitlines()
    headings: list[tuple[int, str]] = []
    tables: list[dict[str, Any]] = []
    table_label: str | None = None
    in_fence = False
    index = 0
    while index < len(lines):
        if re.match(r"^\s*```", lines[index]):
            in_fence = not in_fence
            index += 1
            continue
        if in_fence:
            index += 1
            continue
        heading = re.match(r"^(#{1,6})\s+(.+?)\s*$", lines[index])
        if heading:
            level = len(heading.group(1))
            headings = [item for item in headings if item[0] < level]
            headings.append((level, strip_markdown(heading.group(2))))
            table_label = None
            index += 1
            continue
        label = re.match(r"^\s*\*\*(.+?)\*\*(?:\s+.*)?$", lines[index])
        if label:
            table_label = strip_markdown(label.group(1)).rstrip(":")
            index += 1
            continue
        if (
            lines[index].lstrip().startswith("|")
            and index + 1 < len(lines)
            and is_table_separator(lines[index + 1])
        ):
            headers = split_markdown_row(lines[index])
            rows: list[list[str]] = []
            index += 2
            while index < len(lines) and lines[index].lstrip().startswith("|"):
                row = split_markdown_row(lines[index])
                if len(row) == len(headers):
                    rows.append(row)
                index += 1
            tables.append(
                {
                    "context": " / ".join(
                        [title for _level, title in headings]
                        + ([table_label] if table_label else [])
                    ),
                    "headers": headers,
                    "rows": rows,
                }
            )
            table_label = None
            continue
        index += 1
    return tables


def require_table(tables: list[dict[str, Any]], final_heading: str) -> dict[str, Any]:
    matches = [table for table in tables if table["context"].split(" / ")[-1] == final_heading]
    if len(matches) != 1:
        raise ValueError(f"expected exactly one Markdown table under '{final_heading}'")
    return matches[0]


def table_records(table: dict[str, Any]) -> list[dict[str, str]]:
    return [dict(zip(table["headers"], row, strict=True)) for row in table["rows"]]


def workspace_metadata(cargo_toml: str) -> dict[str, str]:
    section_match = re.search(
        r"^\[workspace\.package\]\s*$([\s\S]*?)(?=^\[|\Z)",
        cargo_toml,
        flags=re.M,
    )
    if not section_match:
        raise ValueError("Cargo.toml is missing [workspace.package]")
    section = section_match.group(1)

    def value(name: str) -> str:
        match = re.search(rf'^\s*{re.escape(name)}\s*=\s*"([^"]+)"', section, flags=re.M)
        if not match:
            raise ValueError(f"Cargo.toml workspace package is missing {name}")
        return match.group(1)

    return {"version": value("version"), "rust_version": value("rust-version")}


def parse_tsv(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for line in read_utf8(path).splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 2:
            raise ValueError(f"invalid TSV row in {path}: {line}")
        rows.append({"path": parts[0].strip(), "mode": parts[1].strip()})
    return rows


def parse_nightly_configuration(text: str) -> dict[str, Any]:
    total_match = re.search(r"TOTAL \+(\d+) tests", text)
    failing_match = re.search(r'MAX_FAILING:\s*"(\d+)"', text)
    toolchain_match = re.search(r'RUST_TOOLCHAIN:\s*"([^"]+)"', text)
    if not total_match or not failing_match:
        raise ValueError("nightly workflow is missing the conformance total or failure watermark")
    return {
        "configured_total": int(total_match.group(1)),
        "max_failing": int(failing_match.group(1)),
        "rust_toolchain": toolchain_match.group(1) if toolchain_match else None,
    }


def parse_conformance_log(text: str) -> dict[str, Any]:
    aggregate = next(
        (line.strip() for line in text.splitlines() if re.match(r"^TOTAL\s+\d+\s+tests", line)),
        None,
    )
    if not aggregate:
        return {"aggregate_found": False}
    total = re.search(r"TOTAL\s+(\d+)\s+tests", aggregate)
    passed = re.search(r"(\d+)\s+passed", aggregate)
    failed = re.search(r"(\d+)\s+failed", aggregate)
    return {
        "aggregate_found": True,
        "aggregate": aggregate,
        "total": int(total.group(1)) if total else None,
        "passed": int(passed.group(1)) if passed else None,
        "failed": int(failed.group(1)) if failed else None,
    }


def parse_junit_files(paths: Iterable[Path]) -> dict[str, int]:
    totals = Counter({"files": 0, "tests": 0, "failures": 0, "errors": 0, "skipped": 0})
    for path in paths:
        try:
            root = ET.parse(path).getroot()
        except (OSError, ET.ParseError):
            continue
        if root.tag not in {"testsuite", "testsuites"}:
            continue
        totals["files"] += 1
        suites = [root] if root.tag == "testsuite" else list(root.findall("testsuite"))
        for suite in suites:
            for key in ("tests", "failures", "errors", "skipped"):
                try:
                    totals[key] += int(suite.attrib.get(key, "0"))
                except ValueError:
                    pass
    return dict(totals)


def safe_ci_files(directory: Path) -> list[Path]:
    directory = directory.resolve()
    files: list[Path] = []
    for path in sorted(directory.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in ALLOWED_CI_SUFFIXES:
            continue
        is_junction = getattr(path, "is_junction", lambda: False)
        if path.is_symlink() or is_junction():
            raise ValueError(f"validation artifact must not be a link or junction: {path}")
        try:
            resolved = path.resolve(strict=True)
            resolved.relative_to(directory)
        except (OSError, RuntimeError, ValueError) as exc:
            raise ValueError(f"validation artifact escapes its input directory: {path}") from exc
        if resolved.stat().st_size > MAX_CI_ARTIFACT_BYTES:
            raise ValueError(f"validation artifact exceeds 25 MiB: {path}")
        files.append(resolved)
    return files


def validation_artifact_data(directory: Path | None, revision: str, run_url: str | None) -> dict[str, Any]:
    result: dict[str, Any] = {
        "available": False,
        "revision_match": None,
        "run_url": run_url,
        "run_conclusion": None,
        "source_revision": None,
        "conformance": {"aggregate_found": False},
        "junit": {"files": 0, "tests": 0, "failures": 0, "errors": 0, "skipped": 0},
        "files": [],
    }
    if directory is None or not directory.is_dir():
        return result
    directory = directory.resolve()

    files = safe_ci_files(directory)
    if not files:
        return result

    metadata_path = next((path for path in files if path.name == "validation-metadata.json"), None)
    if metadata_path:
        try:
            metadata = json.loads(read_utf8(metadata_path))
        except json.JSONDecodeError as exc:
            raise ValueError(f"invalid validation metadata JSON: {exc}") from exc
        result["source_revision"] = metadata.get("source_revision")
        result["run_conclusion"] = metadata.get("run_conclusion")
        result["run_url"] = metadata.get("run_url") or run_url
        if result["source_revision"]:
            result["revision_match"] = result["source_revision"] == revision

    conformance_path = next((path for path in files if path.name == "conformance.log"), None)
    if conformance_path:
        result["conformance"] = parse_conformance_log(read_utf8(conformance_path))
    result["junit"] = parse_junit_files(path for path in files if path.suffix.lower() == ".xml")
    result["files"] = [path.relative_to(directory).as_posix() for path in files]
    result["available"] = True
    return result


def collect_catalog(
    source: Path,
    validation_artifacts: Path | None = None,
    validation_run_url: str | None = None,
) -> dict[str, Any]:
    source = source.resolve()
    required_relative = [
        Path("README.md"),
        Path("Cargo.toml"),
        Path("crates/rspice-cli/README.md"),
        Path("tests/ngspice/validation-manifest.tsv"),
        Path("tests/xyce/RSPICE-HARNESS-MANIFEST.tsv"),
        Path(".github/workflows/nightly.yml"),
        Path("benchmarks/scoreboards/scoreboard.json"),
    ]
    required = [source / relative for relative in required_relative]
    missing = [path for path in required if not path.is_file()]
    if missing:
        raise ValueError(f"RSpice source is missing required catalog input: {missing[0]}")
    dirty = git_value(
        source,
        "status",
        "--porcelain=v1",
        "--untracked-files=all",
        "--",
        *(relative.as_posix() for relative in required_relative),
    )
    if dirty:
        first_dirty = dirty.splitlines()[0]
        raise ValueError(
            f"catalog inputs differ from the source revision ({first_dirty}); commit or restore them before generation"
        )

    readme = read_utf8(source / "README.md")
    cli_readme = read_utf8(source / "crates/rspice-cli/README.md")
    root_tables = parse_markdown_tables(readme)
    cli_tables = parse_markdown_tables(cli_readme)
    revision = git_value(source, "rev-parse", "HEAD")
    revision_date = git_value(source, "show", "-s", "--format=%cI", "HEAD")
    workspace = workspace_metadata(read_utf8(source / "Cargo.toml"))
    ngspice_manifest = parse_tsv(source / "tests/ngspice/validation-manifest.tsv")
    xyce_manifest = parse_tsv(source / "tests/xyce/RSPICE-HARNESS-MANIFEST.tsv")
    nightly = parse_nightly_configuration(read_utf8(source / ".github/workflows/nightly.yml"))
    try:
        benchmarks = json.loads(read_utf8(source / "benchmarks/scoreboards/scoreboard.json"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"invalid benchmark scoreboard JSON: {exc}") from exc

    useful_cli_tables = [
        table
        for table in cli_tables
        if table["rows"]
        and any(
            marker in table["context"]
            for marker in ("Commands", "Configuration File", "Exit Codes")
        )
    ]

    return {
        "schema_version": 1,
        "source": {
            "repository": SOURCE_REPOSITORY,
            "revision": revision,
            "short_revision": revision[:12],
            "revision_date": revision_date,
            **workspace,
        },
        "analyses": table_records(require_table(root_tables, "Analyses")),
        "devices": table_records(require_table(root_tables, "Devices")),
        "commands": table_records(require_table(root_tables, "Command line")),
        "workspace": table_records(require_table(root_tables, "Workspace")),
        "cli_tables": useful_cli_tables,
        "validation": {
            "nightly": nightly,
            "ngspice_manifest": {
                "entries": len(ngspice_manifest),
                "modes": dict(sorted(Counter(row["mode"] for row in ngspice_manifest).items())),
            },
            "xyce_manifest": {
                "entries": len(xyce_manifest),
                "contracts": dict(sorted(Counter(row["mode"] for row in xyce_manifest).items())),
            },
            "ci": validation_artifact_data(validation_artifacts, revision, validation_run_url),
        },
        "benchmarks": benchmarks,
    }


def escape(value: Any) -> str:
    return html.escape(str(value), quote=True)


def search_text(*values: Any) -> str:
    return " ".join(str(value) for value in values).lower()


def format_decimal(value: Any, places: int = 3) -> str:
    try:
        return f"{float(value):.{places}f}"
    except (TypeError, ValueError):
        return ""


def common_head(title: str, description: str, canonical_path: str, extra: str = "") -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090b0d">
  <meta name="color-scheme" content="dark">
  <title>{escape(title)} &mdash; RSpice</title>
  <meta name="description" content="{escape(description)}">
  <link rel="canonical" href="{SITE_ORIGIN}/{escape(canonical_path)}">
  <link rel="icon" href="assets/brand/rspice.ico" sizes="any">
  <link rel="apple-touch-icon" href="assets/brand/icon-256.png">
  <link rel="stylesheet" href="assets/field.css">
  <link rel="stylesheet" href="assets/technical.css">
  <link rel="stylesheet" href="assets/interior-refined.css">
  <link rel="stylesheet" href="assets/reference.css">
{extra}
  <meta property="og:type" content="website">
  <meta property="og:title" content="{escape(title)} — RSpice">
  <meta property="og:description" content="{escape(description)}">
  <meta property="og:image" content="{SITE_ORIGIN}/assets/og.png">
</head>"""


def common_navigation(current: str) -> str:
    reference_current = ' aria-current="page"' if current == "reference" else ""
    validation_current = ' aria-current="page"' if current == "validation" else ""
    return f"""<a class="skip-link" href="#main">Skip to main content</a>
  <header class="topbar" data-topbar>
    <div class="topbar__inner">
      <a class="identity" href="index.html" aria-label="RSpice home"><img src="assets/brand/logo.svg" width="31" height="31" alt=""><span>RSpice</span></a>
      <button class="nav-trigger" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-trigger><span class="visually-hidden">Open navigation</span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation" data-site-nav><a href="index.html#engine">Engine</a><a href="index.html#analyses">Analyses</a><a href="index.html#truth">Status</a><a href="reference.html"{reference_current}>Reference</a><a href="validation.html"{validation_current}>Validation</a><a href="docs.html">Docs</a></nav>
      <div class="topbar__actions"><a class="source-link" href="https://github.com/JaimeHW/RSpice" target="_blank" rel="noopener">Source <span aria-hidden="true">&nearr;</span></a><a class="launch-link" href="ide/">Open WASM lab <span class="launch-link__tag">experimental</span></a></div>
    </div>
  </header>"""


def common_footer() -> str:
    return """<footer class="footer">
    <div class="page-frame footer__grid">
      <div class="footer__identity"><a class="identity" href="index.html"><img src="assets/brand/logo.svg" width="31" height="31" alt=""><span>RSpice</span></a><p>Rust circuit simulator with desktop, CLI, Python, and WebAssembly interfaces.</p></div>
      <div><h2>Technical</h2><a href="reference.html">Generated reference</a><a href="validation.html">Validation status</a><a href="parity.html">Methodology</a><a href="docs.html">Scope and builds</a></div>
      <div><h2>Project</h2><a href="changelog.html">Development record</a><a href="download.html">Build from source</a><a href="early-access.html">Early access</a><a href="privacy.html">Privacy</a></div>
      <div><h2>Contact</h2><a href="mailto:hello@rspice.app">General</a><a href="mailto:sales@rspice.app">Commercial</a><a href="https://github.com/JaimeHW/RSpice-Site/security" target="_blank" rel="noopener">Security</a></div>
    </div>
    <div class="page-frame footer__base"><span>&copy; <span data-year>2026</span> RSpice</span><span>SOURCE BUILD / HOSTED SERVICES NOT ACTIVE</span><span>IBM Plex under SIL OFL</span></div>
  </footer>"""


def render_reference(catalog: dict[str, Any]) -> str:
    source = catalog["source"]
    revision_url = f"{source['repository']}/commit/{source['revision']}"
    rows: list[str] = []
    item_count = 0

    for record in catalog["analyses"]:
        item_count += 1
        values = list(record.values())
        rows.append(
            f'<tr data-reference-item data-search-text="{escape(search_text(*values))}"><td>{escape(values[0])}</td><td><code>{escape(values[1])}</code></td></tr>'
        )
    analysis_rows = "\n".join(rows)

    rows = []
    for record in catalog["devices"]:
        item_count += 1
        values = list(record.values())
        rows.append(
            f'<tr data-reference-item data-search-text="{escape(search_text(*values))}"><td>{escape(values[0])}</td><td>{escape(values[1])}</td></tr>'
        )
    device_rows = "\n".join(rows)

    rows = []
    for record in catalog["commands"]:
        item_count += 1
        values = list(record.values())
        rows.append(
            f'<tr data-reference-item data-search-text="{escape(search_text(*values))}"><td><code>{escape(values[0])}</code></td><td>{escape(values[1])}</td></tr>'
        )
    command_rows = "\n".join(rows)

    rows = []
    for record in catalog["workspace"]:
        item_count += 1
        values = list(record.values())
        rows.append(
            f'<tr data-reference-item data-search-text="{escape(search_text(*values))}"><td><code>{escape(values[0])}</code></td><td>{escape(values[1])}</td></tr>'
        )
    workspace_rows = "\n".join(rows)

    cli_groups: list[str] = []
    for table in catalog["cli_tables"]:
        table_rows = []
        for record in table_records(table):
            item_count += 1
            values = list(record.values())
            cells = "".join(f"<td>{escape(value)}</td>" for value in values)
            table_rows.append(
                f'<tr data-reference-item data-search-text="{escape(search_text(table["context"], *values))}">{cells}</tr>'
            )
        headers = "".join(f"<th>{escape(header)}</th>" for header in table["headers"])
        cli_groups.append(
            f"""<details class="reference-group" data-reference-group>
              <summary>{escape(table['context'])}<span>{len(table['rows'])} entries</span></summary>
              <div class="technical-table-wrap"><table class="technical-table"><thead><tr>{headers}</tr></thead><tbody>{''.join(table_rows)}</tbody></table></div>
            </details>"""
        )

    description = "Revision-pinned RSpice analyses, device models, CLI commands, options, interfaces, and workspace packages."
    return f"""{common_head('Generated technical reference', description, 'reference')}
<body class="technical-page reference-page">
  {common_navigation('reference')}
  <main id="main">
    <header class="technical-hero">
      <div class="page-frame technical-hero__grid">
        <div><p class="eyebrow">RSPICE / GENERATED REFERENCE</p><h1>Search the source-defined analysis, model, CLI, and interface catalog.</h1><p class="technical-hero__lede">Generated from commit <a href="{escape(revision_url)}" target="_blank" rel="noopener"><code>{escape(source['short_revision'])}</code></a>. The checked-in snapshot is regenerated during site builds and compared in CI.</p></div>
        <dl class="technical-hero__ledger" aria-label="Reference source revision"><div><dt>SOURCE REVISION</dt><dd>{escape(source['short_revision'])}</dd></div><div><dt>COMMIT DATE</dt><dd>{escape(source['revision_date'][:10])}</dd></div><div><dt>WORKSPACE VERSION</dt><dd>{escape(source['version'])}</dd></div><div><dt>RUST VERSION</dt><dd>{escape(source['rust_version'])}</dd></div></dl>
      </div>
    </header>
    <div class="page-frame reference-layout">
      <section class="reference-search" aria-labelledby="reference-search-title"><div><p class="technical-number">CATALOG SEARCH</p><h2 id="reference-search-title">Filter {item_count} generated entries.</h2></div><label><span class="visually-hidden">Search technical reference</span><input type="search" placeholder="Try BSIM4, --timeout, PSS, JUnit…" autocomplete="off" spellcheck="false" data-reference-search></label><p data-reference-count>{item_count} entries shown</p></section>
      <section class="reference-section" data-reference-section id="analyses"><header><div><p class="technical-number">01 / ANALYSES</p><h2>Analysis families</h2></div></header><div class="technical-table-wrap"><table class="technical-table"><thead><tr><th>DOMAIN</th><th>ANALYSES</th></tr></thead><tbody>{analysis_rows}</tbody></table></div></section>
      <section class="reference-section" data-reference-section id="devices"><header><div><p class="technical-number">02 / DEVICES</p><h2>Device and compact-model families</h2></div></header><div class="technical-table-wrap"><table class="technical-table"><thead><tr><th>FAMILY</th><th>MODELS</th></tr></thead><tbody>{device_rows}</tbody></table></div></section>
      <section class="reference-section" data-reference-section id="commands"><header><div><p class="technical-number">03 / CLI COMMANDS</p><h2>Top-level commands</h2></div></header><div class="technical-table-wrap"><table class="technical-table"><thead><tr><th>COMMAND</th><th>DESCRIPTION</th></tr></thead><tbody>{command_rows}</tbody></table></div></section>
      <section class="reference-section" data-reference-section id="options"><header><div><p class="technical-number">04 / CLI OPTIONS</p><h2>Command options, configuration, and exit codes</h2></div></header>{''.join(cli_groups)}</section>
      <section class="reference-section" data-reference-section id="workspace"><header><div><p class="technical-number">05 / WORKSPACE</p><h2>Rust packages and interfaces</h2></div></header><div class="technical-table-wrap"><table class="technical-table"><thead><tr><th>CRATE</th><th>PURPOSE</th></tr></thead><tbody>{workspace_rows}</tbody></table></div><div class="reference-downloads"><a href="reference/catalog.json">Download catalog JSON</a><a href="validation.html">Open validation status</a><a href="{escape(revision_url)}" target="_blank" rel="noopener">Inspect source commit <span aria-hidden="true">&nearr;</span></a></div></section>
    </div>
  </main>
  {common_footer()}
  <script src="assets/reference.js" defer></script>
  <script src="assets/field.js" defer></script>
</body>
</html>
"""


def render_validation(catalog: dict[str, Any], copied_ci_files: list[dict[str, Any]]) -> str:
    source = catalog["source"]
    validation = catalog["validation"]
    nightly = validation["nightly"]
    ci = validation["ci"]
    revision_url = f"{source['repository']}/commit/{source['revision']}"

    if not ci["available"]:
        ci_label = "NOT IMPORTED"
        ci_copy = "No matching nightly artifact was supplied to this build. The page below reports source-controlled manifests and gate configuration, not a current pass result."
    elif ci["revision_match"] is False:
        ci_label = "REVISION MISMATCH"
        ci_copy = "Validation artifacts were present but identify a different source revision, so they are published only as raw files and not treated as results for this catalog."
    elif ci["revision_match"] is not True:
        ci_label = "UNPINNED ARTIFACT"
        ci_copy = "Validation artifacts were present without an exact source revision, so they are published only as raw files and not treated as results for this catalog."
    else:
        ci_label = escape((ci.get("run_conclusion") or "IMPORTED").upper())
        conformance = ci["conformance"]
        if conformance.get("aggregate_found"):
            ci_copy = f"Imported aggregate: {escape(conformance['aggregate'])}."
        else:
            ci_copy = "Validation artifacts were imported for this revision, but no ngspice aggregate row was found in conformance.log."

    mode_rows = "".join(
        f"<tr><td>{escape(mode)}</td><td>{count}</td></tr>"
        for mode, count in validation["ngspice_manifest"]["modes"].items()
    )
    benchmark_rows = "".join(
        f"<tr><td>{escape(result.get('deck'))}</td><td>{format_decimal(result.get('rspice_ms', {}).get('median'))}</td><td>{format_decimal(result.get('ngspice_ms', {}).get('median'))}</td><td>{format_decimal(result.get('speedup_median'))}</td></tr>"
        for result in catalog.get("benchmarks", {}).get("results", [])
    )
    artifact_links = "".join(
        f'<li><a href="{escape(item["href"])}">{escape(item["label"])}</a><span>{escape(item["bytes"])} bytes</span></li>'
        for item in copied_ci_files
    ) or "<li><span>No CI artifact files imported for this build.</span></li>"
    run_link = (
        f'<a class="button button--quiet" href="{escape(ci["run_url"])}" target="_blank" rel="noopener">Open workflow run <span aria-hidden="true">&nearr;</span></a>'
        if ci.get("run_url")
        else ""
    )

    description = "Revision-pinned RSpice validation configuration, manifest inventory, imported CI results, raw artifacts, and benchmark context."
    return f"""{common_head('Validation status', description, 'validation')}
<body class="technical-page validation-page">
  {common_navigation('validation')}
  <main id="main">
    <header class="technical-hero"><div class="page-frame technical-hero__grid"><div><p class="eyebrow">RSPICE / REVISION-PINNED VALIDATION</p><h1>Configured gates, imported CI results, and raw validation files.</h1><p class="technical-hero__lede">Every count on this page is tied to source commit <a href="{escape(revision_url)}" target="_blank" rel="noopener"><code>{escape(source['short_revision'])}</code></a>. Missing CI data stays missing instead of being replaced with an unversioned percentage.</p></div><dl class="technical-hero__ledger"><div><dt>SOURCE REVISION</dt><dd>{escape(source['short_revision'])}</dd></div><div><dt>NGSPICE GATE</dt><dd>{nightly['configured_total']} decks / ≤ {nightly['max_failing']} failing</dd></div><div><dt>XYCE CONTRACTS</dt><dd>{validation['xyce_manifest']['entries']} manifest entries</dd></div><div><dt>CI ARTIFACT</dt><dd>{ci_label}</dd></div></dl></div></header>
    <div class="page-frame validation-layout">
      <section class="validation-status"><div><p class="technical-number">IMPORTED RUN STATUS</p><h2>{ci_label}</h2><p>{ci_copy}</p></div><div class="technical-actions">{run_link}<a class="button button--quiet" href="reference/catalog.json">Catalog JSON</a></div></section>
      <section class="reference-section"><header><div><p class="technical-number">01 / SOURCE-CONTROLLED GATES</p><h2>Nightly and corpus configuration</h2></div></header><div class="technical-grid technical-grid--three"><article><span>NGSPICE</span><h3>{nightly['configured_total']} aggregate decks</h3><p>The nightly ratchet allows no more than {nightly['max_failing']} failing decks and fails if the aggregate row or pinned deck count disappears.</p></article><article><span>NGSPICE MANIFEST</span><h3>{validation['ngspice_manifest']['entries']} classified entries</h3><p>Modes distinguish numeric comparison, smoke execution, locked grids, engineering measures, and expected unsupported or unsolvable cases.</p></article><article><span>XYCE MANIFEST</span><h3>{validation['xyce_manifest']['entries']} retained contracts</h3><p>Wrapper-dependent Xyce decks stay listed until their upstream runner behavior is implemented.</p></article></div></section>
      <section class="reference-section"><header><div><p class="technical-number">02 / NGSPICE MANIFEST</p><h2>Classification counts</h2></div></header><div class="technical-table-wrap"><table class="technical-table"><thead><tr><th>MODE</th><th>ENTRIES</th></tr></thead><tbody>{mode_rows}</tbody></table></div></section>
      <section class="reference-section"><header><div><p class="technical-number">03 / IMPORTED ARTIFACTS</p><h2>Machine-readable and raw files</h2></div></header><ul class="artifact-list">{artifact_links}</ul><div class="reference-downloads"><a href="reference/raw/ngspice-validation-manifest.tsv">ngspice manifest</a><a href="reference/raw/xyce-harness-manifest.tsv">Xyce manifest</a><a href="reference/raw/nightly.yml">nightly workflow</a><a href="reference/catalog.json">full catalog JSON</a></div></section>
      <section class="reference-section"><header><div><p class="technical-number">04 / SOURCE-CONTROLLED BENCHMARK</p><h2>Published scoreboard context</h2></div><p class="reference-section__lede">These timings come from the source-controlled scoreboard, not the imported CI run. Host, executable paths, repeat count, and methodology remain in the raw JSON.</p></header><div class="technical-table-wrap"><table class="technical-table"><thead><tr><th>DECK</th><th>RSPICE MEDIAN MS</th><th>NGSPICE MEDIAN MS</th><th>NGSPICE / RSPICE</th></tr></thead><tbody>{benchmark_rows}</tbody></table></div><div class="reference-downloads"><a href="reference/raw/benchmark-scoreboard.json">Download scoreboard JSON</a><a href="parity.html">Read validation methodology</a></div></section>
    </div>
  </main>
  {common_footer()}
  <script src="assets/field.js" defer></script>
</body>
</html>
"""


def copy_source_artifacts(source: Path, output: Path) -> None:
    raw = output / "reference" / "raw"
    raw.mkdir(parents=True, exist_ok=True)
    for relative, destination_name in SOURCE_ARTIFACTS.items():
        shutil.copy2(source / relative, raw / destination_name)


def copy_ci_artifacts(directory: Path | None, output: Path) -> list[dict[str, Any]]:
    if directory is None or not directory.is_dir():
        return []
    directory = directory.resolve()
    destination = output / "reference" / "raw" / "ci"
    copied: list[dict[str, Any]] = []
    for source in safe_ci_files(directory):
        relative = source.relative_to(directory)
        if any(part in {".", ".."} for part in relative.parts):
            continue
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied.append(
            {
                "label": relative.as_posix(),
                "href": f"reference/raw/ci/{quote(relative.as_posix(), safe='/')}",
                "bytes": target.stat().st_size,
            }
        )
    return copied


def generate_reference_bundle(
    output: Path,
    source: Path,
    validation_artifacts: Path | None = None,
    validation_run_url: str | None = None,
) -> dict[str, Any]:
    output = output.resolve()
    source = source.resolve()
    catalog = collect_catalog(source, validation_artifacts, validation_run_url)
    reference_dir = output / "reference"
    if reference_dir.is_symlink() or getattr(reference_dir, "is_junction", lambda: False)():
        raise ValueError("reference output must not be a link or directory junction")
    if reference_dir.exists():
        if not reference_dir.is_dir():
            raise ValueError("reference output exists and is not a directory")
        shutil.rmtree(reference_dir)
    reference_dir.mkdir(parents=True, exist_ok=True)
    copy_source_artifacts(source, output)
    ci_files = copy_ci_artifacts(validation_artifacts, output)
    (reference_dir / "catalog.json").write_text(
        json.dumps(catalog, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    (output / "reference.html").write_text(
        render_reference(catalog), encoding="utf-8", newline="\n"
    )
    (output / "validation.html").write_text(
        render_validation(catalog, ci_files), encoding="utf-8", newline="\n"
    )
    return catalog


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rspice-source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--validation-artifacts", type=Path)
    parser.add_argument("--validation-run-url")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        catalog = generate_reference_bundle(
            args.output,
            args.rspice_source,
            args.validation_artifacts,
            args.validation_run_url,
        )
    except ValueError as exc:
        print(f"reference generation failed: {exc}")
        return 1
    print(
        f"generated reference for {catalog['source']['short_revision']} at {args.output.resolve()}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
