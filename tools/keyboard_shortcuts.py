#!/usr/bin/env python3
"""Write the keyboard shortcuts page from an RSpice revision's command registry.

The page is generated, never written by hand. It reads, at one Git revision of
an RSpice checkout, the application menus (`shell_host/menus.rs`), the command
vocabulary and the shell's key table (`commands/vocabulary.rs`,
`commands/registry.rs`) and the commands each feature declares, then writes
`public/docs/keyboard-shortcuts.html` grouped by menu, with the desktop and the
browser keys in their own columns.

Keys are written the way the application writes them on Windows and Linux
(`ShortcutStroke::display_label_for`): Ctrl, Alt, Shift, then egui's name or
symbol for the key. The egui release whose key names the table below copies is
checked against the revision's `Cargo.lock`.

    py -3 tools/keyboard_shortcuts.py --rspice-source ../RSpice --revision origin/main
"""

from __future__ import annotations

import argparse
import html
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable

from rust_source import (
    EnumValue,
    KeyRef,
    Opaque,
    Program,
    RustFile,
    RustSourceError,
    StructValue,
    force,
    force_all,
)


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = REPOSITORY_ROOT.parent / "RSpice"
OUTPUT = REPOSITORY_ROOT / "public" / "docs" / "keyboard-shortcuts.html"
SOURCE_REPOSITORY = "https://github.com/JaimeHW/RSpice"

APP = "crates/rspice-app/src/workbench"
MENUS = f"{APP}/shell_host/menus.rs"
VOCABULARY = f"{APP}/commands/vocabulary.rs"
REGISTRY = f"{APP}/commands/registry.rs"
APPLICATION_MENUS = "crates/rspice-app-workbench/src/workbench/chrome/title_bar/application_menus.rs"
FRAMEWORK_REGISTRY = "crates/rspice-app-workbench/src/workbench/framework/command_registry.rs"
COMMAND_CATALOG = "crates/rspice-app-state/src/state/command_catalog.rs"
FEATURE_FILES = {
    "CloudCommand": "crates/rspice-app-cloud/src/workbench/cloud/commands.rs",
    "HardcopyCommand": "crates/rspice-app-hardcopy/src/workbench/hardcopy/commands.rs",
    "ModelsCommand": "crates/rspice-app-models/src/workbench/models/commands.rs",
    "ProjectCommand": f"{APP}/project/commands.rs",
    "ResultsCommand": "crates/rspice-app-results/src/workbench/results/commands.rs",
    "SettingsCommand": "crates/rspice-app-settings/src/workbench/settings/commands.rs",
    "SheetsCommand": "crates/rspice-app-sheets/src/workbench/sheets/commands.rs",
    "SimulateCommand": f"{APP}/simulate/commands.rs",
}
SOURCE_PATHS = (
    MENUS,
    VOCABULARY,
    REGISTRY,
    APPLICATION_MENUS,
    FRAMEWORK_REGISTRY,
    COMMAND_CATALOG,
    *FEATURE_FILES.values(),
)

# egui 0.35's `Key::symbol_or_name`, for the keys that are not a letter, a
# digit or a function key, which are written as themselves.
EGUI_RELEASE = "0.35"
KEY_SYMBOLS = {
    "ArrowDown": "⏷", "ArrowLeft": "⏴", "ArrowRight": "⏵", "ArrowUp": "⏶",
    "Colon": ":", "Comma": ",", "Minus": "−", "Period": ".", "Plus": "+", "Equals": "=",
    "Semicolon": ";", "Backslash": "\\", "Slash": "/", "Pipe": "|", "Questionmark": "?",
    "Exclamationmark": "!", "OpenBracket": "[", "CloseBracket": "]", "OpenCurlyBracket": "{",
    "CloseCurlyBracket": "}", "Backtick": "`",
}
# egui 0.35's `Key::name`, where it differs from the variant.
KEY_NAMES = {"ArrowDown": "Down", "ArrowLeft": "Left", "ArrowRight": "Right", "ArrowUp": "Up"}
NAMED_KEYS = {
    "Escape", "Tab", "Backspace", "Enter", "Insert", "Delete", "Home", "End", "PageUp",
    "PageDown", "Space", "Quote", "Copy", "Cut", "Paste",
}
# What macOS writes for a modifier and for the keys Apple menus give a glyph.
MAC_KEY_SYMBOLS = {
    "Backspace": "⌫", "Delete": "⌦", "Escape": "⎋", "Tab": "⇥", "Enter": "↩",
}

