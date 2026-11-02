#!/usr/bin/env python3
"""Tests for the keyboard shortcuts page generator and the Rust reader under it."""

from __future__ import annotations

import os
import re
import subprocess
import unittest
from pathlib import Path

import keyboard_shortcuts as shortcuts
from keyboard_shortcuts import Chord, ShortcutCatalog, ShortcutSourceError, build_page
from rust_source import Opaque, Program, RustFile, RustSourceError, force_all, tokenize


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "public" / "docs" / "keyboard-shortcuts.html"

CATALOG = """
use egui::Key;
pub enum CommandPlatform { Desktop, Browser, Tablet, Phone }
impl CommandPlatform {
    pub const ALL: [Self; 4] = [Self::Desktop, Self::Browser, Self::Tablet, Self::Phone];
}
pub struct CommandKey(&'static str);
impl CommandKey {
    #[must_use]
    pub const fn new(id: &'static str) -> Self { Self(id) }
}
pub struct ShortcutChord { pub key: Key, pub primary: bool, pub alt: bool, pub shift: bool, pub label: &'static str }
impl ShortcutChord {
    pub const fn new(key: Key, primary: bool, alt: bool, shift: bool, label: &'static str) -> Self {
        Self { key, primary, alt, shift, label }
    }
}
"""

VOCABULARY = """
//! The command vocabulary.
use crate::state::command_catalog::CommandKey;
pub enum Command { Undo, ZoomOneToOne, MoveLineUp, Exit, CommandPalette, Retired }
pub struct CommandSpec { pub id: &'static str, pub label: &'static str, pub group: &'static str }
impl Command {
    pub const fn stable_id(self) -> &'static str { self.spec().id }
    pub const fn key(self) -> CommandKey { CommandKey::new(self.stable_id()) }
    pub const fn spec(self) -> CommandSpec {
        match self {
            Self::Undo => spec("undo", "Undo", "Edit"),
            Self::ZoomOneToOne => spec("zoom-one-to-one", "Zoom 100%", "View"),
            Self::MoveLineUp => spec("move-line-up", "Move line up", "Edit"),
            Self::Exit => spec("exit-rspice", "Exit", "File"),
            Self::CommandPalette => spec("command-palette", "Command palette", "Navigate"),
            Self::Retired => spec("retired", "Retired \\u{2026}", "Help"),
        }
    }
    fn registry_spec(self) -> u8 { self.spec().id.len() as u8 }
}
pub(in crate::workbench) const fn spec(id: &'static str, label: &'static str, group: &'static str) -> CommandSpec {
    CommandSpec { id, label, group }
}
pub const COMMAND_REGISTRY: &[Command] = &[
    Command::Undo, Command::ZoomOneToOne, Command::MoveLineUp, Command::Exit, Command::CommandPalette, Command::Retired,
];
pub(crate) fn command_registry() -> &'static Registry {
    static REGISTRY: LazyLock<Registry> = LazyLock::new(|| {
        Registry::new(
            COMMAND_REGISTRY.iter().map(|command| command.registry_spec())
                .chain(CloudCommand::ALL.map(CloudCommand::declared_spec))
                .chain(HardcopyCommand::ALL.map(HardcopyCommand::declared_spec))
                .chain(ModelsCommand::ALL.map(ModelsCommand::declared_spec))
                .chain(ProjectCommand::ALL.map(ProjectCommand::declared_spec))
                .chain(ResultsCommand::ALL.map(ResultsCommand::declared_spec))
                .chain(SettingsCommand::ALL.map(SettingsCommand::declared_spec))
                .chain(SheetsCommand::ALL.map(SheetsCommand::declared_spec))
                .chain(SimulateCommand::ALL.map(SimulateCommand::declared_spec))
                .collect(),
        )
    });
    &REGISTRY
}
"""

