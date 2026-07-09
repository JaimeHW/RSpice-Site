#!/usr/bin/env python3
"""Validate the standalone, static rspice.app source tree."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROUTES = {
    "/ide",
    "/ide/",
    "/play",
    "/play/",
    "ide",
    "ide/",
    "play",
    "play/",
    "./ide/",
    "./play/",
}
HTML_FILES = sorted(ROOT.glob("*.html"))
ERRORS: list[str] = []


def error(path: Path, message: str) -> None:
    ERRORS.append(f"{path.relative_to(ROOT).as_posix()}: {message}")


class PageParser(HTMLParser):
    def __init__(self, path: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids: set[str] = set()
        self.references: list[tuple[str, str, str]] = []
        self.has_lang = False
        self.has_title = False
        self.has_viewport = False

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        values = {name.lower(): value for name, value in attrs}
        if tag == "html" and values.get("lang"):
            self.has_lang = True
        if tag == "meta" and values.get("name", "").lower() == "viewport":
            self.has_viewport = True

        element_id = values.get("id")
        if element_id:
            if element_id in self.ids:
                error(self.path, f"duplicate id '{element_id}'")
            self.ids.add(element_id)

        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.references.append((tag, attribute, value.strip()))

        if values.get("target") == "_blank":
            rel = set((values.get("rel") or "").lower().split())
            if "noopener" not in rel:
                error(self.path, "target='_blank' link is missing rel='noopener'")

    def handle_startendtag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        self.handle_starttag(tag, attrs)

    def handle_data(self, data: str) -> None:
        if self.get_starttag_text() is not None:
            return

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.has_title = True


def local_target(page: Path, raw: str) -> tuple[Path | None, str]:
    if raw in RUNTIME_ROUTES:
        return None, ""
    if raw.startswith("//"):
        return None, ""

    parsed = urlsplit(raw)
    scheme = parsed.scheme.lower()
    if scheme in {"https", "mailto", "tel", "data"}:
        return None, parsed.fragment
    if scheme:
        error(page, f"unsupported or unsafe URL scheme in '{raw}'")
        return None, ""

    path_text = unquote(parsed.path)
    if not path_text:
        return page, parsed.fragment

    if path_text.startswith("/"):
        candidate = ROOT / path_text.lstrip("/")
    else:
        candidate = page.parent / path_text

    try:
        candidate = candidate.resolve()
        candidate.relative_to(ROOT.resolve())
    except (OSError, ValueError):
        error(page, f"local reference escapes the repository: '{raw}'")
        return None, ""

    if path_text.endswith("/"):
        candidate = candidate / "index.html"
    elif not candidate.exists() and candidate.suffix == "":
        html_candidate = candidate.with_suffix(".html")
        if html_candidate.exists():
            candidate = html_candidate

    return candidate, parsed.fragment


def validate_page(path: Path) -> None:
    source = path.read_text(encoding="utf-8")
    if not source.lstrip().lower().startswith("<!doctype html>"):
        error(path, "missing HTML5 doctype")
    if re.search(r"(?:href|src)\s*=\s*['\"]\s*javascript:", source, re.I):
        error(path, "contains a javascript: URL")

    parser = PageParser(path)
    parser.feed(source)
    parser.close()
    if not parser.has_lang:
        error(path, "<html> is missing a lang attribute")
    if "<title>" not in source.lower():
        error(path, "missing a document title")
    if not parser.has_viewport:
        error(path, "missing the viewport meta tag")

    for _tag, _attribute, reference in parser.references:
        target, fragment = local_target(path, reference)
        if target is None:
            continue
        if not target.exists():
            error(path, f"missing local target for '{reference}'")
            continue
        if fragment and target.suffix.lower() == ".html":
            target_source = target.read_text(encoding="utf-8")
            target_parser = PageParser(target)
            target_parser.feed(target_source)
            if fragment not in target_parser.ids:
                error(path, f"missing fragment '#{fragment}' in '{reference}'")


def validate_css_assets() -> None:
    for stylesheet in sorted(ROOT.glob("assets/**/*.css")):
        source = stylesheet.read_text(encoding="utf-8")
        for match in re.finditer(r"url\(\s*(['\"]?)([^)'\"]+)\1\s*\)", source):
            reference = match.group(2).strip()
            if reference.startswith(("data:", "https://")):
                continue
            target = (stylesheet.parent / unquote(urlsplit(reference).path)).resolve()
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                error(stylesheet, f"asset reference escapes the repository: '{reference}'")
                continue
            if not target.exists():
                error(stylesheet, f"missing asset '{reference}'")


def validate_repository_contract() -> None:
    for generated in (ROOT / "ide", ROOT / "play"):
        if generated.exists():
            error(generated, "browser runtime belongs to the client build, not this repository")

    script = (ROOT / "assets" / "site.js").read_text(encoding="utf-8")
    if "innerHTML" in script:
        error(ROOT / "assets" / "site.js", "shared behavior must not inject HTML strings")

    pages = "\n".join(path.read_text(encoding="utf-8") for path in HTML_FILES)
    prohibited_claims = (
        "111 / 113",
        "111/113",
        "2.4 M",
        "< 1e-9 V",
        "the same deck gives the same answer, every time",
        "takes your foundry's .va decks, NDA and all",
        "bring your foundry's .va decks",
        "Cloud simulation runners",
        "On-prem cloud runners",
        "SLAs",
        "escrow",
        "rspice-1.0.0",
    )
    for claim in prohibited_claims:
        if claim in pages:
            error(ROOT / "index.html", f"contains prohibited release claim: {claim!r}")

    required_copy = {
        ROOT / "index.html": (
            "Experimental tablet/mobile preview",
            "repeatable device matrix",
            "supported Verilog-A modules",
            "documented build and thread settings",
            "rspice.app/play",
        ),
        ROOT / "download.html": (
            "web/source available",
            "mobile browser preview",
            "example manifest format",
        ),
        ROOT / "parity.html": (
            "pre-release validation snapshot",
            "static engineering snapshot",
        ),
        ROOT / "changelog.html": (
            "Release candidates",
            "Release targets and history",
        ),
    }
    for path, phrases in required_copy.items():
        source = path.read_text(encoding="utf-8")
        for phrase in phrases:
            if phrase not in source:
                error(path, f"missing required bounded copy: {phrase!r}")


def main() -> int:
    if not HTML_FILES:
        ERRORS.append("no root HTML files found")
    for page in HTML_FILES:
        validate_page(page)
    validate_css_assets()
    validate_repository_contract()

    if ERRORS:
        print("site validation failed:", file=sys.stderr)
        for item in sorted(set(ERRORS)):
            print(f"  - {item}", file=sys.stderr)
        return 1

    print(
        f"site validation passed: {len(HTML_FILES)} pages, "
        f"{sum(1 for _ in (ROOT / 'assets').rglob('*') if _.is_file())} assets"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