# Where a key acts (`ShortcutContext`), as `context_is_active` decides it.
CONTEXT_LABELS = {
    "Global": "Anywhere",
    "ApplicationChrome": "Anywhere",
    "RunnableProject": "Anywhere",
    "EditContext": "Schematic, symbol or Results",
    "EngineeringCanvas": "Schematic",
    "SymbolCanvas": "Symbol view",
    "DesignWorkspace": "Design workspace",
    "SimulationWorkspace": "Simulate workspace",
    "ResultsWorkspace": "Results workspace",
    "VerificationWorkspace": "Verify workspace",
    "ViolationNavigation": "Design or Verify workspace",
    "SourceEditor": "Source editor",
}
# When a menu row is shown (`MenuContext`), where that is worth saying.
MENU_CONTEXT_NOTES = {
    "SourceEditor": "in a source editor",
    "NavigableSourceEditor": "in a source editor",
    "Drawing": "on a drawing",
    "DesktopApplication": "desktop only",
    "ExitInFileMenu": "Windows and Linux desktop",
    "MacApplication": "macOS desktop",
    "NoApplicationMenu": "not on the macOS desktop",
    "ProjectOpen": "with a project open",
    "NoProject": "on the start screen",
    "SymbolView": "in a symbol view",
    "NotSymbolView": "outside a symbol view",
    "VerilogAView": "in a Verilog-A view",
}
PLATFORMS = ("Desktop", "Browser")


class ShortcutSourceError(ValueError):
    """The RSpice source cannot be read into a shortcuts page."""


# Reading the revision ---------------------------------------------------------