REGISTRY = """
use egui::Key;
const ALL: &[CommandPlatform] = &CommandPlatform::ALL;
const DESKTOP: &[CommandPlatform] = &[CommandPlatform::Desktop];
const fn primary(chord: ShortcutChord, platforms: &'static [CommandPlatform]) -> ShortcutBinding {
    ShortcutBinding { chord, platforms, kind: ShortcutKind::Primary }
}
const fn alternate(chord: ShortcutChord, platforms: &'static [CommandPlatform]) -> ShortcutBinding {
    ShortcutBinding { chord, platforms, kind: ShortcutKind::Alternate }
}
const fn chord(key: Key, primary_modifier: bool, alt: bool, shift: bool, label: &'static str) -> ShortcutChord {
    ShortcutChord::new(key, primary_modifier, alt, shift, label)
}
const NONE: &[ShortcutBinding] = &[];
const UNDO: &[ShortcutBinding] = &[primary(chord(Key::Z, true, false, false, "Ctrl+Z"), ALL)];
// The browser zooms its page on Ctrl+0.
const ZOOM_ONE_TO_ONE: &[ShortcutBinding] = &[primary(chord(Key::Num0, true, false, false, "Ctrl+0"), DESKTOP)];
const MOVE_LINE_UP: &[ShortcutBinding] = &[primary(chord(Key::ArrowUp, false, true, false, "Alt+Up"), ALL)];
const EXIT: &[ShortcutBinding] = &[primary(chord(Key::F4, false, true, false, "Alt+F4"), DESKTOP)];
const PALETTE: &[ShortcutBinding] = &[
    primary(chord(Key::K, true, false, false, "Ctrl+K"), ALL),
    alternate(chord(Key::Minus, true, true, true, "Ctrl+Shift+Alt+-"), DESKTOP),
];
impl Command {
    pub const fn shortcut_context(self) -> ShortcutContext {
        match self {
            Self::Undo | Self::ZoomOneToOne => ShortcutContext::EditContext,
            Self::MoveLineUp => ShortcutContext::SourceEditor,
            _ => ShortcutContext::Global,
        }
    }
    pub const fn shortcut_bindings(self) -> &'static [ShortcutBinding] {
        match self {
            Self::Undo => UNDO,
            Self::ZoomOneToOne => ZOOM_ONE_TO_ONE,
            Self::MoveLineUp => MOVE_LINE_UP,
            Self::Exit => EXIT,
            Self::CommandPalette => PALETTE,
            _ => NONE,
        }
    }
    pub fn availability(self, app: &RSpiceApp) -> CommandAvailability {
        if self.is_enabled(app) { return CommandAvailability::Available; }
        CommandAvailability::Disabled("off")
    }
}
#[cfg(test)]
mod tests {
    #[test]
    fn a_test_is_not_read() { let closure = |x: u8| x + 1; assert_eq!(closure(1), 2); }
}
"""

PROJECT = """
use egui::Key;
pub(crate) enum ProjectCommand { NewCell, Unlabelled }
const DESKTOP: &[CommandPlatform] = &[CommandPlatform::Desktop];
const fn primary(chord: ShortcutChord, platforms: &'static [CommandPlatform]) -> ShortcutBinding {
    ShortcutBinding { chord, platforms, kind: ShortcutKind::Primary }
}
const NONE: &[ShortcutBinding] = &[];
// Ctrl+N belongs to the browser, so a new cell has a key only on the desktop.
const NEW_CELL: &[ShortcutBinding] = &[primary(ShortcutChord::new(Key::N, true, false, false, "Ctrl+N"), DESKTOP)];
impl ProjectCommand {
    pub(crate) const ALL: [Self; 2] = [Self::NewCell, Self::Unlabelled];
    pub(crate) const fn key(self) -> CommandKey {
        match self {
            Self::NewCell => ids::NEW_CELL,
            Self::Unlabelled => CommandKey::new("unlabelled"),
        }
    }
    pub(crate) const fn declared_spec(self) -> CommandSpec {
        let waits = CommandFlags::PALETTE_VISIBLE.with(CommandFlags::BLOCKED_BY_PROJECT_OPERATION, true);
        let global = ShortcutContext::Global;
        let (label, group, flags, context, bindings) = match self {
            Self::NewCell => ("New cell\\u{2026}", "File", waits, global, NEW_CELL),
            Self::Unlabelled => (IMPORTED_LABEL, "File", waits, global, NONE),
        };
        CommandSpec { key: self.key(), label, group, flags, context, bindings, owner: CommandOwner::Project }
    }
}
"""

