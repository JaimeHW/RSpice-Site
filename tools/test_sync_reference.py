import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "sync_reference.py"
SPEC = importlib.util.spec_from_file_location("sync_reference", SCRIPT)
sync_reference = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync_reference)


class SyncReferenceTests(unittest.TestCase):
    def test_snapshot_and_revision_pin_come_from_the_same_catalog(self) -> None:
        revision = "a" * 40
        catalog = {"source": {"revision": revision, "short_revision": revision[:12]}}
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output = root / "public"
            pin = root / "RSPICE_SOURCE_REVISION"
            with mock.patch.object(
                sync_reference,
                "generate_reference_bundle",
                return_value=catalog,
            ) as generate:
                result = sync_reference.sync_reference(root / "RSpice", output, pin)

            self.assertIs(result, catalog)
            generate.assert_called_once_with(output, root / "RSpice")
            self.assertEqual(pin.read_text(encoding="utf-8"), revision + "\n")

    def test_invalid_catalog_revision_does_not_replace_the_pin(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            pin = root / "RSPICE_SOURCE_REVISION"
            pin.write_text("b" * 40 + "\n", encoding="utf-8")
            catalog = {"source": {"revision": "main", "short_revision": "main"}}
            with mock.patch.object(
                sync_reference,
                "generate_reference_bundle",
                return_value=catalog,
            ):
                with self.assertRaisesRegex(ValueError, "full lowercase source revision"):
                    sync_reference.sync_reference(root / "RSpice", root / "public", pin)

            self.assertEqual(pin.read_text(encoding="utf-8"), "b" * 40 + "\n")


if __name__ == "__main__":
    unittest.main()
