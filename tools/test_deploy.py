from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from deploy import clear_publish_tree, tree_digest


class DeploymentTests(unittest.TestCase):
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
