#!/usr/bin/env python3
"""Validate an RSpice static-site tree using only the Python standard library."""

from __future__ import annotations

import argparse
import posixpath
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Callable
from urllib.parse import quote, unquote, urlsplit


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ROOT = REPOSITORY_ROOT / "public"
SITE_ORIGIN = "https://rspice.app"
RESERVED_ROUTES = {"ide", "play", "workbench"}
VOID_ELEMENTS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
NON_VISIBLE_ELEMENTS = {"head", "script", "style", "template", "noscript"}


@dataclass
class Element:
    tag: str
    attrs: dict[str, str | None]
    parent: Element | None
    line: int
    parts: list[str | Element] = field(default_factory=list)


@dataclass(frozen=True)
class Reference:
    page: Path
    tag: str
    attribute: str
    value: str
    line: int


@dataclass
class Page:
    path: Path
    source: str
    parser: PageParser
    noindex: bool = False
    redirect: bool = False


@dataclass(frozen=True)
class ValidationResult:
    root: Path
    errors: tuple[str, ...]
    page_count: int
    asset_count: int

    @property
    def ok(self) -> bool:
        return not self.errors


def normalized_text(value: str) -> str:
    return " ".join(value.split())


def is_hidden(node: Element) -> bool:
    style = (node.attrs.get("style") or "").replace(" ", "").lower()
    return (
        "hidden" in node.attrs
        or (node.attrs.get("aria-hidden") or "").lower() == "true"
        or "display:none" in style
        or "visibility:hidden" in style
    )


def element_text(node: Element, *, visible_only: bool = False) -> str:
    if visible_only and (node.tag in NON_VISIBLE_ELEMENTS or is_hidden(node)):
        return ""
    values: list[str] = []
    for part in node.parts:
        if isinstance(part, str):
            values.append(part)
        else:
            values.append(element_text(part, visible_only=visible_only))
    return normalized_text(" ".join(values))


def accessible_text(node: Element) -> str:
    if node.tag in NON_VISIBLE_ELEMENTS or is_hidden(node):
        return ""
    if node.tag == "img":
        return normalized_text(node.attrs.get("alt") or "")
    values: list[str] = []
    for part in node.parts:
        values.append(part if isinstance(part, str) else accessible_text(part))
    return normalized_text(" ".join(values))


def parse_srcset(value: str) -> list[str]:
    """Return URL tokens from the practical subset of the srcset grammar."""
    urls: list[str] = []
    index = 0
    length = len(value)
    while index < length:
        while index < length and (value[index].isspace() or value[index] == ","):
            index += 1
        if index >= length:
            break

        start = index
        is_data = value[index : index + 5].lower() == "data:"
        while index < length and not value[index].isspace():
            if value[index] == "," and not is_data:
                break
            index += 1
        url = value[start:index].strip()
        if url:
            urls.append(url)

        while index < length and value[index] != ",":
            index += 1
        if index < length:
            index += 1
    return urls


