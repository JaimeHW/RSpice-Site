#!/usr/bin/env python3
"""Read the constant parts of Rust source files: items, expressions and matches.

The keyboard shortcuts page is generated from the RSpice command registry,
which is Rust: tables of `const` items, `const fn` constructors and `match`
expressions over enum variants. This module tokenizes those files, indexes
their items and evaluates the expressions the generator asks for, lazily and
only as far as a value is needed.

Anything it does not understand where a value is needed stops it with the
file and line, so a change in the source cannot quietly drop or invent a
fact. What is never needed (flags, owners, dispatch code) is never parsed.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Callable, Iterable


class RustSourceError(ValueError):
    """The source holds something this reader cannot evaluate."""


# Tokens ---------------------------------------------------------------------


@dataclass(frozen=True)
class Token:
    kind: str  # ident, string, char, number, lifetime, punct
    text: str
    value: Any
    line: int


PUNCTUATION = (
    "..=", "...", "<<=", ">>=",
    "::", "=>", "->", "==", "!=", "<=", ">=", "&&", "||", "..",
    "+=", "-=", "*=", "/=", "%=", "^=", "&=", "|=", "<<", ">>",
)
SINGLE_PUNCTUATION = set("{}()[],;:.&|=!<>#?+-*/%@^~$")
IDENT = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
NUMBER = re.compile(r"\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?(?:_?[a-z][a-z0-9]*)?")
CHAR = re.compile(r"'(\\u\{[0-9a-fA-F]{1,6}\}|\\x[0-7][0-9a-fA-F]|\\.|[^\\'\n])'")
LIFETIME = re.compile(r"'[A-Za-z_][A-Za-z0-9_]*")
RAW_STRING = re.compile(r'b?r(#*)"')
SIMPLE_ESCAPES = {"n": "\n", "r": "\r", "t": "\t", "\\": "\\", "0": "\0", "'": "'", '"': '"'}


def unescape(body: str, where: str) -> str:
    """The text a Rust string or char literal body denotes."""
    out: list[str] = []
    index = 0
    while index < len(body):
        character = body[index]
        if character != "\\":
            out.append(character)
            index += 1
            continue
        escape = body[index + 1 : index + 2]
        if escape in ("\n", "\r"):
            index += 1
            while index < len(body) and body[index] in " \t\r\n":
                index += 1
            continue
        if escape in SIMPLE_ESCAPES:
            out.append(SIMPLE_ESCAPES[escape])
            index += 2
            continue
        if escape == "x":
            out.append(chr(int(body[index + 2 : index + 4], 16)))
            index += 4
            continue
        if escape == "u":
            match = re.match(r"\\u\{([0-9a-fA-F]{1,6})\}", body[index:])
            if match:
                out.append(chr(int(match.group(1), 16)))
                index += match.end()
                continue
        raise RustSourceError(f"{where}: unknown escape {body[index:index + 2]!r}")
    return "".join(out)


def tokenize(source: str, where: str) -> list[Token]:
    """Rust tokens of `source`, without comments; `where` names it in errors."""
    tokens: list[Token] = []
    index = 0
    line = 1
    length = len(source)
    while index < length:
        character = source[index]
        if character in " \t\r\n\ufeff":
            line += character == "\n"
            index += 1
            continue
        if source.startswith("//", index):
            end = source.find("\n", index)
            index = length if end < 0 else end
            continue
        if source.startswith("/*", index):
            depth = 0
            while index < length:
                if source.startswith("/*", index):
                    depth += 1
                    index += 2
                elif source.startswith("*/", index):
                    depth -= 1
                    index += 2
                    if depth == 0:
                        break
                else:
                    line += source[index] == "\n"
                    index += 1
            if depth:
                raise RustSourceError(f"{where}:{line}: unterminated block comment")
            continue
        raw = RAW_STRING.match(source, index)
        if raw:
            terminator = '"' + raw.group(1)
            end = source.find(terminator, raw.end())
            if end < 0:
                raise RustSourceError(f"{where}:{line}: unterminated raw string")
            text = source[raw.end() : end]
            tokens.append(Token("string", source[index : end + len(terminator)], text, line))
            line += text.count("\n")
            index = end + len(terminator)
            continue
        if character == '"' or source.startswith('b"', index):
            start = index
            index += 1 if character == '"' else 2
            while index < length and source[index] != '"':
                index += 2 if source[index] == "\\" else 1
            if index >= length:
                raise RustSourceError(f"{where}:{line}: unterminated string")
            body = source[start + (1 if character == '"' else 2) : index]
            tokens.append(Token("string", source[start : index + 1], unescape(body, f"{where}:{line}"), line))
            line += body.count("\n")
            index += 1
            continue
        if character == "'" or source.startswith("b'", index):
            offset = 1 if source.startswith("b'", index) else 0
            match = CHAR.match(source, index + offset)
            if match:
                value = unescape(match.group(1), f"{where}:{line}")
                tokens.append(Token("char", source[index : match.end()], value, line))
                index = match.end()
                continue
            match = LIFETIME.match(source, index)
            if match:
                tokens.append(Token("lifetime", match.group(0), match.group(0), line))
                index = match.end()
                continue
            raise RustSourceError(f"{where}:{line}: cannot read a quote here")
        if character.isdigit():
            match = NUMBER.match(source, index)
            text = match.group(0)
            digits = re.match(r"[\d_]+", text).group(0).replace("_", "")
            tokens.append(Token("number", text, int(digits), line))
            index = match.end()
            continue
        if source.startswith("r#", index) and IDENT.match(source, index + 2):
            match = IDENT.match(source, index + 2)
            tokens.append(Token("ident", match.group(0), match.group(0), line))
            index = match.end()
            continue
        match = IDENT.match(source, index)
        if match:
            tokens.append(Token("ident", match.group(0), match.group(0), line))
            index = match.end()
            continue
        for punctuation in PUNCTUATION:
            if source.startswith(punctuation, index):
                tokens.append(Token("punct", punctuation, punctuation, line))
                index += len(punctuation)
                break
        else:
            if character not in SINGLE_PUNCTUATION:
                raise RustSourceError(f"{where}:{line}: unexpected character {character!r}")
            tokens.append(Token("punct", character, character, line))
            index += 1
    return tokens


# Items ----------------------------------------------------------------------

OPENERS = {"(": ")", "[": "]", "{": "}"}


@dataclass
class ConstItem:
    file: "RustFile"
    owner: str | None
    name: str
    start: int  # first token of the expression
    end: int  # the terminating ';'
    value: Any = None  # a value the file states without an expression


@dataclass
class FnItem:
    file: "RustFile"
    owner: str | None
    name: str
    params: tuple[str, ...]  # "self" first for a method
    body: int  # the body's '{'


class RustFile:
    """One source file's tokens and the constant items and functions in it."""

    def __init__(self, path: str, source: str) -> None:
        self.path = path
        self.tokens = tokenize(source, path)
        self.consts: dict[tuple[str | None, str], ConstItem] = {}
        self.fns: dict[tuple[str | None, str], FnItem] = {}
        self.duplicates: set[tuple[str | None, str]] = set()
        self._index(0, len(self.tokens), None)

    def where(self, index: int) -> str:
        line = self.tokens[min(index, len(self.tokens) - 1)].line if self.tokens else 0
        return f"{self.path}:{line}"

    def is_punct(self, index: int, text: str) -> bool:
        return index < len(self.tokens) and self.tokens[index].kind == "punct" and self.tokens[index].text == text

    def is_ident(self, index: int, text: str | None = None) -> bool:
        return (
            index < len(self.tokens)
            and self.tokens[index].kind == "ident"
            and (text is None or self.tokens[index].text == text)
        )

    def closing(self, index: int) -> int:
        """The index of the bracket closing the one at `index`."""
        opener = self.tokens[index].text
        if opener not in OPENERS:
            raise RustSourceError(f"{self.where(index)}: expected a bracket, found {opener!r}")
        stack = [OPENERS[opener]]
        cursor = index + 1
        while cursor < len(self.tokens):
            token = self.tokens[cursor]
            if token.kind == "punct":
                if token.text in OPENERS:
                    stack.append(OPENERS[token.text])
                elif token.text in (")", "]", "}"):
                    if token.text != stack.pop():
                        raise RustSourceError(f"{self.where(cursor)}: mismatched {token.text!r}")
                    if not stack:
                        return cursor
            cursor += 1
        raise RustSourceError(f"{self.where(index)}: unclosed {opener!r}")

    def scan_to(self, index: int, stops: Iterable[str]) -> int:
        """The first index at bracket depth zero holding one of `stops`."""
        stops = set(stops)
        cursor = index
        while cursor < len(self.tokens):
            token = self.tokens[cursor]
            if token.kind == "punct" and token.text in stops:
                return cursor
            if token.kind == "punct" and token.text in OPENERS:
                cursor = self.closing(cursor)
            cursor += 1
        raise RustSourceError(f"{self.where(index)}: expected one of {sorted(stops)}")

    def _store(self, table: dict, key: tuple[str | None, str], item: Any) -> None:
        if key in table:
            self.duplicates.add(key)
        else:
            table[key] = item

    def _index(self, index: int, end: int, owner: str | None) -> None:
        while index < end:
            token = self.tokens[index]
            text = token.text
            if token.kind == "punct" and text == "#":
                index += 1
                if self.is_punct(index, "!"):
                    index += 1
                index = self.closing(index) + 1
            elif token.kind == "punct" and text == ";":
                index += 1
            elif token.kind != "ident":
                raise RustSourceError(f"{self.where(index)}: unexpected {text!r} among items")
            elif text == "pub":
                index += 1
                if self.is_punct(index, "("):
                    index = self.closing(index) + 1
            elif text in ("unsafe", "async", "default"):
                index += 1
            elif text in ("use", "extern"):
                if text == "extern" and self.tokens[index + 1].kind == "string":
                    index += 1
                    continue
                index = self.scan_to(index, ";") + 1
            elif text == "mod":
                name = self.tokens[index + 1].text
                if self.is_punct(index + 2, ";"):
                    index += 3
                else:
                    close = self.closing(index + 2)
                    self._index(index + 3, close, name)
                    index = close + 1
            elif text in ("const", "static") and not self.is_ident(index + 1, "fn"):
                cursor = index + 1
                if self.is_ident(cursor, "mut"):
                    cursor += 1
                name = self.tokens[cursor].text
                equals = self.scan_to(cursor, ("=", ";"))
                if self.is_punct(equals, ";"):
                    raise RustSourceError(f"{self.where(index)}: constant {name} has no value")
                semicolon = self.scan_to(equals + 1, ";")
                self._store(self.consts, (owner, name), ConstItem(self, owner, name, equals + 1, semicolon))
                index = semicolon + 1
            elif text == "const":
                index += 1
            elif text == "fn":
                name = self.tokens[index + 1].text
                cursor = index + 2
                if self.is_punct(cursor, "<"):
                    depth = 0
                    while True:
                        if self.is_punct(cursor, "<"):
                            depth += 1
                        elif self.is_punct(cursor, ">"):
                            depth -= 1
                        elif self.is_punct(cursor, ">>"):
                            depth -= 2
                        cursor += 1
                        if depth <= 0:
                            break
                if not self.is_punct(cursor, "("):
                    raise RustSourceError(f"{self.where(cursor)}: expected the parameters of {name}")
                close = self.closing(cursor)
                params = self._params(cursor + 1, close)
                body = self.scan_to(close + 1, ("{", ";"))
                if self.is_punct(body, "{"):
                    self._store(self.fns, (owner, name), FnItem(self, owner, name, params, body))
                    index = self.closing(body) + 1
                else:
                    index = body + 1
            elif text == "impl":
                brace = self.scan_to(index + 1, ("{",))
                self._index(brace + 1, self.closing(brace), self._impl_type(index + 1, brace))
                index = self.closing(brace) + 1
            elif text in ("struct", "enum", "union", "trait", "type"):
                cursor = index + 1
                while True:
                    stop = self.scan_to(cursor, (";", "{"))
                    if self.is_punct(stop, ";"):
                        index = stop + 1
                        break
                    index = self.closing(stop) + 1
                    break
            elif text == "macro_rules":
                cursor = index + 3  # macro_rules ! name
                index = self.closing(cursor) + 1
            elif self.is_punct(index + 1, "!"):
                group = index + 2
                close = self.closing(group)
                if text == "ids":
                    self._index_ids(group + 1, close, owner)
                index = close + 1
            else:
                raise RustSourceError(f"{self.where(index)}: unexpected {text!r} among items")

    def _index_ids(self, index: int, end: int, owner: str | None) -> None:
        """`NAME = "id";` rows of the command registry's `ids!` table."""
        while index < end:
            name, equals, value, semicolon = self.tokens[index : index + 4]
            if equals.text != "=" or value.kind != "string" or semicolon.text != ";":
                raise RustSourceError(f"{self.where(index)}: unexpected ids! row")
            item = ConstItem(self, owner, name.text, index, index, TupleStruct("CommandKey", (value.value,)))
            self._store(self.consts, (owner, name.text), item)
            index += 4

    def _params(self, start: int, end: int) -> tuple[str, ...]:
        names: list[str] = []
        cursor = start
        while cursor < end:
            stop = cursor
            while stop < end and not self.is_punct(stop, ","):
                if self.tokens[stop].kind == "punct" and self.tokens[stop].text in OPENERS:
                    stop = self.closing(stop)
                stop += 1
            words = [token.text for token in self.tokens[cursor:stop] if token.kind == "ident"]
            if "self" in words[:3]:
                names.append("self")
            elif words:
                names.append(words[1] if words[0] == "mut" else words[0])
            cursor = stop + 1
        return tuple(names)

    def _impl_type(self, start: int, brace: int) -> str:
        tokens = self.tokens[start:brace]
        texts = [token.text for token in tokens]
        if "for" in texts:
            tokens = tokens[texts.index("for") + 1 :]
        depth = 0
        name = None
        for token in tokens:
            if token.text == "<":
                depth += 1
            elif token.text == ">":
                depth -= 1
            elif token.text == ">>":
                depth -= 2
            elif depth == 0 and token.kind == "ident" and token.text != "where":
                name = token.text
            elif token.text == "where":
                break
        if name is None:
            raise RustSourceError(f"{self.where(start)}: cannot name the impl's type")
        return name


