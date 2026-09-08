from __future__ import annotations

import tempfile
import unittest
import contextlib
import hashlib
import io
import json
from pathlib import Path
from unittest import mock

import build_simulator
import deploy
import test_build_simulator as assembly_fixtures
from deploy import clear_publish_tree, tree_digest


class DeploymentTests(unittest.TestCase):
    def make_release(self, root):
        assembly_fixtures.BuildSiteGateTests.make_ide_build_outputs(root / "ide")
        identity = build_simulator.package_ide_executable_assets(root / "ide")
        for name in ("index.html", "404.html", "_headers", "workbench/index.html", "play/index.html"):
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("fixture", encoding="utf-8")
        (root / "play/pkg").mkdir()
        (root / "play/pkg/rspice_wasm.js").write_text("export { initSync, __wbg_init as default };", encoding="utf-8")
        (root / "play/pkg/rspice_wasm_bg.wasm").write_bytes(b"\x00asm\x01\x00\x00\x00")
        build = {"client_source_sha": "a" * 40, "site_source_sha": "b" * 40,
                 "ide_executable_asset_sha256": identity,
                 "browser_images": [
                     {"name": name, "profile": build_simulator.UI_PROFILE, "target": "wasm32-unknown-unknown",
                      "features": list(features)} for name, features in build_simulator.UI_MODULES]}
        (root / "build.json").write_text(json.dumps(build), encoding="utf-8")
        # A synthetic receipt exercises validation, not browser execution.
        receipt = {"schema_version": 2, "status": "passed", "jit_qualification": {"status": "passed"}, "build": build,
                   "inputs": {path.relative_to(root).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
                              for folder in (root / "ide", root / "play")
                              for path in folder.rglob("*") if path.is_file()}}
        receipt["inputs"]["_headers"] = hashlib.sha256((root / "_headers").read_bytes()).hexdigest()
        (root / "browser-qualification.json").write_text(json.dumps(receipt), encoding="utf-8")
        return identity

    def test_manifest_accepts_a_complete_unchanged_qualified_cohort(self):
        with tempfile.TemporaryDirectory() as temporary, contextlib.redirect_stdout(io.StringIO()):
            root = Path(temporary)
            self.make_release(root)
            with mock.patch.object(deploy, "capture", return_value="rustc fixture"):
                count, size, digest = deploy.write_and_validate_manifest(root, "b" * 40, "a" * 40)
            manifest = json.loads((root / "release-manifest.json").read_text())
            self.assertEqual(manifest["artifact"]["tree_sha256"], digest)
            self.assertGreater(count, 10)
            self.assertGreater(size, 0)
            self.assertIn("browser-qualification.json", [entry["path"] for entry in manifest["artifact"]["files"]])

    def test_manifest_rejects_missing_or_changed_worker_and_python_files(self):
        for relative in ("rspice-ui-worker.js", "rspice-ui-worker_bg.wasm.gz", "automation-worker.js",
                         "python/rspice_browser_bootstrap.py"):
            with self.subTest(relative=relative), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                identity = self.make_release(root)
                (root / "ide/assets" / identity / relative).unlink()
                with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    with self.assertRaises((SystemExit, ValueError)):
                        deploy.write_and_validate_manifest(root, "b" * 40, "a" * 40)

    def test_qualification_rejects_skipped_failed_changed_and_wrong_feature_builds(self):
        for change in ("missing", "legacy", "unknown-schema", "failed", "jit-failed", "play-changed", "headers-changed", "build-changed", "features"):
            with self.subTest(change=change), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                self.make_release(root)
                path = root / "browser-qualification.json"
                receipt = json.loads(path.read_text())
                if change == "missing":
                    path.unlink()
                elif change == "legacy":
                    receipt.pop("schema_version")
                elif change == "unknown-schema":
                    receipt["schema_version"] = 3
                elif change == "failed":
                    receipt["status"] = "failed"
                elif change == "jit-failed":
                    receipt["jit_qualification"]["status"] = "failed"
                elif change == "play-changed":
                    (root / "play/index.html").write_text("changed", encoding="utf-8")
                elif change == "headers-changed":
                    (root / "_headers").write_text("changed", encoding="utf-8")
                else:
                    build_path = root / "build.json"
                    build = json.loads(build_path.read_text())
                    if change == "build-changed":
                        build["client_source_sha"] = "c" * 40
                    else:
                        build["browser_images"][0]["features"] = []
                        receipt["build"] = build
                    build_path.write_text(json.dumps(build), encoding="utf-8")
                if change != "missing":
                    path.write_text(json.dumps(receipt), encoding="utf-8")
                with self.assertRaises(ValueError):
                    build_simulator.verify_browser_qualification(root)

    def test_tree_digest_is_deterministic(self):
        files = [
            {"path": "a", "size": 1, "sha256": "1" * 64},
            {"path": "b", "size": 2, "sha256": "2" * 64},
        ]
        self.assertEqual(tree_digest(files), tree_digest(list(files)))
        self.assertEqual(len(tree_digest(files)), 64)

    def test_clear_publish_tree_preserves_git_metadata(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / ".git").mkdir()
            (root / ".git" / "config").write_text("keep", encoding="utf-8")
            (root / "old").mkdir()
            (root / "old" / "file").write_text("remove", encoding="utf-8")
            clear_publish_tree(root)
            self.assertTrue((root / ".git" / "config").is_file())
            self.assertFalse((root / "old").exists())


if __name__ == "__main__":
    unittest.main()
