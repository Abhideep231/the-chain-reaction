"""Literal chain designations, normalized without conflating sizes or variants."""

import re

_DASHES = r"\-‐‑‒–—−"
_CODE = re.compile(rf"\b(\d{{2,3}})\s*([AB])\s*[{_DASHES}]\s*([123])\b", re.I)


def designation_patterns(query: str) -> list[str]:
    # An explicit code in the current question overrides older conversation codes.
    current = query.splitlines()[-1] if query.splitlines() else query
    matches = list(_CODE.finditer(current)) or list(_CODE.finditer(query))
    patterns = [
        rf"(?i)\b{match[1]}\s*{match[2].upper()}\s*[{_DASHES}]\s*{match[3]}\b"
        for match in matches
    ]
    return list(dict.fromkeys(patterns))[:8]
