#!/usr/bin/env python3
"""
Resume PDF Vision Extractor
============================
Uses PyMuPDF to render PDF pages to PNG, then sends them to an AI vision model
for OCR text extraction. Solves the custom font encoding issue where text
extraction libraries (pdfplumber, pypdf) lose numeric characters.

Usage:
  python extract_resume.py <pdf_path> --api-key <key> --base-url <url> --model <model>

Example (OpenAI):
  python extract_resume.py resume.pdf --api-key sk-xxx --base-url https://api.openai.com/v1 --model gpt-4o

Example (compatible API):
  python extract_resume.py resume.pdf --api-key sk-xxx --base-url https://api.siliconflow.cn/v1 --model Qwen/Qwen2.5-VL-72B-Instruct
"""

import argparse
import base64
import io
import json
import sys
from pathlib import Path

import fitz  # PyMuPDF
import requests


def pdf_to_png_pages(pdf_path: str, dpi: int = 200, max_pages: int = 5) -> list[bytes]:
    """Render PDF pages to PNG bytes using PyMuPDF."""
    doc = fitz.open(pdf_path)
    pages = []

    zoom = dpi / 72  # 72 is default DPI
    mat = fitz.Matrix(zoom, zoom)

    for i, page in enumerate(doc):
        if i >= max_pages:
            break
        pix = page.get_pixmap(matrix=mat, alpha=False)
        png_bytes = pix.tobytes("png")
        pages.append(png_bytes)
        print(f"  Page {i+1}: {pix.width}x{pix.height} ({len(png_bytes)//1024}KB)")

    doc.close()
    return pages


def extract_with_vision(
    pages: list[bytes],
    api_key: str,
    base_url: str,
    model: str,
    prompt: str | None = None,
) -> str:
    """Send PNG images to a vision model and get extracted text."""

    if prompt is None:
        prompt = """你是一个专业的简历文字提取助手。请仔细查看这张简历图片，完整提取其中的所有文字内容。

要求：
1. 保持原文的段落结构和格式
2. 所有数字、日期、电话号码、邮箱等必须完整准确提取
3. 不要遗漏任何信息
4. 不要添加原文中没有的内容
5. 用纯文本输出，保持清晰的段落分隔"""

    # Build content array with all pages
    content = [{"type": "text", "text": prompt}]
    for i, page_bytes in enumerate(pages):
        b64 = base64.b64encode(page_bytes).decode("utf-8")
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{b64}",
                "detail": "high",
            },
        })

    # Ensure base_url ends with /chat/completions
    url = base_url.rstrip("/")
    if not url.endswith("/chat/completions"):
        url += "/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": content}],
        "max_tokens": 4096,
        "temperature": 0.1,
    }

    print(f"\nCalling vision API: {model} @ {base_url}")
    print(f"Sending {len(pages)} page(s)...")

    resp = requests.post(url, headers=headers, json=payload, timeout=120)
    resp.raise_for_status()

    data = resp.json()
    text = data["choices"][0]["message"]["content"]
    return text


def main():
    parser = argparse.ArgumentParser(description="Extract resume text from PDF using AI vision model")
    parser.add_argument("pdf_path", help="Path to the resume PDF file")
    parser.add_argument("--api-key", required=True, help="API key for the vision model")
    parser.add_argument("--base-url", required=True, help="API base URL (OpenAI-compatible)")
    parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o)")
    parser.add_argument("--dpi", type=int, default=200, help="Render DPI (default: 200)")
    parser.add_argument("--max-pages", type=int, default=5, help="Max pages to process (default: 5)")
    parser.add_argument("--output", "-o", help="Output file path (default: stdout)")
    parser.add_argument("--save-images", action="store_true", help="Save rendered PNG images alongside the PDF")

    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)
    if not pdf_path.exists():
        print(f"Error: File not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    # Step 1: Render PDF to PNG
    print(f"Rendering PDF: {pdf_path} (DPI: {args.dpi})")
    pages = pdf_to_png_pages(str(pdf_path), dpi=args.dpi, max_pages=args.max_pages)
    print(f"Rendered {len(pages)} page(s)")

    # Optionally save images
    if args.save_images:
        for i, png_bytes in enumerate(pages):
            img_path = pdf_path.with_suffix(f".page{i+1}.png")
            img_path.write_bytes(png_bytes)
            print(f"  Saved: {img_path}")

    # Step 2: Call vision API
    extracted = extract_with_vision(
        pages=pages,
        api_key=args.api_key,
        base_url=args.base_url,
        model=args.model,
    )

    # Step 3: Output
    if args.output:
        out_path = Path(args.output)
        out_path.write_text(extracted, encoding="utf-8")
        print(f"\nSaved extracted text to: {out_path}")
    else:
        print("\n" + "=" * 60)
        print("EXTRACTED TEXT:")
        print("=" * 60)
        print(extracted)
        print("=" * 60)

    # Also save as JSON with metadata
    json_path = pdf_path.with_suffix(".extracted.json")
    json_path.write_text(json.dumps({
        "source": str(pdf_path),
        "pages": len(pages),
        "dpi": args.dpi,
        "model": args.model,
        "text": extracted,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"JSON output: {json_path}")


if __name__ == "__main__":
    main()
