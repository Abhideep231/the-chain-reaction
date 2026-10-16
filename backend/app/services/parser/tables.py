"""Extract table rows without guessing missing column labels or engineering units."""

import re
from typing import Any

import fitz


def _clean(text: str | None) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _is_data(row: list[str | None]) -> bool:
    return sum(bool(value and re.match(r"[+−-]?\d", value.strip())) for value in row) >= 2


def _headers(page: fitz.Page, table: Any, body: int, columns: list[int]) -> list[str] | None:
    rows = table.extract()
    cells = [
        next((row.cells[column] for row in table.rows[body:] if row.cells[column]), None)
        for column in columns
    ]
    labels: list[list[str]] = [[] for _ in cells]
    # Slanted labels are frequently reported as one merged cell by find_tables.
    # Anchor each complete text line at its baseline origin, not its bounding
    # box centre (which drifts into neighbouring columns as text rotates).
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            if line["dir"][1] >= -0.1:
                continue
            if line["bbox"][1] < table.bbox[1] - 5:
                continue
            if line["bbox"][3] > table.rows[body].bbox[1]:
                continue
            x = line["spans"][0]["origin"][0]
            for index, cell in enumerate(cells):
                if cell and cell[0] <= x < cell[2]:
                    labels[index].append(_clean("".join(s["text"] for s in line["spans"])))
                    break
    headers = [" ".join(parts) for parts in labels]
    if sum(bool(label) for label in headers) < len(cells) * 0.8:
        # Ordinary horizontal headers: only accept an aligned, mostly filled
        # row, never a single merged heading stretched over the entire table.
        candidates = [
            [row[column] for column in columns]
            for row in rows[:body]
            if sum(bool(row[column]) for column in columns) >= len(cells) * 0.8
        ]
        if not candidates:
            return None
        headers = [_clean(value) for value in candidates[-1]]
    return [label or f"Unlabelled column {index + 1}" for index, label in enumerate(headers)]


def extract_table_rows(page: fitz.Page) -> tuple[list[str], str | None]:
    """Return self-contained rows and narrative with accepted tables removed.

    Unrecognised tables stay in the original text. No OCR or inferred column
    names are used. Original page text remains available in the parse response.
    """
    tables: list[tuple[Any, list[str], int, list[int]]] = []
    for table in page.find_tables().tables:
        rows = table.extract()
        if table.col_count < 2 or sum(_is_data(row) for row in rows) < 2:
            continue  # Reject diagram grids and mostly empty detections.
        body = next((i for i, row in enumerate(rows) if _is_data(row)), None)
        if body is None:
            continue
        data_rows = [row for row in rows[body:] if _is_data(row)]
        # Discard empty ghost columns introduced by merged cell geometry.
        columns = [i for i in range(table.col_count) if any(row[i] for row in data_rows)]
        headers = _headers(page, table, body, columns)
        if headers:
            tables.append((table, headers, body, columns))
    if not tables:
        return [], None

    narrative_lines: list[str] = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            box = fitz.Rect(line["bbox"])
            centre = (box.tl + box.br) / 2
            if not any(fitz.Rect(table.bbox).contains(centre) for table, _, _, _ in tables):
                narrative_lines.append(_clean("".join(span["text"] for span in line["spans"])))
    narrative = "\n".join(narrative_lines)
    # Preserve page-level titles, variant names and footnotes on every row;
    # discard diagram letters, page numbers and repeated contact information.
    context = " | ".join(
        line
        for line in narrative_lines
        if len(line) > 5 and "@" not in line and not line.startswith("+49")
    )[:1600]
    result: list[str] = []
    for number, (table, headers, body, columns) in enumerate(tables, start=1):
        group = ""
        for row in table.extract()[max(0, body - 1) :]:
            values = [_clean(row[column]) for column in columns]
            filled = [value for value in values if value]
            if len(filled) == 1:
                group = filled[0]
                continue
            if not _is_data(row):
                continue
            fields = "\n".join(
                f"{header}: {value}" for header, value in zip(headers, values, strict=True) if value
            )
            result.append(
                f"Structured table row; PDF page {page.number + 1}; table {number}\n"
                f"Page context: {context}\nTable section: {group or 'not specified'}\n{fields}"
            )
    return result, narrative