MENUS = """
const fn command(command: Command) -> MenuEntry { MenuEntry::command(command.key()) }
const fn command_as(command: Command, label: &'static str) -> MenuEntry { MenuEntry::command_as(command.key(), label) }
const fn project(command: ProjectCommand) -> MenuEntry { MenuEntry::command(command.key()) }
pub(in crate::workbench) const fn application_menu_entries(menu: ApplicationMenu) -> &'static [MenuEntry] {
    match menu {
        ApplicationMenu::File => FILE_MENU,
        ApplicationMenu::View => VIEW_MENU,
    }
}
const FILE_MENU: &[MenuEntry] = &[
    project(ProjectCommand::NewCell).access('W'),
    MenuEntry::submenu("Open recent", OPEN_RECENT_MENU).access('R'),
    MenuEntry::Only(MenuContext::ExitInFileMenu, &[Separator, command(Command::Exit).access('X')]),
];
const OPEN_RECENT_MENU: &[MenuEntry] = &[MenuEntry::RecentFiles(ProjectCommand::NewCell.key()), Separator];
const VIEW_MENU: &[MenuEntry] = &[
    command(Command::ZoomOneToOne).access('Z'),
    MenuEntry::submenu("Edit", &[command_as(Command::Undo, "Take back")]),
];
pub(in crate::workbench) const APPLICATION_MENU: &[MenuEntry] = &[
    command_as(Command::Exit, "Quit RSpice").shows_key("\\u{2318}Q"),
];
pub(in crate::workbench) const COMPACT_MENU: &[MenuEntry] = &[
    compact_submenu(ApplicationMenu::File),
    compact_submenu(ApplicationMenu::View),
];
"""

APPLICATION_MENUS = """
use super::*;
pub enum ApplicationMenu { File, View }
impl ApplicationMenu {
    pub const fn label(self) -> &'static str {
        match self { Self::File => "File", Self::View => "View" }
    }
    pub const fn access_key(self) -> char {
        match self { Self::File => 'F', Self::View => 'V' }
    }
}
"""

FRAMEWORK = """
pub mod ids {
    use crate::state::command_catalog::CommandKey;
    macro_rules! ids {
        ($($name:ident = $id:literal;)*) => { $(pub const $name: CommandKey = CommandKey::new($id);)* };
    }
    ids! {
        NEW_CELL = "new-cell";
    }
}
"""

EMPTY_FEATURE = """
pub enum {name} {{}}
impl {name} {{
    pub const ALL: [Self; 0] = [];
}}
"""

CARGO_LOCK = '[[package]]\nname = "egui"\nversion = "0.35.0"\n'


def fixture(**overrides: str) -> dict[str, str]:
    files = {
        "Cargo.lock": CARGO_LOCK,
        shortcuts.COMMAND_CATALOG: CATALOG,
        shortcuts.VOCABULARY: VOCABULARY,
        shortcuts.REGISTRY: REGISTRY,
        shortcuts.MENUS: MENUS,
        shortcuts.APPLICATION_MENUS: APPLICATION_MENUS,
        shortcuts.FRAMEWORK_REGISTRY: FRAMEWORK,
    }
    for name, path in shortcuts.FEATURE_FILES.items():
        files[path] = PROJECT if name == "ProjectCommand" else EMPTY_FEATURE.format(name=name)
    files.update(overrides)
    return files


def reader(files: dict[str, str]):
    return lambda path: files[path]


