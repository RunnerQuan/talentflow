#!/usr/bin/env python3
"""
PDF → PNG converter using PyMuPDF (fitz).
Used as a subprocess by the Next.js resume parsing API when pdfjs-dist fails
to render CJK characters due to custom font encodings.

Usage:
    python pdf-to-png.py <pdf_path> <output_dir> [--max-pages N] [--dpi N]

Output (JSON to stdout):
    {
        "totalPages": 2,
        "pages": [
            {"pageNumber": 1, "width": 1700, "height": 2200, "path": "/tmp/xxx/page-1.png"},
            ...
        ]
    }
"""

import sys
import os
import json
import argparse


def convert_pdf_to_png(pdf_path: str, output_dir: str, max_pages: int = 3, dpi: int = 200) -> dict:
    """Convert PDF pages to PNG images using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        return {"error": "PyMuPDF not installed. Run: pip install PyMuPDF"}

    if not os.path.exists(pdf_path):
        return {"error": f"PDF file not found: {pdf_path}"}

    os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    total_pages = doc.page_count
    pages_to_convert = min(total_pages, max_pages)

    result = {
        "totalPages": total_pages,
        "pages": [],
    }

    for i in range(pages_to_convert):
        page = doc[i]
        pix = page.get_pixmap(dpi=dpi)
        out_path = os.path.join(output_dir, f"page-{i + 1}.png")
        pix.save(out_path)

        result["pages"].append({
            "pageNumber": i + 1,
            "width": pix.width,
            "height": pix.height,
            "path": out_path,
        })

    doc.close()
    return result


def main():
    parser = argparse.ArgumentParser(description="Convert PDF pages to PNG using PyMuPDF")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("output_dir", help="Directory to save PNG files")
    parser.add_argument("--max-pages", type=int, default=3, help="Maximum pages to convert (default: 3)")
    parser.add_argument("--dpi", type=int, default=200, help="Render DPI (default: 200)")

    args = parser.parse_args()
    result = convert_pdf_to_png(args.pdf_path, args.output_dir, args.max_pages, args.dpi)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