# Values ---------------------------------------------------------------------


@dataclass(frozen=True)
class EnumValue:
    enum: str
    variant: str
    args: tuple = ()

    def __repr__(self) -> str:
        inner = f"({', '.join(repr(force(arg)) for arg in self.args)})" if self.args else ""
        return f"{self.enum}::{self.variant}{inner}"


@dataclass(frozen=True)
class TupleStruct:
    type: str
    args: tuple


@dataclass
class StructValue:
    type: str
    fields: dict[str, Any]

    def get(self, name: str) -> Any:
        if name not in self.fields:
            raise RustSourceError(f"{self.type} has no field {name!r}")
        return force(self.fields[name])


@dataclass(frozen=True)
class Opaque:
    """A value the reader does not evaluate: fine until something needs it."""

    reason: str


@dataclass(frozen=True)
class KeyRef:
    """A command key (`x.key()`), with the command value it was taken from."""

    id: Any
    origin: Any


@dataclass
class FnRef:
    item: FnItem


class Lazy:
    """An expression evaluated the first time its value is needed."""

    __slots__ = ("thunk", "value", "done")

    def __init__(self, thunk: Callable[[], Any]) -> None:
        self.thunk = thunk
        self.done = False
        self.value = None

    def get(self) -> Any:
        if not self.done:
            self.value = self.thunk()
            self.thunk = None
            self.done = True
        return self.value