def git(source: Path, *arguments: str) -> str:
    try:
        completed = subprocess.run(
            ["git", "-C", str(source), *arguments],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=60,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        detail = getattr(exc, "stderr", "") or exc
        raise ShortcutSourceError(f"git {' '.join(arguments)} failed in {source}: {detail}") from exc
    return completed.stdout


def git_reader(source: Path, revision: str) -> tuple[str, str, Callable[[str], str]]:
    """The full SHA and commit date of `revision`, and a reader of its files."""
    sha = git(source, "rev-parse", "--verify", f"{revision}^{{commit}}").strip()
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ShortcutSourceError(f"{revision!r} does not name a commit")
    date = git(source, "show", "-s", "--format=%cs", sha).strip()
    return sha, date, lambda path: git(source, "show", f"{sha}:{path}")


def egui_release(cargo_lock: str) -> str:
    match = re.search(r'\[\[package\]\]\nname = "egui"\nversion = "(\d+)\.(\d+)\.\d+"', cargo_lock)
    if not match:
        raise ShortcutSourceError("Cargo.lock names no egui release")
    return f"{match.group(1)}.{match.group(2)}"


# Values -----------------------------------------------------------------------


@dataclass(frozen=True)
class Chord:
    key: str
    primary: bool
    alt: bool
    shift: bool

    def label(self) -> str:
        """The chord as the application writes it on Windows and Linux."""
        parts = [name for on, name in ((self.primary, "Ctrl"), (self.alt, "Alt"), (self.shift, "Shift")) if on]
        return "+".join([*parts, key_symbol(self.key)])

    def spoken(self) -> str:
        """The chord with the key's name in place of a symbol."""
        parts = [name for on, name in ((self.primary, "Ctrl"), (self.alt, "Alt"), (self.shift, "Shift")) if on]
        return "+".join([*parts, key_name(self.key)])

    def mac_label(self) -> str:
        """The chord as the application writes it on macOS."""
        glyphs = ("⌥" if self.alt else "") + ("⇧" if self.shift else "") + ("⌘" if self.primary else "")
        return glyphs + MAC_KEY_SYMBOLS.get(self.key, key_symbol(self.key))


def key_name(key: str) -> str:
    if key in KEY_NAMES:
        return KEY_NAMES[key]
    if re.fullmatch(r"[A-Z]|F\d{1,2}", key) or key in NAMED_KEYS or key in KEY_SYMBOLS:
        return key
    match = re.fullmatch(r"Num(\d)", key)
    if match:
        return match.group(1)
    raise ShortcutSourceError(f"egui {EGUI_RELEASE} key {key!r} has no name in this generator")


def key_symbol(key: str) -> str:
    return KEY_SYMBOLS.get(key) or key_name(key)


@dataclass(frozen=True)
class Binding:
    chord: Chord
    platforms: frozenset[str]
    primary: bool


@dataclass(frozen=True)
class CommandFacts:
    value: EnumValue
    id: str
    label: str
    group: str
    context: str
    bindings: tuple[Binding, ...]

    def keys(self, platform: str) -> tuple[Chord, ...]:
        return tuple(binding.chord for binding in self.bindings if platform in binding.platforms)


@dataclass(frozen=True)
class MenuRow:
    menu: str
    path: tuple[str, ...]
    command: CommandFacts
    conditions: tuple[str, ...]
    shown_key: str | None = None


# Menu entries, as the evaluator builds them from `MenuEntry` constructors.


@dataclass(frozen=True)
class MenuItem:
    key: Any
    label: Any = None
    shown_key: Any = None


@dataclass(frozen=True)
class Submenu:
    label: Any
    entries: Any


@dataclass(frozen=True)
class Only:
    context: Any
    entries: Any


class Separator:
    pass


class RecentFiles:
    pass


def with_method(name: str) -> Callable[..., Any]:
    def apply(receiver: Any, *arguments: Any) -> Any:
        if isinstance(receiver, (MenuItem, Submenu)):
            if name == "shows_key" and isinstance(receiver, MenuItem):
                return MenuItem(receiver.key, receiver.label, arguments[0])
            return receiver
        return NotImplemented

    return apply


MENU_BUILTINS: dict[tuple[str, ...], Callable[..., Any]] = {
    ("MenuEntry", "command"): lambda key: MenuItem(key),
    ("MenuEntry", "command_as"): lambda key, label: MenuItem(key, label),
    ("MenuEntry", "radio"): lambda key, label: MenuItem(key, label),
    ("MenuEntry", "offered"): lambda key, label: MenuItem(key, label),
    ("MenuEntry", "submenu"): Submenu,
    ("MenuEntry", "Only"): Only,
    ("MenuEntry", "RecentFiles"): lambda key: RecentFiles(),
    ("MenuEntry", "Separator"): Separator,
    ("Separator",): Separator,
    (".access",): with_method("access"),
    (".shows_key",): with_method("shows_key"),
}


# The registry -------------------------------------------------------------------


class ShortcutCatalog:
    """The menus and the command facts of one RSpice revision."""

    def __init__(self, read: Callable[[str], str]) -> None:
        release = egui_release(read("Cargo.lock"))
        if release != EGUI_RELEASE:
            raise ShortcutSourceError(
                f"the revision builds egui {release}; this generator writes egui {EGUI_RELEASE}'s "
                "key names: check Key::symbol_or_name and update KEY_SYMBOLS"
            )
        try:
            files = [RustFile(path, read(path)) for path in SOURCE_PATHS]
        except RustSourceError as exc:
            raise ShortcutSourceError(str(exc)) from exc
        self.program = Program(files, MENU_BUILTINS)
        self.facts: dict[EnumValue, CommandFacts] = {}

    def evaluate(self, owner: str | None, name: str, path: str) -> Any:
        item = self.program.const_item(owner, name, self.program.file(path))
        if item is None:
            raise ShortcutSourceError(f"{path} has no constant {name}")
        return force_all(self.program.const_value(item))

    # Commands -----------------------------------------------------------------

    def registered(self) -> list[EnumValue]:
        """Every registered command, in the vocabulary's order and then each feature's."""
        commands = self.evaluate(None, "COMMAND_REGISTRY", VOCABULARY)
        registry_fn = self.program.fn_item(None, "command_registry", self.program.file(VOCABULARY))
        if registry_fn is None:
            raise ShortcutSourceError(f"{VOCABULARY} has no command_registry")
        tokens = registry_fn.file.tokens
        text = " ".join(token.text for token in tokens[registry_fn.body : registry_fn.file.closing(registry_fn.body)])
        lists = re.findall(r"(\w+Command) :: (\w+) \. map \( \1 :: declared_spec \)", text)
        enums = {enum for enum, _ in lists}
        if enums != set(FEATURE_FILES):
            raise ShortcutSourceError(
                f"the registry chains {sorted(enums)}; this generator reads {sorted(FEATURE_FILES)}"
            )
        for enum, name in lists:
            commands.extend(self.evaluate(enum, name, FEATURE_FILES[enum]))
        return [self.require_enum(command, "a registered command") for command in commands]

    @staticmethod
    def require_enum(value: Any, what: str) -> EnumValue:
        value = force_all(value)
        if not isinstance(value, EnumValue):
            raise ShortcutSourceError(f"{what} is {value!r}, not a command")
        return value

    def command(self, value: EnumValue) -> CommandFacts:
        if value in self.facts:
            return self.facts[value]
        call = self.program.call_method
        try:
            if value.enum == "Command":
                spec = force(call(value, "spec"))
                bindings = call(value, "shortcut_bindings")
                context = call(value, "shortcut_context")
                identity = spec.get("id")
            elif value.enum in FEATURE_FILES:
                spec = force(call(value, "declared_spec"))
                bindings = spec.get("bindings")
                context = spec.get("context")
                identity = force(spec.get("key")).id
            else:
                raise ShortcutSourceError(f"{value!r} is not a registered command type")
            if not isinstance(spec, StructValue):
                raise ShortcutSourceError(f"{value!r} declares {spec!r}, not a command spec")
            facts = CommandFacts(
                value=value,
                id=self.text(identity, f"{value!r}'s id"),
                label=self.text(spec.get("label"), f"{value!r}'s label"),
                group=self.text(spec.get("group"), f"{value!r}'s group"),
                context=self.context(context, value),
                bindings=tuple(self.binding(item, value) for item in force_all(bindings)),
            )
        except RustSourceError as exc:
            raise ShortcutSourceError(f"{value!r}: {exc}") from exc
        self.facts[value] = facts
        return facts

    def has_keys(self, value: EnumValue) -> bool:
        """Whether `value` has a key on the desktop or in the browser, read
        without its label, which a command with no key never needs."""
        call = self.program.call_method
        try:
            if value.enum == "Command":
                bindings = call(value, "shortcut_bindings")
            else:
                bindings = force(call(value, "declared_spec")).get("bindings")
            chords = [self.binding(item, value) for item in force_all(bindings)]
        except RustSourceError as exc:
            raise ShortcutSourceError(f"{value!r}: {exc}") from exc
        return any(set(PLATFORMS) & binding.platforms for binding in chords)

    @staticmethod
    def text(value: Any, what: str) -> str:
        value = force(value)
        if not isinstance(value, str):
            raise ShortcutSourceError(f"{what} is {value!r}, not text")
        return value

    @staticmethod
    def context(value: Any, command: EnumValue) -> str:
        value = force(value)
        if not isinstance(value, EnumValue) or value.enum != "ShortcutContext":
            raise ShortcutSourceError(f"{command!r}'s shortcut context is {value!r}")
        if value.variant not in CONTEXT_LABELS:
            raise ShortcutSourceError(f"shortcut context {value.variant} has no label in this generator")
        return value.variant

    @staticmethod
    def binding(value: Any, command: EnumValue) -> Binding:
        value = force(value)
        if not isinstance(value, StructValue) or value.type != "ShortcutBinding":
            raise ShortcutSourceError(f"{command!r} binds {value!r}, not a ShortcutBinding")
        chord = value.get("chord")
        if not isinstance(chord, StructValue) or chord.type != "ShortcutChord":
            raise ShortcutSourceError(f"{command!r} binds a chord {chord!r}")
        key = chord.get("key")
        flags = [chord.get(name) for name in ("primary", "alt", "shift")]
        if not isinstance(key, EnumValue) or key.enum != "Key" or not all(isinstance(flag, bool) for flag in flags):
            raise ShortcutSourceError(f"{command!r} binds a chord of {key!r} {flags!r}")
        platforms = force_all(value.get("platforms"))
        names = set()
        for platform in platforms if isinstance(platforms, list) else [platforms]:
            if not isinstance(platform, EnumValue) or platform.enum != "CommandPlatform":
                raise ShortcutSourceError(f"{command!r} binds for the platform {platform!r}")
            names.add(platform.variant)
        kind = value.get("kind")
        if not isinstance(kind, EnumValue) or kind.enum != "ShortcutKind":
            raise ShortcutSourceError(f"{command!r} binds a {kind!r} chord")
        key_name(key.variant)
        return Binding(Chord(key.variant, *flags), frozenset(names), kind.variant == "Primary")

    # Menus --------------------------------------------------------------------

    def menus(self) -> list[tuple[str, str, list[MenuRow]]]:
        """Each application menu in the bar's order: its label, access key and rows."""
        menus_file = self.program.file(MENUS)
        compact = self.program.const_item(None, "COMPACT_MENU", menus_file)
        entries_fn = self.program.fn_item(None, "application_menu_entries", menus_file)
        if compact is None or entries_fn is None:
            raise ShortcutSourceError(f"{MENUS} has no COMPACT_MENU or application_menu_entries")
        tokens = menus_file.tokens[compact.start : compact.end]
        order = [
            tokens[index + 2].text
            for index in range(len(tokens) - 2)
            if tokens[index].text == "ApplicationMenu" and tokens[index + 1].text == "::"
        ]
        if not order:
            raise ShortcutSourceError(f"{MENUS}'s COMPACT_MENU names no menu")
        result = []
        for variant in order:
            menu = EnumValue("ApplicationMenu", variant)
            label = self.text(self.program.call_method(menu, "label"), f"{variant}'s label")
            access = self.text(self.program.call_method(menu, "access_key"), f"{variant}'s access key")
            entries = force_all(self.program.call_fn(entries_fn, [menu]))
            result.append((label, access, self.rows(label, entries, (), ())))
        return result

    def application_menu(self) -> list[MenuRow]:
        """The macOS RSpice menu's rows."""
        entries = self.evaluate(None, "APPLICATION_MENU", MENUS)
        return self.rows("RSpice", entries, (), ())

    def rows(self, menu: str, entries: Iterable[Any], path: tuple[str, ...], conditions: tuple[str, ...]) -> list[MenuRow]:
        rows: list[MenuRow] = []
        for entry in force_all(list(entries)):
            entry = force_all(entry)
            if isinstance(entry, (Separator, RecentFiles)):
                continue
            if isinstance(entry, Only):
                context = force(entry.context)
                if not isinstance(context, EnumValue) or context.variant not in MENU_CONTEXT_NOTES:
                    raise ShortcutSourceError(f"{menu}: menu context {context!r} has no note in this generator")
                rows.extend(self.rows(menu, force_all(entry.entries), path, (*conditions, context.variant)))
            elif isinstance(entry, Submenu):
                label = self.text(entry.label, f"a {menu} submenu's label")
                rows.extend(self.rows(menu, force_all(entry.entries), (*path, label), conditions))
            elif isinstance(entry, MenuItem):
                key = force(entry.key)
                if not isinstance(key, KeyRef):
                    raise ShortcutSourceError(f"{menu}: a row names {key!r}, not a command's key")
                command = self.command(self.require_enum(key.origin, f"a {menu} row"))
                label = command.label if entry.label is None else self.text(entry.label, f"a {menu} row's label")
                shown = None if entry.shown_key is None else self.text(entry.shown_key, "a shown key")
                rows.append(MenuRow(menu, (*path, label), command, conditions, shown))
            else:
                raise ShortcutSourceError(f"{menu}: cannot read the menu entry {entry!r}")
        return rows


# The page -----------------------------------------------------------------------


def escape(value: str) -> str:
    return html.escape(value, quote=True)


def kbd(chords: tuple[Chord, ...]) -> str:
    if not chords:
        return '<span class="shortcut-none">&mdash;</span>'
    keys = []
    for chord in chords:
        label = chord.label()
        spoken = chord.spoken()
        aria = f' aria-label="{escape(spoken)}"' if spoken != label else ""
        keys.append(f'<kbd title="macOS: {escape(chord.mac_label())}"{aria}>{escape(label)}</kbd>')
    return " or ".join(keys)


def notes(conditions: tuple[str, ...]) -> str:
    seen: list[str] = []
    for condition in conditions:
        note = MENU_CONTEXT_NOTES[condition]
        if note not in seen:
            seen.append(note)
    return f' <span class="shortcut-note">({escape(", ".join(seen))})</span>' if seen else ""


NONE = '<span class="shortcut-none">&mdash;</span>'


def table(headings: tuple[str, ...], rows: list[tuple[str, ...]]) -> str:
    head = "".join(f'<th scope="col">{heading}</th>' for heading in headings)
    body = "".join("<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>" for row in rows)
    return (
        '<div class="technical-table-wrap"><table class="technical-table shortcut-table">'
        f"<thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>"
    )


def command_rows(rows: Iterable[tuple[str, CommandFacts, tuple[str, ...]]]) -> str:
    """Rows of a command, its desktop and browser keys and where they act."""
    return table(
        ("COMMAND", "DESKTOP", "BROWSER", "ACTS IN"),
        [
            (
                escape(label) + notes(conditions),
                kbd(command.keys("Desktop")),
                kbd(command.keys("Browser")),
                escape(CONTEXT_LABELS[command.context]),
            )
            for label, command, conditions in rows
        ],
    )


def has_keys(command: CommandFacts) -> bool:
    return any(command.keys(platform) for platform in PLATFORMS)


def slug(label: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")


@dataclass(frozen=True)
class ShortcutPage:
    sha: str
    date: str
    html: str
    keyed_commands: int


def build_page(read: Callable[[str], str], sha: str, date: str) -> ShortcutPage:
    catalog = ShortcutCatalog(read)
    menus = catalog.menus()
    application_rows = catalog.application_menu()
    in_menus = {row.command.value for _, _, rows in menus for row in rows}
    in_menus.update(row.command.value for row in application_rows)
    others = [
        catalog.command(value)
        for value in catalog.registered()
        if value not in in_menus and catalog.has_keys(value)
    ]
    others.sort(key=lambda command: (command.group, command.label))

    sections = []
    index = []
    for number, (label, access, rows) in enumerate(menus, 1):
        keyed = [(" › ".join(row.path), row.command, row.conditions) for row in rows if has_keys(row.command)]
        anchor = f"menu-{slug(label)}"
        index.append(f'<a href="#{anchor}">{escape(label)}</a>')
        content = (
            command_rows(keyed)
            if keyed
            else '<p>No command in this menu has a key of its own; each opens from the menu or the command palette.</p>'
        )
        sections.append(
            f'<section class="technical-section" id="{anchor}"><p class="technical-number">'
            f"{number:02d} / {escape(label.upper())}</p><h2>{escape(label)}</h2>"
            f'<p class="technical-note"><kbd>Alt+{escape(access)}</kbd> opens this menu on the Windows and Linux desktop.</p>'
            f"{content}</section>"
        )
    mac_rows = []
    for row in application_rows:
        chords = row.command.keys("Desktop")
        if row.shown_key:
            keys = f"<kbd>{escape(row.shown_key)}</kbd>"
        elif chords:
            keys = " or ".join(f"<kbd>{escape(chord.mac_label())}</kbd>" for chord in chords)
        else:
            continue
        mac_rows.append((escape(" › ".join(row.path)), keys))
    number = len(menus) + 1
    index.append('<a href="#menu-rspice">RSpice menu (macOS)</a>')
    sections.append(
        f'<section class="technical-section" id="menu-rspice"><p class="technical-number">{number:02d} / RSPICE MENU</p>'
        "<h2>RSpice menu on macOS</h2><p>On the macOS desktop the menu bar opens with the RSpice menu, which holds "
        "About, Settings and Quit; Help and Edit then leave About and Preferences out, and File leaves out Exit.</p>"
        + table(("COMMAND", "MACOS"), mac_rows)
        + "</section>"
    )
    number += 1
    index.append('<a href="#other-keys">Not in a menu</a>')
    sections.append(
        f'<section class="technical-section" id="other-keys"><p class="technical-number">{number:02d} / NOT IN A MENU</p>'
        "<h2>Keys for commands no menu bar row lists</h2><p>These are reached from the command palette, a toolbar, "
        "the source editor's right-click menu or the focused editor itself.</p>"
        + command_rows((command.label, command, ()) for command in others)
        + "</section>"
    )
    keyed = {row.command.value for _, _, rows in menus for row in rows if has_keys(row.command)}
    keyed.update(command.value for command in others)
    short = sha[:12]
    page = PAGE.format(
        index="".join(index),
        sections="\n        ".join(sections),
        short=escape(short),
        sha=escape(sha),
        date=escape(date),
        commit_url=escape(f"{SOURCE_REPOSITORY}/commit/{sha}"),
        egui=EGUI_RELEASE,
    )
    return ShortcutPage(sha, date, page, len(keyed))


PAGE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#071015">
  <meta name="color-scheme" content="dark">
  <meta name="generator" content="tools/keyboard_shortcuts.py">
  <meta name="rspice-source-revision" content="{sha}">
  <title>Keyboard shortcuts &mdash; RSpice</title>
  <meta name="description" content="Every default RSpice keyboard shortcut, grouped by menu, with the desktop and browser keys, generated from the application's command registry.">
  <link rel="canonical" href="https://rspice.app/docs/keyboard-shortcuts">
  <link rel="icon" href="../assets/brand/rspice.ico" sizes="any">
  <link rel="apple-touch-icon" href="../assets/brand/icon-256.png">
  <link rel="stylesheet" href="../assets/field.css">
  <link rel="stylesheet" href="../assets/technical.css">
  <link rel="stylesheet" href="../assets/interior-refined.css">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Keyboard shortcuts &mdash; RSpice">
  <meta property="og:description" content="Default RSpice keyboard shortcuts by menu, for the desktop application and the browser.">
  <meta property="og:image" content="https://rspice.app/assets/og.png">
</head>
<body class="technical-page docs-page">
  <a class="skip-link" href="#main">Skip to main content</a>

  <header class="topbar" data-topbar>
    <div class="topbar__inner">
      <a class="identity" href="../index.html" aria-label="RSpice home"><img src="../assets/brand/logo.svg" width="31" height="31" alt=""><span>RSpice</span></a>
      <button class="nav-trigger" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-trigger><span class="visually-hidden">Open navigation</span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation" data-site-nav>
        <a href="../index.html#engine">Engine</a><a href="../index.html#analyses">Analyses</a><a href="../index.html#truth">Status</a><a href="../reference.html">Reference</a><a href="../validation.html">Validation</a><a href="../docs.html" aria-current="page">Docs</a>
      </nav>
      <div class="topbar__actions"><a class="source-link" href="https://github.com/JaimeHW/RSpice" target="_blank" rel="noopener">Source <span aria-hidden="true">&nearr;</span></a><a class="launch-link" href="../ide/">Open WASM lab <span class="launch-link__tag">experimental</span></a></div>
    </div>
  </header>

  <main id="main">
    <header class="technical-hero">
      <div class="page-frame technical-hero__grid">
        <div>
          <p class="eyebrow"><a href="../docs.html">RSPICE / DOCS</a> / KEYBOARD SHORTCUTS</p>
          <h1>Keyboard shortcuts.</h1>
          <p class="technical-hero__lede">The keys RSpice ships with, menu by menu. Generated from the application's command registry at source revision <a href="{commit_url}" target="_blank" rel="noopener"><code>{short}</code></a> ({date}), not written by hand.</p>
        </div>
        <dl class="technical-hero__ledger" aria-label="How to read this page">
          <div><dt>DESKTOP</dt><dd>Windows, Linux and macOS application</dd></div>
          <div><dt>BROWSER</dt><dd>The WebAssembly build in a browser tab</dd></div>
          <div><dt>MACOS</dt><dd>Ctrl is &#x2318;, Alt is &#x2325;, Shift is &#x21e7;</dd></div>
          <div><dt>CHANGE KEYS</dt><dd>Preferences &rsaquo; Shortcuts</dd></div>
        </dl>
      </div>
    </header>

    <div class="page-frame technical-layout">
      <aside class="technical-index" aria-label="Keyboard shortcut sections">
        <p>ON THIS PAGE</p>
        <a href="#reading">Reading this page</a>{index}
      </aside>

      <article class="technical-document">
        <section class="technical-section" id="reading">
          <p class="technical-number">00 / READING THIS PAGE</p>
          <h2>Factory keys, by menu.</h2>
          <p>Each menu lists its commands that have a key. A dash means no key on that platform: a browser keeps some keys for itself, such as <kbd>Ctrl+N</kbd>, <kbd>Ctrl+W</kbd> and <kbd>Ctrl+0</kbd>, so there RSpice uses another key or none. Every command is still in its menu and in the command palette, <kbd>Ctrl+K</kbd>.</p>
          <p>A key acts only where its <strong>Acts in</strong> column says, and the same key can mean one thing on a schematic and another in a symbol view or a source editor. Keys whose <strong>Acts in</strong> names a view or a workspace do nothing while you type in a text field. Single letters such as <kbd>W</kbd> or <kbd>R</kbd> act while the drawing has keyboard focus; Preferences &rsaquo; Shortcuts can require Alt with them or turn them off, and can change any key here.</p>
          <p>On a Mac, RSpice writes Ctrl as &#x2318; (Command), Alt as &#x2325; (Option) and Shift as &#x21e7;; point at a key to see it so. Key names are the ones egui {egui}, the toolkit RSpice draws with, gives them.</p>
        </section>
        {sections}
      </article>
    </div>
  </main>

  <footer class="footer">
    <div class="page-frame footer__grid">
      <div class="footer__identity"><a class="identity" href="../index.html"><img src="../assets/brand/logo.svg" width="31" height="31" alt=""><span>RSpice</span></a><p>Rust circuit simulator with desktop, CLI, Python, and WebAssembly interfaces.</p></div>
      <div><h2>Technical</h2><a href="../reference.html">Generated reference</a><a href="../validation.html">Validation status</a><a href="../parity.html">Methodology</a><a href="../docs.html">Scope and builds</a></div>
      <div><h2>Project</h2><a href="../changelog.html">Development record</a><a href="../download.html">Build from source</a><a href="../early-access.html">Early access</a><a href="../privacy.html">Privacy</a></div>
      <div><h2>Contact</h2><a href="mailto:hello@rspice.app">General</a><a href="mailto:sales@rspice.app">Commercial</a><a href="https://github.com/JaimeHW/RSpice-Site/security" target="_blank" rel="noopener">Security</a></div>
    </div>
    <div class="page-frame footer__base"><span>&copy; <span data-year>2026</span> RSpice</span><span>SOURCE BUILD / HOSTED SERVICES NOT ACTIVE</span><span>IBM Plex under SIL OFL</span></div>
  </footer>
  <script src="../assets/field.js" defer></script>
</body>
</html>
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--rspice-source", type=Path, default=DEFAULT_SOURCE, help="RSpice Git checkout")
    parser.add_argument("--revision", required=True, help="the RSpice commit to read, such as origin/main or a SHA")
    parser.add_argument("--output", type=Path, default=OUTPUT)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        sha, date, read = git_reader(args.rspice_source, args.revision)
        page = build_page(read, sha, date)
    except ShortcutSourceError as exc:
        print(f"keyboard shortcuts not generated: {exc}")
        return 1
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(page.html, encoding="utf-8", newline="\n")
    print(f"wrote {page.keyed_commands} keyed commands from RSpice {sha[:12]} to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
