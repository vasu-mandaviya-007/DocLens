"""Folder structure print karta hai (sirf naam, file ka content kabhi nahi padhta).

Chalane ka tarika (backend folder ke andar se):
    python show_tree.py            # current folder
    python show_tree.py path/to/dir

Output console me aata hai aur tree.txt me bhi save hota hai.
"""

import sys
from pathlib import Path

IGNORE = {
    ".git", "__pycache__", "venv", ".venv", "env", "node_modules",
    ".pytest_cache", ".mypy_cache", ".idea", ".vscode", "dist", "build", ".DS_Store",
}
MAX_ENTRIES = 40  # ek folder me isse zyada ho (uploads, chroma data) to baaki "+N more" me collapse


def _visible(path: Path) -> list[Path]:
    items = [p for p in path.iterdir() if p.name not in IGNORE and p.suffix != ".pyc"]
    return sorted(items, key=lambda p: (p.is_file(), p.name.lower()))  # folders pehle


def build_tree(path: Path, prefix: str = "") -> list[str]:
    items = _visible(path)
    shown, hidden = items[:MAX_ENTRIES], len(items) - MAX_ENTRIES
    lines = []
    for i, item in enumerate(shown):
        last = i == len(shown) - 1 and hidden <= 0
        lines.append(f"{prefix}{'└── ' if last else '├── '}{item.name}{'/' if item.is_dir() else ''}")
        if item.is_dir():
            lines += build_tree(item, prefix + ("    " if last else "│   "))
    if hidden > 0:
        lines.append(f"{prefix}└── ... (+{hidden} more)")
    return lines


if __name__ == "__main__":
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    output = "\n".join([f"{root.name}/", *build_tree(root)])
    print(output)
    Path("tree.txt").write_text(output, encoding="utf-8")