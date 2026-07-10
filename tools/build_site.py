#!/usr/bin/env python3
"""Validate and assemble the deployable RSpice static site."""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from check_site import print_result, validate_site
from reference_catalog import generate_reference_bundle


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SOURCE = (REPOSITORY_ROOT / "public").resolve()
WORKBENCH_SOURCE_SUFFIX = Path(
    "mockups/rspice-workbench-host/public/rspice"
)
WORKBENCH_FILES = ("index.html", "styles.css", "app.js")
RSPICE_CATALOG_FILES = (
    "README.md",
    "Cargo.toml",
    "crates/rspice-cli/README.md",
    "tests/ngspice/validation-manifest.tsv",
    "tests/xyce/RSPICE-HARNESS-MANIFEST.tsv",
    ".github/workflows/nightly.yml",
    "benchmarks/scoreboards/scoreboard.json",
)
WORKBENCH_ASSET_REWRITES = {
    "../../assets/brand/logo.svg": "../assets/brand/logo.svg",
    "../../crates/rspice-ui/assets/fonts/": "../assets/fonts/",
}
PROTECTED_PATHS = {
    REPOSITORY_ROOT.resolve(),
    SOURCE,
    (REPOSITORY_ROOT / ".git").resolve(),
    (REPOSITORY_ROOT / ".github").resolve(),
    (REPOSITORY_ROOT / "tools").resolve(),
}


def default_workbench_source() -> Path:
    """Resolve local source layouts, then the reviewed site vendor snapshot."""
    candidates = (
        REPOSITORY_ROOT.parent / "RSpice" / WORKBENCH_SOURCE_SUFFIX,
        REPOSITORY_ROOT.parent / WORKBENCH_SOURCE_SUFFIX,
        SOURCE / "workbench",
    )
    return next((candidate for candidate in candidates if candidate.is_dir()), candidates[0])


def default_rspice_source() -> Path:
    """Resolve the local sibling checkout and the nested CI checkout."""
    candidates = (
        REPOSITORY_ROOT.parent / "RSpice",
        REPOSITORY_ROOT / "rspice-source",
    )
    return next((candidate for candidate in candidates if candidate.is_dir()), candidates[0])


def is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def safe_destination(raw_output: Path) -> Path:
    unresolved = (
        raw_output if raw_output.is_absolute() else REPOSITORY_ROOT / raw_output
    )
    is_junction = getattr(unresolved, "is_junction", lambda: False)
    if unresolved.is_symlink() or is_junction():
        raise ValueError("output must not be a symbolic link or directory junction")
    try:
        output = unresolved.resolve()
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"output cannot be resolved: {exc}") from exc

    if not is_within(output, REPOSITORY_ROOT):
        raise ValueError("output must stay inside the repository")
    if output in PROTECTED_PATHS:
        raise ValueError(f"refusing protected output path: {output}")
    if is_within(output, SOURCE) or is_within(SOURCE, output):
        raise ValueError("output must not contain, equal, or sit inside public/")
    for protected in PROTECTED_PATHS - {REPOSITORY_ROOT, SOURCE}:
        if is_within(output, protected) or is_within(protected, output):
            raise ValueError(
                f"refusing output that overlaps protected path: {protected}"
            )

    relative = output.relative_to(REPOSITORY_ROOT)
    if not relative.parts or relative.parts[0].startswith("."):
        raise ValueError("output must use a non-hidden build directory")
    return output


def safe_workbench_source(raw_source: Path) -> Path:
    is_junction = getattr(raw_source, "is_junction", lambda: False)
    if raw_source.is_symlink() or is_junction():
        raise ValueError("workbench source must not be a symbolic link or directory junction")
    try:
        source = raw_source.resolve()
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"workbench source cannot be resolved: {exc}") from exc
    if not source.is_dir():
        raise ValueError(f"workbench source is not a directory: {source}")
    for name in WORKBENCH_FILES:
        if not (source / name).is_file():
            raise ValueError(f"workbench source is missing required file: {name}")
    workbench_font_source(source)
    return source


def workbench_font_source(source: Path) -> Path:
    candidates = (
        source.parent / "crates" / "rspice-ui" / "assets" / "fonts",
        SOURCE / "assets" / "fonts",
    )
    font_source = next((candidate for candidate in candidates if candidate.is_dir()), None)
    if font_source is None:
        raise ValueError(
            "workbench source is missing bundled fonts in both its host tree and public/assets/fonts"
        )
    return font_source


def safe_rspice_source(raw_source: Path) -> Path:
    is_junction = getattr(raw_source, "is_junction", lambda: False)
    if raw_source.is_symlink() or is_junction():
        raise ValueError("RSpice source must not be a symbolic link or directory junction")
    try:
        source = raw_source.resolve()
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"RSpice source cannot be resolved: {exc}") from exc
    if not source.is_dir():
        raise ValueError(f"RSpice source is not a directory: {source}")
    if not (source / ".git").exists():
        raise ValueError(f"RSpice source is not a Git checkout: {source}")
    for relative in RSPICE_CATALOG_FILES:
        if not (source / relative).is_file():
            raise ValueError(f"RSpice source is missing catalog input: {relative}")
    return source