class PageParser(HTMLParser):
    def __init__(
        self,
        path: Path,
        report_error: Callable[[Path, str, int | None], None],
    ) -> None:
        super().__init__(convert_charrefs=True)
        self.path = path
        self.report_error = report_error
        self.root = Element("#document", {}, None, 1)
        self.stack = [self.root]
        self.elements: list[Element] = []
        self.references: list[Reference] = []
        self.ids: dict[str, int] = {}

    def _start(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
        *,
        push: bool,
    ) -> None:
        tag = tag.lower()
        line, _column = self.getpos()
        values: dict[str, str | None] = {}
        for raw_name, value in attrs:
            name = raw_name.lower()
            if name in values:
                self.report_error(self.path, f"duplicate attribute '{name}'", line)
            values[name] = value

        parent = self.stack[-1]
        node = Element(tag, values, parent, line)
        parent.parts.append(node)
        self.elements.append(node)

        element_id = (values.get("id") or "").strip()
        if element_id:
            if element_id in self.ids:
                self.report_error(
                    self.path,
                    f"duplicate id '{element_id}' (first used on line {self.ids[element_id]})",
                    line,
                )
            else:
                self.ids[element_id] = line

        for attribute in (
            "href",
            "xlink:href",
            "src",
            "action",
            "formaction",
            "poster",
        ):
            raw_value = values.get(attribute)
            if raw_value and raw_value.strip():
                self.references.append(
                    Reference(self.path, tag, attribute, raw_value.strip(), line)
                )
            elif attribute in values and attribute in {
                "href",
                "xlink:href",
                "src",
                "poster",
            }:
                self.report_error(self.path, f"empty {attribute} URL", line)

        srcset = values.get("srcset")
        if "srcset" in values:
            srcset = srcset or ""
            candidates = parse_srcset(srcset)
            if not candidates:
                self.report_error(self.path, "srcset has no URL candidates", line)
            for candidate in candidates:
                self.references.append(
                    Reference(self.path, tag, "srcset", candidate, line)
                )

        if (values.get("target") or "").lower() == "_blank":
            rel = set((values.get("rel") or "").lower().split())
            if "noopener" not in rel:
                self.report_error(
                    self.path,
                    "target='_blank' link is missing rel='noopener'",
                    line,
                )

        if tag == "base":
            self.report_error(
                self.path,
                "<base> is not allowed because it makes local-link validation ambiguous",
                line,
            )

        if push and tag not in VOID_ELEMENTS:
            self.stack.append(node)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._start(tag, attrs, push=True)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._start(tag, attrs, push=False)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        self.stack[-1].parts.append(data)