class RustReaderTests(unittest.TestCase):
    def test_literals_comments_and_lifetimes(self) -> None:
        tokens = tokenize(
            r'''/* outer /* nested */ */ "a\u{2026}\\" r#"say "hi""# 'x' '\'' &'static b"z" // done''',
            "fixture",
        )
        self.assertEqual(
            [(token.kind, token.value) for token in tokens],
            [
                ("string", "a…\\"),
                ("string", 'say "hi"'),
                ("char", "x"),
                ("char", "'"),
                ("punct", "&"),
                ("lifetime", "'static"),
                ("string", "z"),
            ],
        )

    def test_an_unreadable_item_stops_the_reader_with_its_place(self) -> None:
        with self.assertRaisesRegex(RustSourceError, r"fixture:2"):
            RustFile("fixture", "const A: u8 = 1;\n= 2;\n")
        with self.assertRaisesRegex(RustSourceError, "unexpected character"):
            tokenize("const A: u8 = 1 §;", "fixture")

    def test_matches_bind_variant_payloads_and_call_helpers(self) -> None:
        source = """
        enum Page { Analyses, Solver }
        enum Command { Page(Page), Other }
        impl Command {
            const fn label(self) -> &'static str {
                match self {
                    Self::Page(page) => page_label(page),
                    Self::Other | _ => "Other",
                }
            }
        }
        const fn page_label(page: Page) -> &'static str {
            match page { Page::Analyses => "Analyses", Page::Solver => "Simulator options" }
        }
        const LIST: [Command; 2] = [Command::Page(Page::Solver), Command::Other];
        """
        program = Program([RustFile("fixture.rs", source)])
        values = force_all(program.const_value(program.const_item(None, "LIST", program.file("fixture.rs"))))
        self.assertEqual(
            [force_all(program.call_method(value, "label")) for value in values],
            ["Simulator options", "Other"],
        )

    def test_values_nothing_needs_are_never_evaluated(self) -> None:
        source = """
        struct Spec { label: &'static str, flags: u8, owner: u8 }
        const SPEC: Spec = Spec {
            label: "Shown",
            flags: CommandFlags::NONE.with(CommandFlags::PALETTE, 1 << 3),
            owner: Self::missing_function(),
        };
        const NEEDS_A_CLOSURE: u8 = apply(|x| x);
        """
        program = Program([RustFile("fixture.rs", source)])
        spec = force_all(program.const_value(program.const_item(None, "SPEC", program.file("fixture.rs"))))
        self.assertEqual(spec.get("label"), "Shown")
        self.assertIsInstance(spec.get("flags"), Opaque)
        with self.assertRaisesRegex(RustSourceError, "Self outside an impl"):
            spec.get("owner")
        with self.assertRaisesRegex(RustSourceError, "fixture.rs:8: closures are not read"):
            program.const_value(program.const_item(None, "NEEDS_A_CLOSURE", program.file("fixture.rs")))


class ChordTests(unittest.TestCase):
    def test_chords_are_written_as_the_application_writes_them(self) -> None:
        self.assertEqual(Chord("S", True, True, True).label(), "Ctrl+Alt+Shift+S")
        self.assertEqual(Chord("Minus", False, False, False).label(), "−")
        self.assertEqual(Chord("ArrowUp", False, True, False).label(), "Alt+⏶")
        self.assertEqual(Chord("ArrowUp", False, True, False).spoken(), "Alt+Up")
        self.assertEqual(Chord("Num0", True, False, False).label(), "Ctrl+0")
        self.assertEqual(Chord("PageDown", True, True, False).label(), "Ctrl+Alt+PageDown")
        self.assertEqual(Chord("S", True, True, True).mac_label(), "⌥⇧⌘S")
        self.assertEqual(Chord("Backspace", True, False, True).mac_label(), "⇧⌘⌫")
        with self.assertRaisesRegex(ShortcutSourceError, "no name"):
            Chord("BrowserBack", False, False, False).label()