def safe_validation_artifacts(raw_directory: Path | None) -> Path | None:
    if raw_directory is None:
        return None
    is_junction = getattr(raw_directory, "is_junction", lambda: False)
    if raw_directory.is_symlink() or is_junction():
        raise ValueError("validation artifacts must not use a symbolic link or directory junction")
    try:
        directory = raw_directory.resolve()
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"validation artifacts cannot be resolved: {exc}") from exc
    if not directory.is_dir():
        raise ValueError(f"validation artifacts are not a directory: {directory}")
    return directory


def overlay_workbench(output: Path, source: Path) -> None:
    destination = output / "workbench"
    font_source = workbench_font_source(source)
    font_destination = output / "assets" / "fonts"

    if destination.resolve().parent != output.resolve() or destination.name != "workbench":
        raise ValueError("refusing unsafe Workbench output destination")
    if destination.is_symlink() or getattr(destination, "is_junction", lambda: False)():
        raise ValueError("refusing Workbench output through a link or junction")
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination, copy_function=shutil.copy2)
    shutil.copytree(
        font_source,
        font_destination,
        copy_function=shutil.copy2,
        dirs_exist_ok=True,
    )

    deployed_asset_counts = {source_url: 0 for source_url in WORKBENCH_ASSET_REWRITES}
    text_files = tuple(destination.rglob("*.html")) + tuple(destination.rglob("*.css"))
    for text_file in text_files:
        content = text_file.read_text(encoding="utf-8")
        rewritten = content
        for source_url, deploy_url in WORKBENCH_ASSET_REWRITES.items():
            if source_url in rewritten:
                rewritten = rewritten.replace(source_url, deploy_url)
            deployed_asset_counts[source_url] += rewritten.count(deploy_url)
        if rewritten != content:
            text_file.write_text(rewritten, encoding="utf-8", newline="\n")

    if not deployed_asset_counts["../../assets/brand/logo.svg"]:
        raise ValueError("workbench source does not contain the expected brand asset URL")
    if not deployed_asset_counts["../../crates/rspice-ui/assets/fonts/"]:
        raise ValueError("workbench source does not contain the expected font asset URLs")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        "--output",
        dest="output",
        type=Path,
        default=Path("dist"),
        help="repository-local output directory (default: dist)",
    )
    parser.add_argument(
        "--workbench-source",
        type=Path,
        default=default_workbench_source(),
        help="existing RSpice Workbench static-host source to overlay (default: local simulator source or reviewed public snapshot)",
    )
    parser.add_argument(
        "--rspice-source",
        type=Path,
        default=default_rspice_source(),
        help="RSpice Git checkout used to generate the technical catalog (default: local sibling or CI checkout)",
    )
    parser.add_argument(
        "--validation-artifacts",
        type=Path,
        help="optional downloaded validation artifact directory for the selected source revision",
    )
    parser.add_argument(
        "--validation-run-url",
        help="optional workflow URL recorded beside imported validation artifacts",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        output = safe_destination(args.output)
        workbench_source = safe_workbench_source(args.workbench_source)
        rspice_source = safe_rspice_source(args.rspice_source)
        validation_artifacts = safe_validation_artifacts(args.validation_artifacts)
        if is_within(workbench_source, output) or is_within(output, workbench_source):
            raise ValueError("workbench source must not overlap the build output")
        if validation_artifacts and (
            is_within(validation_artifacts, output)
            or is_within(output, validation_artifacts)
        ):
            raise ValueError("validation artifacts must not overlap the build output")
    except ValueError as exc:
        print(f"build refused: {exc}", file=sys.stderr)
        return 2

    source_result = validate_site(SOURCE)
    print_result(source_result)
    if not source_result.ok:
        print("build stopped because public/ did not pass validation", file=sys.stderr)
        return 1

    try:
        if output.exists():
            if not output.is_dir():
                print(
                    f"build refused: output exists and is not a directory: {output}",
                    file=sys.stderr,
                )
                return 2
            shutil.rmtree(output)
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(SOURCE, output, copy_function=shutil.copy2)
        overlay_workbench(output, workbench_source)
        generate_reference_bundle(
            output,
            rspice_source,
            validation_artifacts,
            args.validation_run_url,
        )
    except (OSError, shutil.Error, ValueError) as exc:
        print(f"build failed while assembling {output}: {exc}", file=sys.stderr)
        return 1

    output_result = validate_site(output)
    print_result(output_result)
    if not output_result.ok:
        print("build output failed validation", file=sys.stderr)
        return 1

    print(f"static site built at {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