class SiteValidator:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.errors: list[str] = []
        self.pages: dict[Path, Page] = {}

    def error(self, path: Path, message: str, line: int | None = None) -> None:
        try:
            label = path.relative_to(self.root).as_posix()
        except ValueError:
            label = str(path)
        if not label:
            label = "."
        location = f"{label}:{line}" if line else label
        self.errors.append(f"{location}: {message}")

    def run(self) -> ValidationResult:
        if not self.root.is_dir():
            self.errors.append(
                f"site root does not exist or is not a directory: {self.root}"
            )
            return self.result()

        for item in self.root.rglob("*"):
            is_junction = getattr(item, "is_junction", lambda: False)
            if item.is_symlink() or is_junction():
                self.error(
                    item,
                    "symbolic links and directory junctions are not allowed in the deployable tree",
                )

        html_files = sorted(
            path
            for path in self.root.rglob("*")
            if path.is_file()
            and path.suffix.lower() == ".html"
            and not self.is_reserved_overlay_path(path)
        )
        if not html_files:
            self.errors.append("no HTML files found")

        self.validate_reserved_routes()
        for path in html_files:
            self.parse_page(path)
        for page in self.pages.values():
            self.validate_page(page)
        for page in self.pages.values():
            for reference in page.parser.references:
                self.validate_reference(reference)
        self.validate_css()
        self.validate_shared_javascript()
        self.validate_deployment_files()
        return self.result()

    def is_reserved_overlay_path(self, path: Path) -> bool:
        try:
            relative = path.resolve().relative_to(self.root)
        except (OSError, ValueError):
            return False
        return bool(relative.parts) and relative.parts[0].casefold() in RESERVED_ROUTES

    def result(self) -> ValidationResult:
        assets = 0
        if self.root.is_dir():
            assets = sum(
                1
                for path in self.root.rglob("*")
                if path.is_file() and path.suffix.lower() != ".html"
            )
        return ValidationResult(
            root=self.root,
            errors=tuple(sorted(set(self.errors))),
            page_count=len(self.pages),
            asset_count=assets,
        )

    def parse_page(self, path: Path) -> None:
        try:
            source = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            self.error(path, f"cannot read as UTF-8: {exc}")
            return

        parser = PageParser(path, self.error)
        try:
            parser.feed(source)
            parser.close()
        except Exception as exc:  # HTMLParser can surface malformed entities.
            self.error(path, f"cannot parse HTML: {exc}")
            return
        self.pages[path.resolve()] = Page(path.resolve(), source, parser)

    def validate_page(self, page: Page) -> None:
        parser = page.parser
        elements = parser.elements
        source = page.source

        if not source.lstrip().lower().startswith("<!doctype html>"):
            self.error(page.path, "missing HTML5 doctype")

        html_nodes = [node for node in elements if node.tag == "html"]
        if len(html_nodes) != 1:
            self.error(page.path, "document must contain exactly one <html> element")
        elif not (html_nodes[0].attrs.get("lang") or "").strip():
            self.error(
                page.path,
                "<html> is missing a non-empty lang attribute",
                html_nodes[0].line,
            )

        head_nodes = [node for node in elements if node.tag == "head"]
        body_nodes = [node for node in elements if node.tag == "body"]
        if len(head_nodes) != 1:
            self.error(page.path, "document must contain exactly one <head> element")
        if len(body_nodes) != 1:
            self.error(page.path, "document must contain exactly one <body> element")

        titles = [node for node in elements if node.tag == "title"]
        if len(titles) != 1 or not element_text(titles[0]):
            self.error(page.path, "document must contain exactly one non-empty <title>")

        metas = [node for node in elements if node.tag == "meta"]
        charset_nodes = [node for node in metas if node.attrs.get("charset")]
        if len(charset_nodes) != 1 or (
            charset_nodes[0].attrs.get("charset") or ""
        ).lower() not in {"utf-8", "utf8"}:
            self.error(
                page.path, "document must contain exactly one <meta charset='UTF-8'>"
            )

        named_meta_nodes = {
            name: [
                node for node in metas if (node.attrs.get("name") or "").lower() == name
            ]
            for name in {
                (node.attrs.get("name") or "").lower()
                for node in metas
                if node.attrs.get("name")
            }
        }
        named_meta = {
            name: (nodes[-1].attrs.get("content") or "").strip()
            for name, nodes in named_meta_nodes.items()
        }
        for name in ("description", "viewport", "robots"):
            if len(named_meta_nodes.get(name, [])) > 1:
                self.error(
                    page.path, f"document contains duplicate meta name='{name}' tags"
                )
        viewport = named_meta.get("viewport", "").replace(" ", "").lower()
        if "width=device-width" not in viewport or "initial-scale=" not in viewport:
            self.error(
                page.path, "viewport must set width=device-width and initial-scale"
            )
        if not named_meta.get("description"):
            self.error(page.path, "missing a non-empty meta description")

        robots = named_meta.get("robots", "").lower()
        page.noindex = robots.strip() == "none" or bool(
            re.search(r"(?:^|[,\s])noindex(?:$|[,\s])", robots)
        )
        refresh_nodes = [
            node
            for node in metas
            if (node.attrs.get("http-equiv") or "").lower() == "refresh"
        ]
        page.redirect = bool(refresh_nodes)
        for node in refresh_nodes:
            content = node.attrs.get("content") or ""
            match = re.search(r"(?:^|;)\s*url\s*=\s*([^;]+)", content, re.I)
            if not match:
                self.error(page.path, "meta refresh is missing a URL", node.line)
            else:
                parser.references.append(
                    Reference(
                        page.path,
                        "meta",
                        "refresh",
                        match.group(1).strip(" \"'"),
                        node.line,
                    )
                )

        if not page.redirect:
            mains = [node for node in elements if node.tag == "main"]
            headings = [node for node in elements if node.tag == "h1"]
            if len(mains) != 1:
                self.error(
                    page.path, "document must contain exactly one <main> landmark"
                )
            if len(headings) != 1 or not element_text(headings[0], visible_only=True):
                self.error(
                    page.path,
                    "document must contain exactly one visible, non-empty <h1>",
                )

        property_node_lists = {
            name: [
                node
                for node in metas
                if (node.attrs.get("property") or "").lower() == name
            ]
            for name in {
                (node.attrs.get("property") or "").lower()
                for node in metas
                if node.attrs.get("property")
            }
        }
        property_nodes = {
            name: nodes[-1] for name, nodes in property_node_lists.items()
        }
        properties = {
            name: (node.attrs.get("content") or "").strip()
            for name, node in property_nodes.items()
        }
        for name in ("og:title", "og:description", "og:type", "og:image"):
            if len(property_node_lists.get(name, [])) > 1:
                self.error(
                    page.path, f"document contains duplicate property='{name}' tags"
                )
        if not page.noindex:
            for property_name in ("og:title", "og:description", "og:type", "og:image"):
                if not properties.get(property_name):
                    self.error(
                        page.path, f"indexable page is missing {property_name} metadata"
                    )
            image = properties.get("og:image")
            if image:
                try:
                    parsed_image = urlsplit(image)
                except ValueError as exc:
                    self.error(page.path, f"og:image is not a valid URL: {exc}")
                else:
                    if (
                        parsed_image.scheme.lower() != "https"
                        or not parsed_image.netloc
                    ):
                        self.error(page.path, "og:image must be an absolute HTTPS URL")
                    elif (
                        f"{parsed_image.scheme}://{parsed_image.netloc}" == SITE_ORIGIN
                    ):
                        image_node = property_nodes["og:image"]
                        parser.references.append(
                            Reference(
                                page.path,
                                "meta",
                                "src",
                                parsed_image.path,
                                image_node.line,
                            )
                        )

        self.validate_accessibility(page)

    def validate_accessibility(self, page: Page) -> None:
        elements = page.parser.elements
        ids = page.parser.ids
        controls = {
            (node.attrs.get("id") or "").strip()
            for node in elements
            if node.tag in {"button", "input", "select", "textarea"}
            and node.attrs.get("id")
        }
        labels_for = {
            (node.attrs.get("for") or "").strip()
            for node in elements
            if node.tag == "label" and node.attrs.get("for")
        }

        for node in elements:
            attrs = node.attrs
            line = node.line
            if node.tag == "img" and "alt" not in attrs:
                self.error(page.path, "<img> is missing an alt attribute", line)
            if node.tag == "iframe" and not (attrs.get("title") or "").strip():
                self.error(page.path, "<iframe> is missing a title", line)

            for attribute in (
                "aria-labelledby",
                "aria-describedby",
                "aria-controls",
                "aria-owns",
            ):
                for referenced_id in (attrs.get(attribute) or "").split():
                    if referenced_id not in ids:
                        self.error(
                            page.path,
                            f"{attribute} references missing id '{referenced_id}'",
                            line,
                        )

            if (
                node.tag == "label"
                and attrs.get("for")
                and attrs["for"] not in controls
            ):
                self.error(
                    page.path,
                    f"label references missing control id '{attrs['for']}'",
                    line,
                )

            if node.tag == "a" and attrs.get("href"):
                if not self.has_accessible_name(node):
                    self.error(page.path, "link has no accessible name", line)

            if node.tag == "button" and not self.has_accessible_name(node):
                self.error(page.path, "button has no accessible name", line)

            if node.tag in {"input", "select", "textarea"}:
                input_type = (attrs.get("type") or "text").lower()
                if input_type == "hidden":
                    continue
                if input_type in {"submit", "reset", "button"} and attrs.get("value"):
                    continue
                control_id = (attrs.get("id") or "").strip()
                parent = node.parent
                wrapped_by_label = False
                while parent is not None:
                    if parent.tag == "label":
                        wrapped_by_label = True
                        break
                    parent = parent.parent
                labelled = (
                    bool(control_id and control_id in labels_for) or wrapped_by_label
                )
                if input_type == "image" and (attrs.get("alt") or "").strip():
                    labelled = True
                if not labelled and not self.has_accessible_name(
                    node, include_text=False
                ):
                    self.error(page.path, f"<{node.tag}> has no accessible label", line)

    @staticmethod
    def has_accessible_name(node: Element, *, include_text: bool = True) -> bool:
        attrs = node.attrs
        if (attrs.get("aria-label") or "").strip():
            return True
        if (attrs.get("aria-labelledby") or "").strip():
            return True
        if (attrs.get("title") or "").strip():
            return True
        return include_text and bool(accessible_text(node))

    def validate_reference(self, reference: Reference) -> None:
        raw = reference.value.strip()
        if not raw:
            self.error(
                reference.page, f"empty {reference.attribute} URL", reference.line
            )
            return
        if re.search(r"[\x00-\x1f\x7f]", raw):
            self.error(
                reference.page,
                f"URL contains a control character: {raw!r}",
                reference.line,
            )
            return
        if raw.startswith("//"):
            self.error(
                reference.page,
                f"scheme-relative URL is not allowed: {raw!r}",
                reference.line,
            )
            return

        try:
            parsed = urlsplit(raw)
        except ValueError as exc:
            self.error(
                reference.page,
                f"invalid URL in {reference.attribute}={raw!r}: {exc}",
                reference.line,
            )
            return
        scheme = parsed.scheme.lower()
        if scheme:
            if scheme == "https" and parsed.netloc:
                return
            if (
                scheme in {"mailto", "tel"}
                and reference.tag == "a"
                and reference.attribute in {"href", "xlink:href"}
            ):
                return
            if scheme == "data" and self.allowed_data_url(reference, raw):
                return
            self.error(
                reference.page,
                f"unsupported or unsafe URL scheme in {reference.attribute}={raw!r}",
                reference.line,
            )
            return
        if parsed.netloc:
            self.error(
                reference.page,
                f"URL has a host but no safe scheme: {raw!r}",
                reference.line,
            )
            return

        try:
            path_text = unquote(parsed.path)
            fragment = unquote(parsed.fragment)
        except UnicodeError:
            self.error(
                reference.page, f"URL cannot be decoded: {raw!r}", reference.line
            )
            return
        if "\\" in path_text:
            self.error(
                reference.page,
                f"local URL must use forward slashes: {raw!r}",
                reference.line,
            )
            return

        logical_path = self.logical_url_path(reference.page, path_text)
        route = logical_path.strip("/").split("/", 1)[0].lower()
        if route in RESERVED_ROUTES:
            return

        if not path_text:
            candidate = reference.page
        elif path_text.startswith("/"):
            candidate = self.root / path_text.lstrip("/")
        else:
            candidate = reference.page.parent / path_text

        try:
            candidate = candidate.resolve()
            candidate.relative_to(self.root)
        except (OSError, ValueError):
            self.error(
                reference.page,
                f"local reference escapes the site root: {raw!r}",
                reference.line,
            )
            return

        if path_text.endswith("/") or candidate.is_dir():
            candidate = candidate / "index.html"
        elif not candidate.exists() and candidate.suffix == "":
            html_candidate = candidate.with_suffix(".html")
            if html_candidate.exists():
                candidate = html_candidate

        if not candidate.exists() or not candidate.is_file():
            self.error(
                reference.page, f"missing local target for {raw!r}", reference.line
            )
            return
        self.validate_reference_case(reference, candidate, path_text)

        if fragment and candidate.suffix.lower() == ".html":
            target_page = self.pages.get(candidate.resolve())
            if target_page is None:
                self.error(
                    reference.page,
                    f"cannot inspect fragment target in {raw!r}",
                    reference.line,
                )
            elif fragment not in target_page.parser.ids:
                self.error(
                    reference.page,
                    f"missing fragment '#{fragment}' in {raw!r}",
                    reference.line,
                )

    @staticmethod
    def allowed_data_url(reference: Reference, raw: str) -> bool:
        return (
            raw.lower().startswith("data:image/")
            and reference.tag in {"img", "source", "link", "css"}
            and reference.attribute in {"src", "srcset", "href", "url"}
        )

    def logical_url_path(self, page: Path, path_text: str) -> str:
        if path_text.startswith("/"):
            return posixpath.normpath(path_text)
        page_directory = page.relative_to(self.root).parent.as_posix()
        return posixpath.normpath(f"/{page_directory}/{path_text}")

    def validate_reference_case(
        self, reference: Reference, candidate: Path, original_path: str
    ) -> None:
        if not original_path or not candidate.exists():
            return
        try:
            relative = candidate.relative_to(self.root)
        except ValueError:
            return
        current = self.root
        for part in relative.parts:
            if not current.is_dir():
                return
            names = {child.name for child in current.iterdir()}
            if part not in names:
                folded = {name.casefold(): name for name in names}
                actual = folded.get(part.casefold())
                if actual:
                    self.error(
                        reference.page,
                        f"local URL case does not match '{actual}' in {original_path!r}",
                        reference.line,
                    )
                return
            current /= part

    def validate_css(self) -> None:
        url_pattern = re.compile(r"url\(\s*(['\"]?)([^)'\"]+)\1\s*\)", re.I)
        import_pattern = re.compile(
            r"@import\s+(?:url\(\s*)?(['\"])([^'\"]+)\1\s*\)?", re.I
        )
        stylesheets = sorted(
            path
            for path in self.root.rglob("*")
            if path.is_file() and path.suffix.lower() == ".css"
        )
        for stylesheet in stylesheets:
            try:
                source = stylesheet.read_text(encoding="utf-8")
            except (OSError, UnicodeError) as exc:
                self.error(stylesheet, f"cannot read as UTF-8: {exc}")
                continue
            searchable = re.sub(
                r"/\*.*?\*/",
                lambda match: "\n" * match.group(0).count("\n"),
                source,
                flags=re.S,
            )
            for match in url_pattern.finditer(searchable):
                value = match.group(2).strip()
                line = searchable.count("\n", 0, match.start()) + 1
                self.validate_reference(
                    Reference(stylesheet, "css", "url", value, line)
                )
            for match in import_pattern.finditer(searchable):
                value = match.group(2).strip()
                line = searchable.count("\n", 0, match.start()) + 1
                self.validate_reference(
                    Reference(stylesheet, "css", "url", value, line)
                )

    def validate_shared_javascript(self) -> None:
        unsafe_patterns = {
            "innerHTML/outerHTML": re.compile(r"\b(?:innerHTML|outerHTML)\b"),
            "insertAdjacentHTML": re.compile(r"\binsertAdjacentHTML\s*\("),
            "document.write": re.compile(r"\bdocument\s*\.\s*write(?:ln)?\s*\("),
        }
        assets = self.root / "assets"
        if not assets.is_dir():
            return
        scripts = {
            script
            for script in assets.rglob("*")
            if script.is_file()
            and script.suffix.lower() == ".js"
            and re.search(
                r"(?:^|[-_.])(?:site|shared|landing)(?:$|[-_.])",
                script.stem.lower(),
            )
        }
        homepage = next(
            (
                page
                for page in self.pages.values()
                if page.path.relative_to(self.root).as_posix().lower() == "index.html"
            ),
            None,
        )
        if homepage:
            for reference in homepage.parser.references:
                if reference.tag != "script" or reference.attribute != "src":
                    continue
                try:
                    parsed = urlsplit(reference.value)
                except ValueError:
                    continue
                if parsed.scheme or parsed.netloc:
                    continue
                path_text = unquote(parsed.path)
                candidate = (
                    self.root / path_text.lstrip("/")
                    if path_text.startswith("/")
                    else homepage.path.parent / path_text
                ).resolve()
                try:
                    candidate.relative_to(self.root)
                except ValueError:
                    continue
                if candidate.suffix.lower() == ".js" and candidate.is_file():
                    scripts.add(candidate)

        for script in sorted(scripts):
            try:
                source = script.read_text(encoding="utf-8")
            except (OSError, UnicodeError) as exc:
                self.error(script, f"cannot read as UTF-8: {exc}")
                continue
            for label, pattern in unsafe_patterns.items():
                for match in pattern.finditer(source):
                    line = source.count("\n", 0, match.start()) + 1
                    self.error(
                        script,
                        f"shared/landing JavaScript must not use {label}; use safe DOM APIs",
                        line,
                    )

    def validate_reserved_routes(self) -> None:
        if self.root != DEFAULT_ROOT.resolve():
            return
        for child in self.root.iterdir():
            route_name = child.name.casefold()
            if route_name in RESERVED_ROUTES or route_name in {
                f"{route}.html" for route in RESERVED_ROUTES
            }:
                self.error(
                    child,
                    "/ide, /play, and /workbench are reserved for release overlays, not site source",
                )

    def validate_deployment_files(self) -> None:
        required = [
            self.root / "robots.txt",
            self.root / "sitemap.xml",
            self.root / "_headers",
        ]
        for path in required:
            if not path.is_file():
                self.error(path, "missing required deployment file")
        if required[0].is_file():
            self.validate_robots(required[0])
        if required[1].is_file():
            self.validate_sitemap(required[1])
        if required[2].is_file():
            self.validate_headers(required[2])

    def validate_robots(self, path: Path) -> None:
        source = path.read_text(encoding="utf-8")
        if not re.search(r"(?im)^User-agent:\s*\*$", source):
            self.error(path, "robots.txt must define the wildcard user agent")
        expected = f"Sitemap: {SITE_ORIGIN}/sitemap.xml"
        if expected not in source:
            self.error(path, f"robots.txt must include '{expected}'")

    def validate_sitemap(self, path: Path) -> None:
        try:
            root = ET.parse(path).getroot()
        except (ET.ParseError, OSError) as exc:
            self.error(path, f"invalid sitemap XML: {exc}")
            return
        location_values = [
            (node.text or "").strip()
            for node in root.findall(
                ".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc"
            )
        ]
        locations = set(location_values)
        if len(locations) != len(location_values):
            self.error(path, "sitemap contains a duplicate <loc> URL")
        for location in locations:
            try:
                parsed = urlsplit(location)
            except ValueError as exc:
                self.error(path, f"invalid sitemap URL {location!r}: {exc}")
                continue
            if f"{parsed.scheme}://{parsed.netloc}" != SITE_ORIGIN:
                self.error(path, f"sitemap URL must use {SITE_ORIGIN}: {location!r}")
            if parsed.query or parsed.fragment:
                self.error(
                    path,
                    f"sitemap URL must not contain a query or fragment: {location!r}",
                )

        expected_pages = {
            f"{SITE_ORIGIN}{self.public_url(page.path)}"
            for page in self.pages.values()
            if not page.noindex and not page.redirect
        }
        expected_runtime = {
            f"{SITE_ORIGIN}/{route}/" for route in sorted(RESERVED_ROUTES)
        }
        expected = expected_pages | expected_runtime
        for missing in sorted(expected - locations):
            self.error(path, f"indexable page is missing from sitemap: {missing}")
        for stale in sorted(locations - expected):
            self.error(
                path, f"sitemap URL does not map to an indexable HTML page: {stale}"
            )

    def public_url(self, path: Path) -> str:
        relative = path.relative_to(self.root).as_posix()
        lower_relative = relative.lower()
        if lower_relative == "index.html":
            return "/"
        if lower_relative.endswith("/index.html"):
            return f"/{quote(relative[:-10])}"
        if lower_relative.endswith(".html"):
            relative = relative[:-5]
        return f"/{quote(relative)}"

    def validate_headers(self, path: Path) -> None:
        source = path.read_text(encoding="utf-8")
        lines = source.splitlines()
        for line_number, line in enumerate(lines, 1):
            if len(line) > 2_000:
                self.error(
                    path,
                    "Cloudflare Pages _headers lines must not exceed 2,000 characters",
                    line_number,
                )
        rule_count = sum(
            1
            for line in lines
            if line and not line[0].isspace() and not line.startswith("#")
        )
        if rule_count > 100:
            self.error(path, "Cloudflare Pages _headers must not exceed 100 rules")
        required_headers = (
            "Content-Security-Policy:",
            "X-Content-Type-Options:",
            "Referrer-Policy:",
            "Permissions-Policy:",
        )
        for header in required_headers:
            if header.lower() not in source.lower():
                self.error(path, f"missing security header: {header[:-1]}")
        csp_tokens = ("worker-src", "blob:", "'wasm-unsafe-eval'", "object-src 'none'")
        for token in csp_tokens:
            if token.lower() not in source.lower():
                self.error(path, f"Content-Security-Policy must include {token!r}")


def validate_site(root: Path) -> ValidationResult:
    return SiteValidator(root).run()


def print_result(result: ValidationResult) -> None:
    if result.errors:
        print("site validation failed:", file=sys.stderr)
        for item in result.errors:
            print(f"  - {item}", file=sys.stderr)
        return
    print(
        f"site validation passed: {result.page_count} pages, "
        f"{result.asset_count} non-HTML files ({result.root})"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=DEFAULT_ROOT,
        help="static site root to validate (default: public)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    result = validate_site(args.root)
    print_result(result)
    return 0 if result.ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
