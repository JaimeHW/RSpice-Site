import importlib.util
import contextlib
import gzip
import io
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
RSPICE_ROOT = Path(os.environ.get("RSPICE_TEST_SOURCE", ROOT.parent / "RSpice"))
BUILD_SITE_PATH = ROOT / "tools" / "build_simulator.py"
SPEC = importlib.util.spec_from_file_location("build_site", BUILD_SITE_PATH)
build_site = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(build_site)


def assert_gate_fails(testcase: unittest.TestCase, func, *args) -> None:
    with contextlib.redirect_stderr(io.StringIO()):
        with testcase.assertRaises(SystemExit):
            func(*args)


class BuildSiteGateTests(unittest.TestCase):
    def test_failed_client_jit_probe_keeps_its_diagnostics_visible(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            script = root / "tools/ci/check_wasm_jit_browser.py"
            script.parent.mkdir(parents=True)
            script.write_text('import sys\nprint("solver probe reached")\nprint("expected ABI 9; got 8", file=sys.stderr)\nsys.exit(1)\n', encoding="utf-8")
            output, errors = io.StringIO(), io.StringIO()
            with contextlib.redirect_stdout(output), contextlib.redirect_stderr(errors):
                with self.assertRaises(subprocess.CalledProcessError):
                    build_site.headless_solve_gate(root, "a" * 64, root, root)
            self.assertIn("solver probe reached", output.getvalue())
            self.assertIn("expected ABI 9; got 8", errors.getvalue())
            self.assertFalse((root / "browser-qualification.json").exists())

    @staticmethod
    def make_site_source(path: Path) -> None:
        (path / "assets").mkdir(parents=True)
        (path / "index.html").write_text("index", encoding="utf-8")
        (path / "404.html").write_text("missing", encoding="utf-8")

    @staticmethod
    def make_ide_build_outputs(ide: Path) -> None:
        pkg = ide / "pkg"
        pkg.mkdir(parents=True)
        shutil.copy2(
            RSPICE_ROOT / "crates" / "rspice-ui" / "web" / "index.html",
            ide / "index.html",
        )
        for name in ("simulation-worker.js", "wasm-loader.js", "automation-worker.js"):
            shutil.copy2(RSPICE_ROOT / "crates/rspice-ui/web" / name, ide / name)
        for name, _ in build_site.UI_MODULES:
            (pkg / (name + ".js")).write_text(
                "export { initSync, __wbg_init as default };\n", encoding="utf-8")
            payload = b"\x00asm\x01\x00\x00\x00"
            if name == "rspice-ui-worker":
                payload += b"\x00\x02\x01w"  # distinct valid custom section
            (pkg / (name + "_bg.wasm")).write_bytes(payload)
        (ide / "python").mkdir()
        (ide / "python/rspice_browser_bootstrap.py").write_text("# runtime fixture\n", encoding="utf-8")

    def test_site_source_boundary_rejects_client_runtime_routes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            site = Path(tmp) / "public"
            self.make_site_source(site)

            build_site.validate_site_source(site)
            (site / "ide").mkdir()
            assert_gate_fails(self, build_site.validate_site_source, site)

    def test_site_source_boundary_requires_expected_path_types(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            site = Path(tmp) / "public"
            self.make_site_source(site)
            (site / "index.html").unlink()
            (site / "index.html").mkdir()

            assert_gate_fails(self, build_site.validate_site_source, site)

    def test_output_boundary_rejects_checkout_source_overlap_and_external_paths(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            root = base / "rspice"
            site_parent = root / "_site-source"
            site = site_parent / "dist"
            root.mkdir()
            self.make_site_source(site)
            source_directory = root / "crates"
            source_directory.mkdir()
            non_directory_output = root / "_site-file"
            non_directory_output.write_text("not a directory", encoding="utf-8")

            for output in (
                root,
                site_parent,
                site,
                site / "nested",
                source_directory,
                non_directory_output,
                base / "external",
            ):
                assert_gate_fails(
                    self,
                    build_site.validated_output_path,
                    root,
                    site,
                    output,
                )

    def test_output_boundary_allows_site_owned_staging_layout(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "site"
            site = root / "dist"
            root.mkdir()
            self.make_site_source(site)

            output = build_site.validated_output_path(
                root, site, root / "_site-production"
            )

            self.assertEqual(output, (root / "_site-production").resolve())

            for protected in (root / ".git", root / "tools"):
                protected.mkdir(exist_ok=True)
                assert_gate_fails(
                    self,
                    build_site.validated_output_path,
                    root,
                    site,
                    protected,
                )

    def test_assembly_refuses_checkout_root_without_deleting_it(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "rspice"
            site = root / "site-source"
            root.mkdir()
            self.make_site_source(site)
            sentinel = root / "keep.txt"
            sentinel.write_text("keep", encoding="utf-8")

            assert_gate_fails(
                self, build_site.assemble_site_sources, root, root, site, root
            )

            self.assertEqual(sentinel.read_text(encoding="utf-8"), "keep")

    def test_assembly_overlays_only_canonical_client_shell_files(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            site = root / "site-source" / "public"
            out = root / "_site-test"
            ui = root / "crates" / "rspice-ui" / "web"
            self.make_site_source(site)
            ui.mkdir(parents=True)

            (site / "index.html").write_text("marketing", encoding="utf-8")
            (site / "assets" / "site.css").write_text("body{}", encoding="utf-8")
            (ui / "index.html").write_text("ide", encoding="utf-8")
            (ui / "simulation-worker.js").write_text("ide worker", encoding="utf-8")
            (ui / "wasm-loader.js").write_text("module loader", encoding="utf-8")
            (ui / "automation-worker.js").write_text("Python worker", encoding="utf-8")
            (ui / "python").mkdir()
            (ui / "python/runtime.wasm").write_bytes(b"python fixture")
            (ui / "README.md").write_text("do not deploy", encoding="utf-8")

            build_site.assemble_site_sources(root, root, site, out)

            self.assertEqual((out / "index.html").read_text(encoding="utf-8"), "marketing")
            self.assertEqual((out / "ide" / "index.html").read_text(encoding="utf-8"), "ide")
            self.assertFalse((out / "ide" / "README.md").exists())
            self.assertEqual((out / "ide/python/runtime.wasm").read_bytes(), b"python fixture")


    def test_windows_cargo_build_retries_once(self) -> None:
        with mock.patch.object(build_site.os, "name", "nt"), mock.patch.object(
            build_site, "run"
        ) as run:
            run.side_effect = [
                subprocess.CalledProcessError(101, ["cargo", "build"]),
                None,
            ]

            build_site.run_cargo_build(["cargo", "build"], ROOT)

            self.assertEqual(run.call_count, 2)

    def test_ide_gate_requires_startup_error_lifecycle_hooks(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            ide = out / "ide"
            ide.mkdir()
            (ide / "index.html").write_text(
                """
                <script type="module">
                window.__RSPICE_SIM_WORKER = new Worker(
                  new URL("./simulation-worker.js", import.meta.url),
                  { type: "module" },
                );
                </script>
                """,
                encoding="utf-8",
            )
            (ide / "simulation-worker.js").write_text(
                """
                import init, { runRspiceUiWorkerRequest } from "./pkg/rspice-ui.js";
                postMessage({ type: "ready" });
                postMessage({ type: "result" });
                postMessage({ type: "error" });
                """,
                encoding="utf-8",
            )

            assert_gate_fails(self, build_site.gate_ide_worker, out)

    def test_executable_asset_identity_changes_with_any_payload_byte(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            asset_root = Path(tmp)
            for name in build_site.IDE_EXECUTABLE_FILES:
                (asset_root / name).write_bytes(b"fixture")
            (asset_root / "python").mkdir()
            (asset_root / "python/runtime").write_bytes(b"python fixture")
            wasm = asset_root / "rspice-ui_bg.wasm.gz"
            wasm.write_bytes(b"compressed fixture")

            first = build_site.executable_asset_identity(asset_root)
            self.assertEqual(first, build_site.executable_asset_identity(asset_root))
            self.assertRegex(first, r"^[0-9a-f]{64}$")
            for name in (*build_site.IDE_EXECUTABLE_FILES, "python/runtime"):
                payload = (asset_root / name).read_bytes()
                (asset_root / name).write_bytes(payload + b"\x01")
                self.assertNotEqual(first, build_site.executable_asset_identity(asset_root), name)
                (asset_root / name).write_bytes(payload)

    def test_packaging_removes_mutable_outputs_and_gate_accepts_exact_digest(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            ide = out / "ide"
            self.make_ide_build_outputs(ide)
            scripts = {name: (ide / name).read_bytes() for name in
                       ("simulation-worker.js", "wasm-loader.js", "automation-worker.js")}
            modules = {name: (ide / "pkg" / (name + "_bg.wasm")).read_bytes()
                       for name, _ in build_site.UI_MODULES}

            identity = build_site.package_ide_executable_assets(ide)

            self.assertEqual(build_site.gate_ide_worker(out), identity)
            self.assertTrue((ide / "assets" / identity).is_dir())
            self.assertFalse((ide / "simulation-worker.js").exists())
            self.assertFalse((ide / "pkg").exists())
            self.assertFalse((ide / "python").exists())
            assets = ide / "assets" / identity
            for name, payload in scripts.items():
                self.assertEqual((assets / name).read_bytes(), payload, "client source was rewritten")
            for name, payload in modules.items():
                self.assertEqual(gzip.decompress((assets / (name + "_bg.wasm.gz")).read_bytes()), payload)
            self.assertIn(
                '/ide/assets/%s' % identity,
                (ide / "index.html").read_text(encoding="utf-8"),
            )

    def test_missing_worker_module_rejects_ui_only_outputs_before_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            ide = Path(tmp) / "ide"
            self.make_ide_build_outputs(ide)
            (ide / "pkg/rspice-ui-worker_bg.wasm").unlink()
            ui_before = (ide / "pkg/rspice-ui_bg.wasm").read_bytes()
            assert_gate_fails(self, build_site.package_ide_executable_assets, ide)
            self.assertEqual((ide / "pkg/rspice-ui_bg.wasm").read_bytes(), ui_before)
            self.assertFalse((ide / ".executable-asset-stage").exists())

    def test_ide_gate_rejects_absent_and_mismatched_digest_directories(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            ide = out / "ide"
            self.make_ide_build_outputs(ide)
            identity = build_site.package_ide_executable_assets(ide)
            asset_root = ide / "assets" / identity
            absent_name = "0" * 64
            index = ide / "index.html"
            source = index.read_text(encoding="utf-8")
            index.write_text(source.replace(identity, absent_name), encoding="utf-8")

            assert_gate_fails(self, build_site.gate_ide_worker, out)

            asset_root.rename(ide / "assets" / absent_name)
            assert_gate_fails(
                self,
                build_site.gate_ide_worker,
                out,
            )

    def test_ide_gate_rejects_tampered_content_and_every_mutable_alias(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            ide = out / "ide"
            self.make_ide_build_outputs(ide)
            identity = build_site.package_ide_executable_assets(ide)
            worker = ide / "assets" / identity / "simulation-worker.js"
            worker.write_text(worker.read_text(encoding="utf-8") + "\n// tampered\n")
            assert_gate_fails(self, build_site.gate_ide_worker, out)

        for alias in (*build_site.IDE_EXECUTABLE_FILES, "pkg", "python"):
            with self.subTest(alias=alias), tempfile.TemporaryDirectory() as tmp:
                out = Path(tmp)
                ide = out / "ide"
                self.make_ide_build_outputs(ide)
                build_site.package_ide_executable_assets(ide)
                mutable = ide / alias
                if alias in ("pkg", "python"):
                    mutable.mkdir()
                else:
                    mutable.write_bytes(b"mutable alias")
                assert_gate_fails(self, build_site.gate_ide_worker, out)

    def test_packaging_rejects_unexpected_wasm_bindgen_outputs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            ide = Path(tmp) / "ide"
            self.make_ide_build_outputs(ide)
            (ide / "pkg" / "rspice-ui.d.ts").write_text(
                "unexpected", encoding="utf-8"
            )

            assert_gate_fails(
                self,
                build_site.package_ide_executable_assets,
                ide,
            )

    def test_release_identity_gate_requires_a_clean_checkout(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            subprocess.run(["git", "init", "-q", str(checkout)], check=True)
            tracked = checkout / "tracked.txt"
            tracked.write_text("accepted", encoding="utf-8")
            subprocess.run(["git", "-C", str(checkout), "add", "tracked.txt"], check=True)
            subprocess.run(
                [
                    "git",
                    "-C",
                    str(checkout),
                    "-c",
                    "user.name=RSpice Test",
                    "-c",
                    "user.email=rspice-test@example.invalid",
                    "commit",
                    "-qm",
                    "fixture",
                ],
                check=True,
            )

            build_site.require_clean_client_checkout(checkout)
            tracked.write_text("dirty", encoding="utf-8")
            assert_gate_fails(
                self,
                build_site.require_clean_client_checkout,
                checkout,
            )

    def test_client_source_qualification_propagates_failure(self) -> None:
        with mock.patch.object(build_site, "run") as run:
            build_site.qualify_client_sources(ROOT)
            self.assertEqual(len(run.call_args_list), 2)
            self.assertEqual([Path(call.args[0][-1]).name for call in run.call_args_list],
                             ["test_ide_worker.py", "test_automation_runtime_assets.py"])
        with mock.patch.object(build_site, "run", side_effect=subprocess.CalledProcessError(1, ["python"])):
            with self.assertRaises(subprocess.CalledProcessError):
                build_site.qualify_client_sources(ROOT)

    def test_catalog_images_build_separately_with_worker_feature_isolation(self) -> None:
        with mock.patch.object(build_site, "run_cargo_build") as build:
            build_site.build_ui_images(ROOT)
        commands = [call.args[0] for call in build.call_args_list]
        self.assertEqual([cmd[cmd.index("--bin") + 1] for cmd in commands],
                         ["rspice-ui", "rspice-ui-worker"])
        for command in commands:
            self.assertIn("--locked", command)
            self.assertNotIn("--bins", command)
            self.assertEqual(command[command.index("--profile") + 1], "web-release")
            self.assertIn("generated-veriloga-catalog", command[command.index("--features") + 1].split(","))
        self.assertNotIn("browser-worker", commands[0][commands[0].index("--features") + 1].split(","))
        self.assertIn("browser-worker", commands[1][commands[1].index("--features") + 1].split(","))


if __name__ == "__main__":
    unittest.main()