def force(value: Any) -> Any:
    while isinstance(value, Lazy):
        value = value.get()
    return value


def force_all(value: Any) -> Any:
    """`value` with every lazy part, in lists and tuples, evaluated."""
    value = force(value)
    if isinstance(value, list):
        return [force_all(item) for item in value]
    if isinstance(value, tuple):
        return tuple(force_all(item) for item in value)
    return value


# Expressions ----------------------------------------------------------------

BINARY_OPERATORS = {
    "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 3, ">": 3, "<=": 3, ">=": 3,
    "|": 4, "^": 5, "&": 6, "<<": 7, ">>": 7, "+": 8, "-": 8, "*": 9, "/": 9, "%": 9,
}


class Parser:
    """A recursive-descent reader of the expressions in one file's tokens."""

    def __init__(self, file: RustFile, index: int, end: int | None = None) -> None:
        self.file = file
        self.tokens = file.tokens
        self.index = index
        self.end = len(self.tokens) if end is None else end

    def error(self, message: str) -> RustSourceError:
        return RustSourceError(f"{self.file.where(self.index)}: {message}")

    def peek(self, offset: int = 0) -> Token | None:
        position = self.index + offset
        return self.tokens[position] if position < self.end else None

    def at(self, text: str, offset: int = 0) -> bool:
        token = self.peek(offset)
        return token is not None and token.kind in ("punct", "ident") and token.text == text

    def take(self, text: str | None = None) -> Token:
        token = self.peek()
        if token is None or (text is not None and token.text != text):
            raise self.error(f"expected {text!r}, found {token.text if token else 'the end'!r}")
        self.index += 1
        return token

    def skip_generics(self) -> None:
        depth = 0
        while True:
            token = self.take()
            depth += {"<": 1, ">": -1, ">>": -2}.get(token.text, 0) if token.kind == "punct" else 0
            if depth <= 0:
                return

    def expression(self, no_struct: bool = False) -> tuple:
        return self.binary(0, no_struct)

    def binary(self, minimum: int, no_struct: bool) -> tuple:
        left = self.unary(no_struct)
        while True:
            token = self.peek()
            if token is not None and token.kind == "ident" and token.text == "as":
                self.take()
                self.type_until(("{", ",", ")", "]", ";", "=>", "}"))
                left = ("cast", left)
                continue
            if token is None or token.kind != "punct" or token.text not in BINARY_OPERATORS:
                return left
            precedence = BINARY_OPERATORS[token.text]
            if precedence <= minimum:
                return left
            self.take()
            right = self.binary(precedence, no_struct)
            left = ("binary", token.text, left, right)

    def type_until(self, stops: Iterable[str]) -> None:
        stops = set(stops)
        depth = 0
        while True:
            token = self.peek()
            if token is None:
                return
            if token.kind == "punct":
                if depth == 0 and token.text in stops:
                    return
                if token.text in ("<", "(", "["):
                    depth += 1
                elif token.text in (">", ")", "]"):
                    depth -= 1
                elif token.text == ">>":
                    depth -= 2
            self.take()

    def unary(self, no_struct: bool) -> tuple:
        token = self.peek()
        if token is not None and token.kind == "punct" and token.text in ("&", "&&"):
            self.take()
            if self.at("mut"):
                self.take()
            return ("ref", self.unary(no_struct))
        if token is not None and token.kind == "punct" and token.text in ("!", "-", "*"):
            self.take()
            return ("unary", token.text, self.unary(no_struct))
        return self.postfix(self.primary(no_struct))

    def postfix(self, node: tuple) -> tuple:
        while True:
            if self.at("."):
                self.take()
                name = self.take()
                if self.at("::"):
                    self.take()
                    self.skip_generics()
                if self.at("("):
                    node = ("method", node, name.text, self.arguments(), name.line)
                else:
                    node = ("field", node, name.text if name.kind == "ident" else str(name.value))
            elif self.at("("):
                node = ("call", node, self.arguments())
            elif self.at("["):
                self.take()
                index = self.expression()
                self.take("]")
                node = ("index", node, index)
            elif self.at("?"):
                self.take()
            else:
                return node

    def arguments(self) -> list[tuple]:
        self.take("(")
        items = []
        while not self.at(")"):
            items.append(self.expression())
            if not self.at(")"):
                self.take(",")
        self.take(")")
        return items

    def primary(self, no_struct: bool) -> tuple:
        token = self.peek()
        if token is None:
            raise self.error("expected an expression")
        if token.kind in ("string", "char", "number"):
            self.take()
            return ("lit", token.value)
        if token.kind == "punct":
            if token.text == "(":
                self.take()
                items = []
                trailing = False
                while not self.at(")"):
                    items.append(self.expression())
                    trailing = False
                    if not self.at(")"):
                        self.take(",")
                        trailing = True
                self.take(")")
                if len(items) == 1 and not trailing:
                    return items[0]
                return ("tuple", items)
            if token.text == "[":
                self.take()
                items = []
                while not self.at("]"):
                    items.append(self.expression())
                    if self.at(";"):
                        self.take()
                        count = self.expression()
                        self.take("]")
                        return ("repeat", items[0], count)
                    if not self.at("]"):
                        self.take(",")
                self.take("]")
                return ("array", items)
            if token.text == "{":
                return self.block()
            if token.text in ("|", "||"):
                raise self.error("closures are not read")
            raise self.error(f"unexpected {token.text!r}")
        if token.kind != "ident":
            raise self.error(f"unexpected {token.text!r}")
        if token.text in ("true", "false"):
            self.take()
            return ("lit", token.text == "true")
        if token.text == "match":
            return self.match()
        if token.text == "if":
            return self.conditional()
        if token.text == "unsafe" and self.at("{", 1):
            self.take()
            return self.block()
        return self.path_expression(no_struct)

    def path_expression(self, no_struct: bool) -> tuple:
        segments = [self.take().text]
        while self.at("::"):
            self.take()
            if self.at("<"):
                self.skip_generics()
                continue
            segments.append(self.take().text)
        if self.at("!"):
            self.take()
            token = self.peek()
            if token is None or token.text not in OPENERS:
                raise self.error("expected a macro's arguments")
            self.index = self.file.closing(self.index) + 1
            return ("macro", segments[-1])
        last = segments[-1]
        if self.at("{") and not no_struct and (last[0].isupper() or last == "Self"):
            return self.struct_literal(segments)
        return ("path", tuple(segments), self.tokens[self.index - 1].line)

    def struct_literal(self, segments: list[str]) -> tuple:
        self.take("{")
        fields: list[tuple[str, tuple]] = []
        while not self.at("}"):
            if self.at(".."):
                raise self.error("struct update syntax is not read")
            name = self.take().text
            if self.at(":"):
                self.take()
                fields.append((name, self.expression()))
            else:
                fields.append((name, ("path", (name,), 0)))
            if not self.at("}"):
                self.take(",")
        self.take("}")
        return ("struct", tuple(segments), fields)

    def block(self) -> tuple:
        self.take("{")
        statements: list[tuple] = []
        tail = None
        while not self.at("}"):
            if self.at("let"):
                self.take()
                pattern = self.pattern()
                if self.at(":"):
                    self.take()
                    self.type_until(("=",))
                self.take("=")
                value = self.expression()
                self.take(";")
                statements.append(("let", pattern, value))
                continue
            if self.at(";"):
                self.take()
                continue
            expression = self.expression()
            if self.at(";"):
                self.take()
                statements.append(("expr", expression))
            elif self.at("}"):
                tail = expression
            elif expression[0] in ("match", "if", "block"):
                statements.append(("expr", expression))
            else:
                raise self.error("expected ';' or '}' after an expression")
        self.take("}")
        return ("block", statements, tail)

    def conditional(self) -> tuple:
        self.take("if")
        if self.at("let"):
            raise self.error("if let is not read")
        condition = self.expression(no_struct=True)
        then = self.block()
        otherwise = None
        if self.at("else"):
            self.take()
            otherwise = self.conditional() if self.at("if") else self.block()
        return ("if", condition, then, otherwise)

    def match(self) -> tuple:
        self.take("match")
        scrutinee = self.expression(no_struct=True)
        self.take("{")
        arms = []
        while not self.at("}"):
            line = self.peek().line
            pattern = self.pattern()
            guard = None
            if self.at("if"):
                self.take()
                guard = self.expression()
            self.take("=>")
            body = self.expression()
            if self.at(","):
                self.take()
            elif not self.at("}") and body[0] not in ("block", "match", "if"):
                raise self.error("expected ',' after a match arm")
            arms.append((pattern, guard, body, line))
        self.take("}")
        return ("match", scrutinee, arms)

    def pattern(self) -> tuple:
        alternatives = [self.single_pattern()]
        while self.at("|"):
            self.take()
            alternatives.append(self.single_pattern())
        return alternatives[0] if len(alternatives) == 1 else ("alts", alternatives)

    def single_pattern(self) -> tuple:
        token = self.peek()
        if token is None:
            raise self.error("expected a pattern")
        if token.kind in ("string", "char", "number"):
            self.take()
            return ("lit", token.value)
        if token.kind == "punct" and token.text in ("&", "&&"):
            self.take()
            return self.single_pattern()
        if token.kind == "punct" and token.text == "(":
            self.take()
            items = []
            while not self.at(")"):
                items.append(self.pattern())
                if not self.at(")"):
                    self.take(",")
            self.take(")")
            return ("tuple", items)
        if token.kind != "ident":
            raise self.error(f"unexpected {token.text!r} in a pattern")
        if token.text == "_":
            self.take()
            return ("wild",)
        if token.text in ("true", "false"):
            self.take()
            return ("lit", token.text == "true")
        segments = [self.take().text]
        while self.at("::"):
            self.take()
            segments.append(self.take().text)
        if self.at("("):
            self.take()
            items = []
            while not self.at(")"):
                items.append(self.pattern())
                if not self.at(")"):
                    self.take(",")
            self.take(")")
            return ("variant", tuple(segments), items)
        if self.at("{"):
            raise self.error("struct patterns are not read")
        if len(segments) == 1 and (segments[0][0].islower() or segments[0][0] == "_") and segments[0] != "self":
            if self.at("@"):
                self.take()
                return ("at", segments[0], self.single_pattern())
            return ("bind", segments[0])
        return ("variant", tuple(segments), None)


