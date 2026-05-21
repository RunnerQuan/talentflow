#!/usr/bin/env npx tsx
/**
 * Test script to analyze PDF font encoding issues.
 * Usage: npx tsx scripts/test-pdf-encoding.ts <pdf-path>
 */

import { readFileSync } from 'fs';
import { PDFParse } from 'pdf-parse';

async function main() {
  const pdfPath = process.argv[2] || 'C:/Software/Common/Tencent/WeChat/xwechat_files/wxid_7ynf8icnvn6c22_9926/msg/file/2026-05/陶亦奇简历.pdf';
  
  console.log(`\n📄 Testing PDF: ${pdfPath}\n`);
  
  const buffer = readFileSync(pdfPath);
  const uint8Array = new Uint8Array(buffer);
  const parser = new PDFParse({ data: uint8Array });
  
  try {
    // 1. Extract text
    const textResult = await parser.getText();
    const text = textResult.text || '';
    
    console.log('=== Text Extraction Results ===');
    console.log(`Total chars: ${text.length}`);
    console.log(`Total pages: ${(textResult as unknown as Record<string, unknown>).numpages ?? 'unknown'}`);
    console.log('');
    
    // 2. Analyze character composition
    const cjkChars = text.match(/[\u4e00-\u9fff]/g) || [];
    const digits = text.match(/\d/g) || [];
    const ascii = text.match(/[a-zA-Z]/g) || [];
    const whitespace = text.match(/\s/g) || [];
    const other = text.length - cjkChars.length - digits.length - ascii.length - whitespace.length;
    
    console.log('=== Character Composition ===');
    console.log(`CJK characters: ${cjkChars.length} (${(cjkChars.length / text.length * 100).toFixed(2)}%)`);
    console.log(`Digits: ${digits.length} (${(digits.length / text.length * 100).toFixed(2)}%)`);
    console.log(`ASCII letters: ${ascii.length} (${(ascii.length / text.length * 100).toFixed(2)}%)`);
    console.log(`Whitespace: ${whitespace.length} (${(whitespace.length / text.length * 100).toFixed(2)}%)`);
    console.log(`Other: ${other}`);
    console.log('');
    
    // 3. Show first 2000 chars of extracted text
    console.log('=== Extracted Text (first 2000 chars) ===');
    console.log(text.substring(0, 2000));
    console.log('');
    
    // 4. Show lines with CJK characters
    console.log('=== Lines containing CJK characters ===');
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/[\u4e00-\u9fff]/.test(lines[i])) {
        console.log(`Line ${i + 1}: ${lines[i].substring(0, 100)}`);
      }
    }
    console.log('');
    
    // 5. Check for encoding patterns
    console.log('=== Font Encoding Analysis ===');
    
    // Check for date gap patterns
    const dateGapPattern = /\s{2,}[-~–—]\s{2,}[-~–—]\s{2,}/g;
    const dateGapMatches = text.match(dateGapPattern) || [];
    console.log(`Date gap patterns: ${dateGapMatches.length}`);
    
    // Check for CJK with gaps
    const cjkGapPattern = /[\u4e00-\u9fff]\s{2,}[\u4e00-\u9fff]/g;
    const cjkGapMatches = text.match(cjkGapPattern) || [];
    console.log(`CJK-gap-CJK patterns: ${cjkGapMatches.length}`);
    
    // Check text density
    const whitespaceRatio = whitespace.length / text.length;
    console.log(`Whitespace ratio: ${(whitespaceRatio * 100).toFixed(2)}%`);
    
    // Check for short lines
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    const shortLines = nonEmptyLines.filter(l => {
      const contentChars = l.replace(/\s/g, '').length;
      return contentChars > 0 && contentChars <= 3;
    });
    console.log(`Lines with <= 3 content chars: ${shortLines.length}/${nonEmptyLines.length} (${(shortLines.length / nonEmptyLines.length * 100).toFixed(1)}%)`);
    
    // 6. Try to get screenshot to compare
    console.log('\n=== PDF to PNG Conversion Test ===');
    try {
      const screenshotResult = await parser.getScreenshot({ first: 1, scale: 2 });
      console.log(`Pages available: ${screenshotResult.total}`);
      if (screenshotResult.pages && screenshotResult.pages.length > 0) {
        const page = screenshotResult.pages[0];
        console.log(`Page 1: ${page.width}x${page.height}, ${Math.round(page.data.length / 1024)}KB`);
        
        // Save the first page as PNG for inspection
        const { writeFileSync } = await import('fs');
        const outputPath = `C:/Files/Study/Codes/Contest/XiaoPeng-AI-Contest/talentflow/scripts/test-page1.png`;
        writeFileSync(outputPath, Buffer.from(page.data));
        console.log(`Saved page 1 to: ${outputPath}`);
      }
    } catch (screenshotError) {
      console.error('Screenshot conversion failed:', screenshotError);
    }
    
    // 7. Run hasFontEncodingIssue logic
    console.log('\n=== hasFontEncodingIssue Analysis ===');
    const fileName = '陶亦奇简历.pdf';
    const isCJK = /[\u4e00-\u9fff]/.test(fileName) || /[\u4e00-\u9fff]/.test(text.substring(0, 200));
    
    const digitCount = (text.match(/\d/g) || []).length;
    const digitRatio = digitCount / text.length;
    const hasTooFewDigits = digitCount < 5 || digitRatio < 0.005;
    
    const hasDateGaps = dateGapMatches.length > 0;
    
    const hasCjkFileName = /[\u4e00-\u9fff]/.test(fileName);
    const cjkCount = cjkChars.length;
    const hasCjkMismatch = hasCjkFileName && cjkCount < 10;
    
    const cjkGapCount = cjkGapMatches.length;
    const cjkSingleGapPattern = /[\u4e00-\u9fff] {1,3}[\u4e00-\u9fff]/g;
    const cjkSingleGapMatches = text.match(cjkSingleGapPattern) || [];
    const totalCjkGapCount = cjkGapCount + cjkSingleGapMatches.length;
    const cjkGapRatio = cjkCount > 0 ? totalCjkGapCount / cjkCount : 0;
    const hasCjkTextGaps = isCJK && cjkCount > 50 && cjkGapRatio > 0.08;
    
    const hasDensityAnomaly = isCJK && cjkCount > 30 && whitespaceRatio > 0.20;
    
    const shortLineRatio = shortLines.length / nonEmptyLines.length;
    const hasShortLineAnomaly = isCJK && nonEmptyLines.length >= 5 && shortLineRatio > 0.15 && (shortLineRatio > 0.25 || cjkGapRatio > 0.05);
    
    console.log(`Strategy 1 (too few digits): ${hasTooFewDigits} (count: ${digitCount}, ratio: ${(digitRatio * 100).toFixed(2)}%)`);
    console.log(`Strategy 2 (date gaps): ${hasDateGaps}`);
    console.log(`Strategy 3 (CJK mismatch): ${hasCjkMismatch} (filename has CJK: ${hasCjkFileName}, text CJK count: ${cjkCount})`);
    console.log(`Strategy 4 (CJK text gaps): ${hasCjkTextGaps} (gap count: ${totalCjkGapCount}, ratio: ${(cjkGapRatio * 100).toFixed(1)}%)`);
    console.log(`Strategy 5 (density anomaly): ${hasDensityAnomaly} (whitespace ratio: ${(whitespaceRatio * 100).toFixed(1)}%)`);
    console.log(`Strategy 6 (short line anomaly): ${hasShortLineAnomaly} (short line ratio: ${(shortLineRatio * 100).toFixed(1)}%)`);
    
    const overallResult = hasTooFewDigits || hasDateGaps || hasCjkMismatch || hasCjkTextGaps || hasDensityAnomaly || hasShortLineAnomaly;
    console.log(`\nOverall hasFontEncodingIssue: ${overallResult}`);
    if (overallResult) {
      console.log('→ Should fall back to vision model path');
    } else {
      console.log('→ Would use text extraction path (may lose Chinese content)');
    }
    
  } finally {
    await parser.destroy();
  }
}

main().catch(console.error);