class GeneratorTests(unittest.TestCase):
    def test_menus_rows_and_keys_come_from_the_source(self) -> None:
        catalog = ShortcutCatalog(reader(fixture()))
        menus = catalog.menus()
        self.assertEqual([(label, access) for label, access, _ in menus], [("File", "F"), ("View", "V")])
        file_rows = {row.path: row for row in menus[0][2]}
        self.assertEqual(set(file_rows), {("New cell…",), ("Exit",)})
        new_cell = file_rows[("New cell…",)].command
        self.assertEqual(new_cell.id, "new-cell")
        self.assertEqual([chord.label() for chord in new_cell.keys("Desktop")], ["Ctrl+N"])
        self.assertEqual(new_cell.keys("Browser"), ())
        self.assertEqual(file_rows[("Exit",)].conditions, ("ExitInFileMenu",))
        view_rows = {row.path: row for row in menus[1][2]}
        self.assertEqual(view_rows[("Edit", "Take back")].command.label, "Undo")
        self.assertEqual(catalog.application_menu()[0].shown_key, "⌘Q")

    def test_the_page_lists_every_keyed_command_once_per_menu_and_the_rest_apart(self) -> None:
        page = build_page(reader(fixture()), "a" * 40, "2026-11-01")
        text = page.html
        self.assertEqual(page.keyed_commands, 6)
        self.assertIn('<meta name="rspice-source-revision" content="' + "a" * 40 + '">', text)
        self.assertRegex(text, r"New cell…</td><td><kbd[^>]*>Ctrl\+N</kbd></td><td><span class=\"shortcut-none\">")
        self.assertRegex(text, r"Exit <span class=\"shortcut-note\">\(Windows and Linux desktop\)</span>")
        other = text[text.index('id="other-keys"') :]
        self.assertIn("Command palette", other)
        self.assertIn("Move line up", other)
        self.assertIn('aria-label="Alt+Up"', other)
        self.assertIn(">Ctrl+Alt+Shift+−</kbd>", other)
        self.assertNotIn("Zoom 100%", other)
        self.assertNotIn("Retired", text, "a command with no key and no menu row is left out")
        self.assertIn("<kbd>⌘Q</kbd>", text)

    def test_what_the_generator_cannot_name_stops_it(self) -> None:
        unknown_context = MENUS.replace("MenuContext::ExitInFileMenu", "MenuContext::OnTuesdays")
        with self.assertRaisesRegex(ShortcutSourceError, "OnTuesdays"):
            build_page(reader(fixture(**{shortcuts.MENUS: unknown_context})), "a" * 40, "2026-11-01")
        unknown_scope = REGISTRY.replace("ShortcutContext::SourceEditor", "ShortcutContext::Elsewhere")
        with self.assertRaisesRegex(ShortcutSourceError, "Elsewhere"):
            build_page(reader(fixture(**{shortcuts.REGISTRY: unknown_scope})), "a" * 40, "2026-11-01")
        newer_egui = CARGO_LOCK.replace("0.35.0", "0.36.1")
        with self.assertRaisesRegex(ShortcutSourceError, "egui 0.36"):
            build_page(reader(fixture(**{"Cargo.lock": newer_egui})), "a" * 40, "2026-11-01")
        unlabelled = MENUS.replace("project(ProjectCommand::NewCell)", "project(ProjectCommand::Unlabelled)")
        with self.assertRaisesRegex(ShortcutSourceError, "IMPORTED_LABEL"):
            build_page(reader(fixture(**{shortcuts.MENUS: unlabelled})), "a" * 40, "2026-11-01")
        missing_feature = VOCABULARY.replace(
            ".chain(CloudCommand::ALL.map(CloudCommand::declared_spec))", ""
        )
        with self.assertRaisesRegex(ShortcutSourceError, "chains"):
            build_page(reader(fixture(**{shortcuts.VOCABULARY: missing_feature})), "a" * 40, "2026-11-01")


class PublishedPageTests(unittest.TestCase):
    def test_the_published_page_is_the_generators_output_at_its_revision(self) -> None:
        text = PAGE.read_text(encoding="utf-8")
        revision = re.search(r'<meta name="rspice-source-revision" content="([0-9a-f]{40})">', text)
        self.assertIsNotNone(revision, "the page records the RSpice revision it was generated from")
        source = Path(os.environ.get("RSPICE_TEST_SOURCE", ROOT.parent / "RSpice"))
        probe = subprocess.run(
            ["git", "-C", str(source), "cat-file", "-e", f"{revision.group(1)}^{{commit}}"],
            capture_output=True,
        )
        if probe.returncode != 0:
            self.skipTest(f"{source} does not hold RSpice {revision.group(1)[:12]}")
        sha, date, read = shortcuts.git_reader(source, revision.group(1))
        self.assertEqual(build_page(read, sha, date).html, text)


if __name__ == "__main__":
    unittest.main()