# Evaluation -----------------------------------------------------------------


Builtin = Callable[..., Any]


@dataclass
class Environment:
    file: RustFile
    self_type: str | None
    variables: dict[str, Any] = field(default_factory=dict)

    def child(self, **variables: Any) -> "Environment":
        return Environment(self.file, self.self_type, {**self.variables, **variables})


class Program:
    """Every file the generator reads, and the evaluation of their items."""

    def __init__(self, files: Iterable[RustFile], builtins: dict[tuple[str, ...], Builtin] | None = None) -> None:
        self.files = list(files)
        self.builtins = builtins or {}
        self.consts: dict[tuple[str | None, str], list[ConstItem]] = {}
        self.fns: dict[tuple[str | None, str], list[FnItem]] = {}
        for file in self.files:
            for key, item in file.consts.items():
                self.consts.setdefault(key, []).append(item)
            for key, item in file.fns.items():
                self.fns.setdefault(key, []).append(item)
        self.parsed: dict[tuple[int, int], tuple] = {}
        self.const_values: dict[int, Any] = {}

    def file(self, path: str) -> RustFile:
        for file in self.files:
            if file.path == path:
                return file
        raise RustSourceError(f"{path} is not loaded")

    # Lookup ---------------------------------------------------------------

    def _one(self, table: dict, key: tuple[str | None, str], file: RustFile | None) -> Any:
        if file is not None:
            local = (file.consts if table is self.consts else file.fns).get(key)
            if local is not None:
                if key in file.duplicates:
                    raise RustSourceError(f"{file.path}: {key[1]} is declared twice")
                return local
            if key[0] is None:
                return None
        items = table.get(key, [])
        if len(items) > 1:
            places = ", ".join(item.file.path for item in items)
            raise RustSourceError(f"{key[0]}::{key[1]} is declared in several files: {places}")
        return items[0] if items else None

    def const_item(self, owner: str | None, name: str, file: RustFile | None = None) -> ConstItem | None:
        return self._one(self.consts, (owner, name), file)

    def fn_item(self, owner: str | None, name: str, file: RustFile | None = None) -> FnItem | None:
        return self._one(self.fns, (owner, name), file)

    # Items ----------------------------------------------------------------

    def const_value(self, item: ConstItem) -> Any:
        if item.value is not None:
            return item.value
        key = id(item)
        if key not in self.const_values:
            node = Parser(item.file, item.start, item.end).expression()
            self.const_values[key] = Lazy(
                lambda: self.evaluate(node, Environment(item.file, item.owner))
            )
        return self.const_values[key]

    def call_fn(self, item: FnItem, arguments: list[Any], receiver: Any = None) -> Any:
        key = (id(item.file), item.body)
        if key not in self.parsed:
            self.parsed[key] = Parser(item.file, item.body).block()
        params = list(item.params)
        variables: dict[str, Any] = {}
        if params and params[0] == "self":
            if receiver is None:
                raise RustSourceError(f"{item.file.path}: {item.name} needs a receiver")
            variables["self"] = receiver
            params = params[1:]
        if len(params) != len(arguments):
            raise RustSourceError(
                f"{item.file.path}: {item.name} takes {len(params)} arguments, given {len(arguments)}"
            )
        variables.update(zip(params, arguments))
        return self.evaluate(self.parsed[key], Environment(item.file, item.owner, variables))

    def call_method(self, receiver: Any, name: str, arguments: list[Any] | None = None) -> Any:
        """`receiver.name(arguments)`, with the receiver's type's own method."""
        return self.method(receiver, name, arguments or [], None)

    # Expressions ------------------------------------------------------------

    def evaluate(self, node: tuple, environment: Environment) -> Any:
        kind = node[0]
        if kind == "lit":
            return node[1]
        if kind == "ref" or kind == "cast":
            return self.evaluate(node[1], environment)
        if kind == "path":
            return self.resolve_path(node[1], environment, node[2])
        if kind == "tuple":
            return tuple(self.defer(item, environment) for item in node[1])
        if kind == "array":
            return [self.defer(item, environment) for item in node[1]]
        if kind == "repeat":
            return Opaque("repeated array")
        if kind == "struct":
            type_name = self.type_name(node[1], environment)
            return StructValue(
                type_name, {name: self.defer(value, environment) for name, value in node[2]}
            )
        if kind == "call":
            return self.call(node[1], node[2], environment)
        if kind == "method":
            receiver = force(self.evaluate(node[1], environment))
            arguments = [self.defer(argument, environment) for argument in node[3]]
            return self.method(receiver, node[2], arguments, environment.file.path + f":{node[4]}")
        if kind == "field":
            target = force(self.evaluate(node[1], environment))
            if isinstance(target, Opaque):
                return target
            if isinstance(target, StructValue):
                return target.get(node[2])
            if isinstance(target, TupleStruct) and node[2].isdigit():
                return target.args[int(node[2])]
            if isinstance(target, tuple) and node[2].isdigit():
                return target[int(node[2])]
            return Opaque(f"field {node[2]} of {target!r}")
        if kind == "index":
            return Opaque("indexing")
        if kind in ("binary", "unary", "macro"):
            return Opaque(kind)
        if kind == "block":
            return self.evaluate_block(node, environment)
        if kind == "if":
            condition = force(self.evaluate(node[1], environment))
            if not isinstance(condition, bool):
                return Opaque("condition")
            branch = node[2] if condition else node[3]
            return None if branch is None else self.evaluate(branch, environment)
        if kind == "match":
            return self.evaluate_match(node, environment)
        raise RustSourceError(f"{environment.file.path}: cannot evaluate {kind}")

    def defer(self, node: tuple, environment: Environment) -> Any:
        if node[0] == "lit":
            return node[1]
        return Lazy(lambda: self.evaluate(node, environment))

    def evaluate_block(self, node: tuple, environment: Environment) -> Any:
        scope = environment.child()
        for statement in node[1]:
            if statement[0] == "let":
                value = self.defer(statement[2], scope)
                bindings = self.bind(statement[1], value, lazy=True)
                if bindings is None:
                    raise RustSourceError(f"{environment.file.path}: a let pattern does not match")
                scope = scope.child(**bindings)
            else:
                self.evaluate(statement[1], scope)
        return None if node[2] is None else self.evaluate(node[2], scope)

    def evaluate_match(self, node: tuple, environment: Environment) -> Any:
        value = force(self.evaluate(node[1], environment))
        if isinstance(value, Opaque):
            raise RustSourceError(f"{environment.file.path}: cannot match on {value.reason}")
        for pattern, guard, body, line in node[2]:
            bindings = self.bind(pattern, value, environment=environment)
            if bindings is None:
                continue
            if guard is not None:
                raise RustSourceError(f"{environment.file.path}:{line}: match guards are not read")
            return self.evaluate(body, environment.child(**bindings))
        raise RustSourceError(f"{environment.file.path}: no match arm takes {value!r}")

    def bind(
        self,
        pattern: tuple,
        value: Any,
        *,
        lazy: bool = False,
        environment: Environment | None = None,
    ) -> dict[str, Any] | None:
        kind = pattern[0]
        if kind == "wild":
            return {}
        if kind == "bind":
            return {pattern[1]: value}
        if kind == "at":
            inner = self.bind(pattern[2], value, environment=environment)
            return None if inner is None else {**inner, pattern[1]: value}
        if kind == "alts":
            for alternative in pattern[1]:
                bindings = self.bind(alternative, value, environment=environment)
                if bindings is not None:
                    return bindings
            return None
        value = force(value)
        if kind == "lit":
            return {} if value == pattern[1] else None
        if kind == "tuple":
            if not isinstance(value, tuple) or len(value) != len(pattern[1]):
                return None
            bindings: dict[str, Any] = {}
            for sub, item in zip(pattern[1], value):
                found = self.bind(sub, item, lazy=lazy, environment=environment)
                if found is None:
                    return None
                bindings.update(found)
            return bindings
        if kind == "variant":
            if not isinstance(value, EnumValue):
                return None
            enum, variant = self.variant_name(pattern[1], environment)
            if value.variant != variant or (enum is not None and value.enum != enum):
                return None
            subpatterns = pattern[2]
            if subpatterns is None:
                return {} if not value.args else None
            if len(subpatterns) != len(value.args):
                return None
            bindings = {}
            for sub, item in zip(subpatterns, value.args):
                found = self.bind(sub, item, environment=environment)
                if found is None:
                    return None
                bindings.update(found)
            return bindings
        raise RustSourceError(f"unknown pattern {kind}")

    def variant_name(self, segments: tuple[str, ...], environment: Environment | None) -> tuple[str | None, str]:
        segments = self.normalize(segments, environment)
        if len(segments) == 1:
            return None, segments[0]
        return segments[-2], segments[-1]

    def normalize(self, segments: tuple[str, ...], environment: Environment | None) -> tuple[str, ...]:
        parts = list(segments)
        if parts and parts[0] == "Self":
            if environment is None or environment.self_type is None:
                raise RustSourceError("Self outside an impl")
            parts[0] = environment.self_type
        while len(parts) > 1 and parts[0] in ("crate", "super", "self"):
            parts.pop(0)
        return tuple(parts)

    def type_name(self, segments: tuple[str, ...], environment: Environment) -> str:
        return self.normalize(segments, environment)[-1]

    def resolve_path(self, segments: tuple[str, ...], environment: Environment, line: int) -> Any:
        if len(segments) == 1:
            name = segments[0]
            if name in environment.variables:
                return environment.variables[name]
            if name == "self":
                raise RustSourceError(f"{environment.file.path}:{line}: self outside a method")
            item = self.const_item(None, name, environment.file)
            if item is not None:
                return self.const_value(item)
            function = self.fn_item(None, name, environment.file)
            if function is not None:
                return FnRef(function)
            builtin = self.builtins.get((name,))
            if builtin is not None:
                return builtin()
            if name == "Self" and environment.self_type:
                return EnumValue(environment.self_type, environment.self_type)
            return Opaque(f"{name} ({environment.file.path}:{line})")
        parts = self.normalize(segments, environment)
        owner, member = parts[-2], parts[-1]
        item = self.const_item(owner, member)
        if item is not None:
            return self.const_value(item)
        function = self.fn_item(owner, member)
        if function is not None:
            return FnRef(function)
        builtin = self.builtins.get((owner, member))
        if builtin is not None:
            return builtin()
        if member[0].isupper():
            return EnumValue(owner, member)
        return Opaque(f"{'::'.join(parts)} ({environment.file.path}:{line})")

    def call(self, callee: tuple, arguments: list[tuple], environment: Environment) -> Any:
        values = [self.defer(argument, environment) for argument in arguments]
        if callee[0] != "path":
            target = force(self.evaluate(callee, environment))
            if isinstance(target, FnRef):
                return self.call_fn(target.item, values)
            return Opaque("call")
        segments = callee[1]
        if len(segments) == 1:
            name = segments[0]
            function = self.fn_item(None, name, environment.file)
            if function is not None:
                return self.call_fn(function, values)
            builtin = self.builtins.get((name,))
            if builtin is not None:
                return builtin(*values)
            if name == "Self" and environment.self_type:
                return TupleStruct(environment.self_type, tuple(force_all(values)))
            if name[0].isupper():
                return TupleStruct(name, tuple(force_all(values)))
            if name in ("Some", "Ok", "Err"):
                return values[0] if values else None
            return Opaque(f"{name}() ({environment.file.path})")
        parts = self.normalize(segments, environment)
        owner, member = parts[-2], parts[-1]
        function = self.fn_item(owner, member)
        if function is not None:
            if function.params and function.params[0] == "self":
                return self.call_fn(function, values[1:], receiver=force(values[0]))
            return self.call_fn(function, values)
        builtin = self.builtins.get((owner, member))
        if builtin is not None:
            return builtin(*values)
        if member[0].isupper():
            return EnumValue(owner, member, tuple(force_all(values)))
        return Opaque(f"{'::'.join(parts)}() ({environment.file.path})")

    def method(self, receiver: Any, name: str, arguments: list[Any], where: str | None) -> Any:
        if isinstance(receiver, Opaque):
            return receiver
        builtin = self.builtins.get(("." + name,))
        if builtin is not None:
            handled = builtin(receiver, *arguments)
            if handled is not NotImplemented:
                return handled
        type_name = None
        if isinstance(receiver, EnumValue):
            type_name = receiver.enum
        elif isinstance(receiver, (StructValue, TupleStruct)):
            type_name = receiver.type
        if type_name is not None:
            function = self.fn_item(type_name, name)
            if function is not None:
                result = self.call_fn(function, arguments, receiver=receiver)
                if name == "key":
                    key = force(result)
                    if isinstance(key, TupleStruct) and key.type == "CommandKey":
                        return KeyRef(force(key.args[0]), receiver)
                return result
        if name in ("clone", "into", "to_owned", "unwrap"):
            return receiver
        return Opaque(f".{name}() on {receiver!r} ({where})")
