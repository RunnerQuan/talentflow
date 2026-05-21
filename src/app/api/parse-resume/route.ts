// ============================================================
// TalentFlow — Resume Parse API Route (AI-Driven)
// ============================================================
// Architecture:
//   Text files (PDF/DOCX/TXT) → extractText → AI (generateText) → structured JSON
//   Images / Scanned PDFs      → PDF→PNG → vision model (base64) → structured JSON
// No regex fallback — all extraction is AI-driven.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { ModelSettings, CandidateProfile } from '@/types';

// ---- PDF Worker Setup ----
// pdfjs-dist tries to dynamically import its worker module, which fails in Next.js
// because the bundler mangles the import path. We pre-import the worker module to set
// globalThis.pdfjsWorker.WorkerMessageHandler, so pdfjs-dist skips the broken dynamic import.

let pdfWorkerReady = false;

async function ensurePdfWorker(): Promise<void> {
  if (pdfWorkerReady) return;
  try {
    // Import the worker module — it sets globalThis.pdfjsWorker = { WorkerMessageHandler }
    // This must happen BEFORE pdfjs-dist's PDFWorker class tries to load it dynamically.
    await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
    pdfWorkerReady = true;
    console.log('[pdf-worker] pdfjs-dist worker pre-loaded successfully');
  } catch (err) {
    console.warn('[pdf-worker] pdfjs-dist worker pre-load failed, pdf-parse will use its own worker:', err);
    // Continue anyway — pdf-parse has its own bundled worker that may work
  }
}

// ---- Supported file types ----

// NOTE: TEXT_TYPES removed — only IMAGE_TYPES is used for the vision pipeline.
// PDF text extraction uses pdf-parse directly, not this map.

/** Files that should be parsed via vision model */
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
};

/**
 * Detect font encoding issues in extracted PDF text.
 *
 * Some PDFs use custom font encodings (e.g., /Differences arrays mapping to
 * non-standard glyph names like /g0, /g3AD6) that cause text extraction
 * libraries to lose specific characters — digits, CJK characters, etc.
 *
 * Detection strategies (any one triggers fallback to vision):
 * 1. Missing digits: A resume with text but almost no digits has encoding issues
 * 2. Date gaps: Suspicious whitespace patterns where dates should be
 * 3. CJK mismatch: Chinese filename but no Chinese characters in extracted text
 * 4. CJK text gaps: CJK characters with abnormal gaps (missing chars between them)
 * 5. Text density anomaly: Excessive whitespace relative to content in CJK-heavy text
 */
function hasFontEncodingIssue(text: string, fileName: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true; // empty text = definitely broken

  const isCJK = /[\u4e00-\u9fff]/.test(fileName) || /[\u4e00-\u9fff]/.test(trimmed.substring(0, 200));

  // Strategy 1: Check for missing digits
  const digitCount = (trimmed.match(/\d/g) || []).length;
  const digitRatio = digitCount / trimmed.length;
  const hasTooFewDigits = digitCount < 5 || digitRatio < 0.005;

  // Strategy 2: Check for date gap patterns (spaces/dashes where numbers should be)
  const hasDateGaps = /\s{2,}[-~–—]\s{2,}[-~–—]\s{2,}/.test(trimmed);

  // Strategy 3: Chinese filename but no Chinese characters in text
  const hasCjkFileName = /[\u4e00-\u9fff]/.test(fileName);
  const cjkCount = (trimmed.match(/[\u4e00-\u9fff]/g) || []).length;
  const hasCjkMismatch = hasCjkFileName && cjkCount < 10;

  // Strategy 4: Detect abnormal gaps within CJK text
  // When font encoding breaks, extracted text often has spaces/whitespace between
  // what should be adjacent CJK characters. A healthy Chinese resume has very few
  // "CJK-space-CJK" patterns; a broken one has many.
  // Pattern: CJK char followed by 2+ spaces followed by CJK char
  const cjkGapPattern = /[\u4e00-\u9fff]\s{2,}[\u4e00-\u9fff]/g;
  const cjkGapMatches = trimmed.match(cjkGapPattern) || [];
  // Also count single-space gaps between CJK chars that look like mid-sentence breaks
  // (i.e., not at line boundaries — lines typically end with \n)
  const cjkSingleGapPattern = /[\u4e00-\u9fff] {1,3}[\u4e00-\u9fff]/g;
  const cjkSingleGapMatches = trimmed.match(cjkSingleGapPattern) || [];
  const cjkGapCount = cjkGapMatches.length + cjkSingleGapMatches.length;
  // Calculate the ratio of gapped CJK pairs to total CJK chars
  const cjkGapRatio = cjkCount > 0 ? cjkGapCount / cjkCount : 0;
  // In a normal Chinese resume, the ratio of "CJK-space-CJK" to total CJK should be very low
  // (spaces mainly at line breaks, not mid-text). Broken encoding inflates this significantly.
  const hasCjkTextGaps = isCJK && cjkCount > 50 && cjkGapRatio > 0.08;

  // Strategy 5: Text density anomaly — excessive whitespace in CJK context
  // Chinese text should be dense. If > 20% of characters are whitespace but the text
  // contains CJK chars, the font encoding is likely dropping characters.
  const whitespaceCount = (trimmed.match(/\s/g) || []).length;
  const whitespaceRatio = whitespaceCount / trimmed.length;
  const hasDensityAnomaly = isCJK && cjkCount > 30 && whitespaceRatio > 0.20;

  // Strategy 6: Abnormal line structure — many lines with very few visible chars
  // Chinese resumes have substantive lines. If a significant portion of lines are
  // suspiciously short (< 3 chars of actual content), characters may be missing.
  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
  if (lines.length >= 5 && isCJK) {
    const shortLines = lines.filter(l => {
      const contentChars = l.replace(/\s/g, '').length;
      return contentChars > 0 && contentChars <= 3;
    });
    const shortLineRatio = shortLines.length / lines.length;
    if (shortLineRatio > 0.15) {
      console.log(`[parse-resume] Abnormal short lines: ${shortLines.length}/${lines.length} (${(shortLineRatio * 100).toFixed(1)}%)`);
      // This is a strong signal — combine with another indicator
      if (shortLineRatio > 0.25 || cjkGapRatio > 0.05) {
        console.log(`[parse-resume] Font encoding issue detected via short line anomaly + gap`);
        return true;
      }
    }
  }

  if (hasTooFewDigits || hasDateGaps || hasCjkMismatch || hasCjkTextGaps || hasDensityAnomaly) {
    console.log(`[parse-resume] Font encoding issue detected:`);
    console.log(`  - digits: ${digitCount} in ${trimmed.length} chars (ratio: ${(digitRatio * 100).toFixed(2)}%)`);
    console.log(`  - dateGaps: ${hasDateGaps}`);
    console.log(`  - cjkMismatch: filename has CJK=${hasCjkFileName}, text has ${cjkCount} CJK chars`);
    console.log(`  - cjkTextGaps: ${cjkGapCount} gap patterns in ${cjkCount} CJK chars (ratio: ${(cjkGapRatio * 100).toFixed(1)}%)`);
    console.log(`  - densityAnomaly: whitespace ratio ${(whitespaceRatio * 100).toFixed(1)}%`);
    return true;
  }

  return false;
}

// ---- Zod schema for candidate data ----
// Defined once, reused across AI calls

function getCandidateSchema(z: typeof import('zod').z) {
  return z.object({
    name: z.string().describe('候选人真实姓名'),
    email: z.string().describe('电子邮箱'),
    phone: z.string().describe('电话号码'),
    summary: z.string().describe('个人简介/自我评价'),
    education: z.array(z.object({
      school: z.string().describe('学校名称'),
      degree: z.string().describe('学位'),
      major: z.string().describe('专业'),
      startDate: z.string().describe('开始日期'),
      endDate: z.string().describe('结束日期'),
      gpa: z.string().optional().describe('GPA/绩点'),
    })).describe('教育经历'),
    workExperience: z.array(z.object({
      company: z.string().describe('公司名称'),
      title: z.string().describe('职位'),
      startDate: z.string().describe('开始日期'),
      endDate: z.string().describe('结束日期'),
      description: z.string().describe('工作描述'),
    })).describe('工作经历'),
    projects: z.array(z.object({
      name: z.string().describe('项目名称'),
      role: z.string().describe('担任角色'),
      startDate: z.string().describe('开始日期'),
      endDate: z.string().describe('结束日期'),
      description: z.string().describe('项目描述'),
      technologies: z.array(z.string()).describe('使用技术'),
    })).describe('项目经历'),
    skills: z.array(z.object({
      name: z.string().describe('技能名称'),
      level: z.number().min(1).max(5).describe('熟练度 1-5'),
      category: z.string().describe('技能类别'),
    })).describe('技能列表'),
    yearsOfExperience: z.number().describe('工作年限'),
    currentTitle: z.string().describe('当前职位'),
    currentCompany: z.string().describe('当前公司'),
  });
}

// ---- Shared AI prompt for resume parsing ----

function getResumePrompt(text: string): string {
  return `你是一个专业的简历解析助手。请从以下简历内容中提取所有候选人的结构化信息。

【提取规则】
1. 姓名识别（最重要）：
   - 中文姓名通常是 2-4 个汉字，出现在简历最顶部/最显眼的位置
   - 常见模式：单独一行只有姓名、"姓名：XXX"、或顶部大字标题
   - 排除学校名（如兰州大学）、标签（如985/211）、职称等干扰项
   - 如果文本中出现断裂/乱码，请根据上下文尽量还原完整姓名
2. currentTitle / currentCompany 从最近的工作经历或科研经历中提取
3. 如果简历没有明确的技能列表，从工作经历和项目经历的技术栈中推断技能
4. 所有字段都必须填写，不能返回空字符串（没有就填""）
5. yearsOfExperience 从工作经历的时间跨度推算；应届生填 0
6. 技能熟练度：1=了解 2=会用 3=熟练 4=精通 5=专家
7. 技能类别参考：编程语言、前端、后端、数据库、DevOps、AI/ML、移动端、数据、设计、其他
8. 如果文本有乱码/缺字/空白断裂，尽量根据上下文补全信息，不要跳过任何字段

简历内容：
---
${text.substring(0, 15000)}
---

请输出完整的 JSON，包含所有字段。`;
}

// ---- POST Handler ----

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const modelName = formData.get('modelName') as string | null;
    const apiKey = formData.get('apiKey') as string | null;
    const baseURL = formData.get('baseURL') as string | null;

    // Vision model settings (optional — falls back to main model if not provided)
    const visionModelName = formData.get('visionModelName') as string | null;
    const visionApiKey = formData.get('visionApiKey') as string | null;
    const visionBaseURL = formData.get('visionBaseURL') as string | null;
    const visionEnabled = formData.get('visionEnabled') === 'true';

    if (!file) {
      return NextResponse.json({ error: '请上传文件' }, { status: 400 });
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: `文件大小超过限制（${(file.size / 1024 / 1024).toFixed(1)}MB > 10MB）` },
        { status: 400 },
      );
    }

    if (!modelName || !apiKey || !baseURL) {
      return NextResponse.json(
        { error: '请先配置 AI 模型、API Key 和 Base URL' },
        { status: 400 },
      );
    }

    const modelSettings: ModelSettings = { modelName, apiKey, baseURL };

    // Build effective vision settings: use dedicated vision config if enabled, otherwise fall back to main model
    const effectiveVisionSettings: ModelSettings = (visionEnabled && visionModelName && visionApiKey && visionBaseURL)
      ? { modelName: visionModelName, apiKey: visionApiKey, baseURL: visionBaseURL }
      : modelSettings;

    if (visionEnabled && visionModelName) {
      console.log(`[parse-resume] Using dedicated vision model: ${visionModelName}`);
    } else {
      console.log(`[parse-resume] No separate vision model configured, using main model for vision tasks`);
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || guessMime(fileName);

    console.log(`[parse-resume] Processing: ${file.name} (${mimeType}, ${Math.round(buffer.length / 1024)}KB)`);

    let parsedData: Record<string, unknown>;
    let rawText = '';

    // ---- Route to appropriate parsing strategy ----

    if (IMAGE_TYPES[mimeType]) {
      // === IMAGE PATH: Vision model reads the image directly ===
      console.log('[parse-resume] Using vision model for image file');
      rawText = `[图片文件: ${file.name}]`;
      parsedData = await parseResumeFromImage(effectiveVisionSettings, buffer, mimeType);

    } else if (mimeType === 'application/pdf') {
      // === PDF PATH: Try text extraction first; if encoding broken, fall back to vision ===
      rawText = await extractTextFromPDF(buffer, fileName);

      const encodingBroken = hasFontEncodingIssue(rawText, file.name);

      if (!encodingBroken) {
        console.log(`[parse-resume] Text-based PDF: ${rawText.length} chars extracted`);
        parsedData = await parseResumeFromText(modelSettings, rawText);
      } else {
        console.log(`[parse-resume] Font encoding issue detected, falling back to vision model`);
        rawText = `[扫描件PDF: ${file.name}]`;

        // Convert PDF pages to PNG images (vision API only accepts image MIME types)
        const { pages, totalPages } = await convertPdfPagesToImages(buffer);

        if (pages.length === 0) {
          return NextResponse.json(
            { error: '无法将 PDF 转换为图片，请尝试上传图片格式的简历' },
            { status: 400 },
          );
        }

        // Send ALL pages to vision model for maximum information extraction
        console.log(`[parse-resume] Sending ${pages.length}/${totalPages} PNG pages to vision model`);
        parsedData = await parseResumeFromImages(effectiveVisionSettings, pages);
      }

    } else {
      // === TEXT PATH: Extract text, then send to AI ===
      rawText = await extractTextFromBuffer(buffer, fileName, mimeType);

      if (!rawText || rawText.trim().length === 0) {
        return NextResponse.json(
          { error: '无法从文件中提取文本内容' },
          { status: 400 },
        );
      }

      console.log(`[parse-resume] Text file: ${rawText.length} chars extracted`);
      parsedData = await parseResumeFromText(modelSettings, rawText);
    }

    // ---- Post-processing: ensure critical fields from work experience ----
    parsedData = postProcess(parsedData, rawText);

    console.log('[parse-resume] Final result:', {
      name: parsedData.name,
      currentTitle: parsedData.currentTitle,
      currentCompany: parsedData.currentCompany,
      yearsOfExperience: parsedData.yearsOfExperience,
      skillsCount: Array.isArray(parsedData.skills) ? (parsedData.skills as unknown[]).length : 0,
      workExpCount: Array.isArray(parsedData.workExperience) ? (parsedData.workExperience as unknown[]).length : 0,
    });

    const candidate: CandidateProfile = {
      ...parsedData,
      rawText,
    } as CandidateProfile;

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('[parse-resume] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? `解析失败: ${error.message}`
          : '简历解析过程中发生未知错误',
      },
      { status: 500 },
    );
  }
}

// ============================================================
// Text-based parsing (PDF text / DOCX / TXT)
// ============================================================

async function parseResumeFromText(
  settings: ModelSettings,
  rawText: string,
): Promise<Record<string, unknown>> {
  const { createModel } = await import('@/lib/ai/models');
  const { generateText } = await import('ai');
  const { z } = await import('zod');

  const model = createModel(settings);
  const prompt = getResumePrompt(rawText);

  // First attempt: generateObject (for models that support structured output)
  try {
    const { generateObject } = await import('ai');
    const candidateSchema = getCandidateSchema(z);
    console.log('[parse-resume] Trying generateObject...');
    const { object } = await generateObject({
      model,
      schema: candidateSchema,
      prompt,
      temperature: 0.1,
    });
    console.log('[parse-resume] generateObject succeeded');
    return object as Record<string, unknown>;
  } catch {
    console.log('[parse-resume] generateObject not supported, using generateText + JSON extraction');
  }

  // Fallback: generateText + JSON extraction
  const jsonPrompt = `${prompt}

【输出格式】请直接输出一个合法的JSON对象，不要包含任何其他文字或markdown标记。
JSON 字段：name, email, phone, summary, education(数组), workExperience(数组), projects(数组), skills(数组, 每项含 name/level/category), yearsOfExperience(数字), currentTitle, currentCompany`;

  const { text } = await generateText({
    model,
    prompt: jsonPrompt,
    temperature: 0.1,
  });

  console.log('[parse-resume] AI response length:', text.length);
  return extractJSON(text);
}

// ============================================================
// Vision-based parsing (images / scanned PDFs)
// ============================================================

async function parseResumeFromImage(
  settings: ModelSettings,
  imageBuffer: Buffer,
  mimeType: string,
): Promise<Record<string, unknown>> {
  const { parseResumeWithVision } = await import('@/lib/ai/models');
  const { z } = await import('zod');

  const visionPrompt = `你是一个专业的简历解析助手。请仔细查看这张简历图片，提取所有候选人的结构化信息。

【提取要求】
1. 姓名识别（最重要）：
   - 中文姓名通常是 2-4 个汉字，出现在简历最顶部/最显眼的位置（通常是最大的字）
   - 常见模式：顶部居中大字、"姓名：XXX"、或左上角突出显示
   - 排除干扰项：学校名、学院名、标签（985/211/双一流）、职位名等
   - 如果有邮箱地址（如 xxx@xxx.edu.cn），邮箱前缀通常是姓名的拼音，可辅助确认
2. 联系方式：仔细查找手机号、邮箱、微信号等
3. currentTitle / currentCompany 从最近的工作经历或科研经历中提取
4. 如果没有明确的技能列表，从工作经历和项目经历的技术栈中推断
5. 技能熟练度：1=了解 2=会用 3=熟练 4=精通 5=专家
6. 技能类别参考：编程语言、前端、后端、数据库、DevOps、AI/ML、移动端、数据、设计、其他
7. 所有字段都必须填写，没有对应的字段填空字符串
8. 注意识别教育经历中的 GPA、排名等量化信息

请输出一个合法的JSON对象，包含以下字段：
- name: 候选人姓名
- email: 电子邮箱
- phone: 电话号码
- summary: 个人简介
- education: 数组，每项含 school, degree, major, startDate, endDate, gpa(可选)
- workExperience: 数组，每项含 company, title, startDate, endDate, description
- projects: 数组，每项含 name, role, startDate, endDate, description, technologies(字符串数组)
- skills: 数组，每项含 name(字符串), level(1-5数字), category(字符串)
- yearsOfExperience: 数字
- currentTitle: 字符串
- currentCompany: 字符串

只输出JSON，不要其他文字。`;

  // Try generateObject first (if model supports vision + structured output)
  try {
    const { createModel } = await import('@/lib/ai/models');
    const model = createModel(settings);
    const candidateSchema = getCandidateSchema(z);

    console.log('[parse-resume] Vision: trying generateObject with image messages...');

    // Build multimodal message with image
    const { generateObject: go } = await import('ai');
    const result = await go({
      model,
      schema: candidateSchema,
      messages: [{
        role: 'user',
        content: [
          { type: 'text' as const, text: visionPrompt },
          {
              type: 'image' as const,
              image: imageBuffer,
              mediaType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp',
            },
        ],
      }],
      temperature: 0.1,
    });
    console.log('[parse-resume] Vision generateObject succeeded');
    return result.object as Record<string, unknown>;
  } catch {
    console.log('[parse-resume] Vision generateObject not available, using direct API call');
  }

  // Fallback: direct API call for vision
  const responseText = await parseResumeWithVision(settings, imageBuffer, mimeType, visionPrompt);
  console.log('[parse-resume] Vision API response length:', responseText.length);
  return extractJSON(responseText);
}

/**
 * Parse resume from multiple page images (for multi-page PDFs).
 * Sends all pages as separate images in one message for comprehensive extraction.
 */
async function parseResumeFromImages(
  settings: ModelSettings,
  pages: Buffer[],
): Promise<Record<string, unknown>> {
  const { z } = await import('zod');
  const visionPrompt = `你是一个专业的简历解析助手。你将看到一份简历的多个页面图片（按顺序排列）。请综合所有页面的信息，提取候选人的完整结构化数据。

【提取要求】
1. 姓名识别（最重要）：
   - 中文姓名通常是 2-4 个汉字，出现在简历最顶部/最显眼的位置
   - 常见模式：顶部居中大字、"姓名：XXX"、或左上角突出显示
   - 排除干扰项：学校名、学院名、标签（985/211/双一流）、职位名等
   - 如果有邮箱地址（如 xxx@xxx.edu.cn），邮箱前缀通常是姓名的拼音，可辅助确认
2. 联系方式：仔细查找手机号、邮箱、微信号等
3. currentTitle / currentCompany 从最近的工作经历或科研经历中提取
4. 如果没有明确的技能列表，从工作经历和项目经历的技术栈中推断
5. 技能熟练度：1=了解 2=会用 3=熟练 4=精通 5=专家
6. 技能类别参考：编程语言、前端、后端、数据库、DevOps、AI/ML、移动端、数据、设计、其他
7. 所有字段都必须填写，没有对应的字段填空字符串
8. 请综合所有页面的信息，不要遗漏任何页面的内容

请输出一个合法的JSON对象，包含以下字段：
- name: 候选人姓名
- email: 电子邮箱
- phone: 电话号码
- summary: 个人简介
- education: 数组，每项含 school, degree, major, startDate, endDate, gpa(可选)
- workExperience: 数组，每项含 company, title, startDate, endDate, description
- projects: 数组，每项含 name, role, startDate, endDate, description, technologies(字符串数组)
- skills: 数组，每项含 name(字符串), level(1-5数字), category(字符串)
- yearsOfExperience: 数字
- currentTitle: 字符串
- currentCompany: 字符串

只输出JSON，不要其他文字。`;

  // Build multimodal message with all page images
  const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: Buffer; mediaType: 'image/png' }> = [
    { type: 'text' as const, text: visionPrompt },
  ];
  for (let i = 0; i < pages.length; i++) {
    content.push({
      type: 'image' as const,
      image: pages[i],
      mediaType: 'image/png',
    });
    if (pages.length > 1) {
      content.push({
        type: 'text' as const,
        text: `[第 ${i + 1}/${pages.length} 页]`,
      });
    }
  }

  // Try generateObject first
  try {
    const { createModel } = await import('@/lib/ai/models');
    const { generateObject } = await import('ai');
    const model = createModel(settings);
    const candidateSchema = getCandidateSchema(z);

    console.log(`[parse-resume] Multi-page vision: trying generateObject with ${pages.length} images...`);
    const result = await generateObject({
      model,
      schema: candidateSchema,
      messages: [{
        role: 'user',
        content,
      }],
      temperature: 0.1,
    });
    console.log('[parse-resume] Multi-page vision generateObject succeeded');
    return result.object as Record<string, unknown>;
  } catch {
    console.log('[parse-resume] Multi-page vision generateObject not available, using direct API call');
  }

  // Fallback: use parseResumeWithVision with the first page
  // (The direct API call only supports one image, so we use the most important page)
  const { parseResumeWithVision } = await import('@/lib/ai/models');
  const responseText = await parseResumeWithVision(settings, pages[0], 'image/png', visionPrompt);
  console.log('[parse-resume] Multi-page vision fallback response length:', responseText.length);
  return extractJSON(responseText);
}

// ============================================================
// Post-processing (pure data logic, no regex extraction)
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- rawText reserved for future post-processing
function postProcess(data: Record<string, unknown>, rawText: string): Record<string, unknown> {
  const result = { ...data };

  // ---- Backfill currentTitle / currentCompany from workExperience array ----
  const workExp = (result.workExperience as Array<Record<string, unknown>>) || [];

  if (!isNonEmptyString(result.currentTitle)) {
    for (let i = workExp.length - 1; i >= 0; i--) {
      if (workExp[i] && isNonEmptyString(workExp[i].title)) {
        result.currentTitle = String(workExp[i].title).trim();
        console.log(`[post-process] Backfilled currentTitle from workExp[${i}]: ${result.currentTitle}`);
        break;
      }
    }
  }

  if (!isNonEmptyString(result.currentCompany)) {
    for (let i = workExp.length - 1; i >= 0; i--) {
      if (workExp[i] && isNonEmptyString(workExp[i].company)) {
        result.currentCompany = String(workExp[i].company).trim();
        console.log(`[post-process] Backfilled currentCompany from workExp[${i}]: ${result.currentCompany}`);
        break;
      }
    }
  }

  // ---- Backfill skills from projects.technologies and work descriptions ----
  const skills = (result.skills as Array<Record<string, unknown>>) || [];
  if (skills.length === 0) {
    const extracted = new Set<string>();

    const projects = (result.projects as Array<Record<string, unknown>>) || [];
    for (const p of projects) {
      const techs = (p.technologies as string[]) || [];
      techs.forEach(t => extracted.add(t));
    }

    // Extract tech keywords from work descriptions
    const techKeywords = [
      'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
      'HTML', 'CSS', 'SASS', 'Webpack', 'Vite', 'Docker', 'Kubernetes', 'AWS', 'Azure',
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'Git', 'CI/CD', 'Linux',
      'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP',
    ];

    for (const w of workExp) {
      const desc = ((w.description as string) || '').toLowerCase();
      for (const kw of techKeywords) {
        if (desc.includes(kw.toLowerCase())) extracted.add(kw);
      }
    }

    if (extracted.size > 0) {
      result.skills = Array.from(extracted).map(name => ({
        name,
        level: 3,
        category: guessSkillCategory(name),
      }));
      console.log(`[post-process] Extracted ${extracted.size} skills from work/projects`);
    }
  }

  // ---- Calculate yearsOfExperience if zero ----
  if (!result.yearsOfExperience || result.yearsOfExperience === 0) {
    if (workExp.length > 0) {
      const years = calculateYearsOfExperience(workExp);
      if (years > 0) {
        result.yearsOfExperience = years;
        console.log(`[post-process] Calculated yearsOfExperience: ${years}`);
      }
    }
  }

  // ---- Ensure required fields have sensible defaults ----
  if (!isNonEmptyString(result.name)) result.name = '未知';
  if (!isNonEmptyString(result.currentTitle)) result.currentTitle = '未知';
  if (!isNonEmptyString(result.currentCompany)) result.currentCompany = '未知';
  if (!Array.isArray(result.education)) result.education = [];
  if (!Array.isArray(result.workExperience)) result.workExperience = [];
  if (!Array.isArray(result.projects)) result.projects = [];
  if (!Array.isArray(result.skills)) result.skills = [];
  if (typeof result.yearsOfExperience !== 'number') result.yearsOfExperience = 0;
  if (typeof result.email !== 'string') result.email = '';
  if (typeof result.phone !== 'string') result.phone = '';
  if (typeof result.summary !== 'string') result.summary = '';

  return result;
}

// ============================================================
// Text extraction helpers
// ============================================================

async function extractTextFromPDF(buffer: Buffer, fileName: string): Promise<string> {
  try {
    await ensurePdfWorker();
    const { PDFParse } = await import('pdf-parse');
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse({ data: uint8Array });
    const result = await parser.getText();
    await parser.destroy();
    const text = result.text || '';
    console.log(`[extractText] PDF: ${text.length} chars from ${fileName}`);
    return text;
  } catch (pdfError) {
    console.error(`[extractText] PDF parse failed for ${fileName}:`, pdfError);
    return '';
  }
}

/**
 * Convert PDF pages to PNG images using PyMuPDF (via Python subprocess).
 *
 * Why not pdfjs-dist? Some PDFs use custom font encodings (/Differences arrays
 * mapping to non-standard glyph names like /g0, /g3AD6) that cause pdfjs-dist
 * to lose CJK characters — both in text extraction AND visual rendering to PNG.
 * PyMuPDF (MuPDF backend) handles these encodings correctly, producing PNGs
 * that preserve all Chinese characters for the vision model.
 *
 * Falls back to pdfjs-dist's getScreenshot() if Python/PyMuPDF is unavailable.
 *
 * Returns buffers for up to `maxPages` pages (default 3 — most resumes are 1-2 pages).
 */
async function convertPdfPagesToImages(
  buffer: Buffer,
  maxPages = 3,
): Promise<{ pages: Buffer[]; totalPages: number }> {
  // ---- Primary: PyMuPDF via Python subprocess ----
  try {
    return await convertPdfPagesToImagesViaPyMuPDF(buffer, maxPages);
  } catch (pyError) {
    console.warn('[pdf-to-png] PyMuPDF failed, falling back to pdfjs-dist:', pyError);
  }

  // ---- Fallback: pdfjs-dist (may lose CJK characters) ----
  return convertPdfPagesToImagesViaPdfjs(buffer, maxPages);
}

/**
 * Convert PDF pages to PNG using PyMuPDF (fitz) via a Python subprocess.
 * This handles custom font encodings that break pdfjs-dist's CJK rendering.
 */
async function convertPdfPagesToImagesViaPyMuPDF(
  buffer: Buffer,
  maxPages: number,
): Promise<{ pages: Buffer[]; totalPages: number }> {
  const { execFile } = await import('child_process');
  const { readFile, unlink, mkdtemp, writeFile } = await import('fs/promises');
  const { join } = await import('path');
  const { tmpdir } = await import('os');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);

  // Create temp directory for this conversion
  const tempDir = await mkdtemp(join(tmpdir(), 'resume-pdf-'));
  const pdfPath = join(tempDir, 'input.pdf');
  const outputDir = join(tempDir, 'pages');

  try {
    // Write PDF buffer to temp file
    await writeFile(pdfPath, buffer);
    console.log(`[pdf-to-png] Wrote ${Math.round(buffer.length / 1024)}KB PDF to temp file`);

    // Locate the Python script (relative to this route file)
    // In Next.js, __dirname resolves to .next/server/app/api/parse-resume/
    // The script is at scripts/pdf-to-png.py relative to the project root
    const projectRoot = process.cwd();
    const scriptPath = join(projectRoot, 'scripts', 'pdf-to-png.py');

    // Call Python script
    const { stdout } = await execFileAsync('python', [
      scriptPath,
      pdfPath,
      outputDir,
      '--max-pages', String(maxPages),
      '--dpi', '200',
    ], { timeout: 30000 });

    const result = JSON.parse(stdout.trim());
    if (result.error) {
      throw new Error(result.error);
    }

    console.log(`[pdf-to-png] PyMuPDF: ${result.totalPages} total pages, converting ${result.pages.length}`);

    // Read PNG files into Buffer array
    const pages: Buffer[] = [];
    for (const pageInfo of result.pages) {
      const pngBuffer = await readFile(pageInfo.path);
      pages.push(pngBuffer);
      console.log(`[pdf-to-png] Page ${pageInfo.pageNumber}: ${pageInfo.width}x${pageInfo.height}, ${Math.round(pngBuffer.length / 1024)}KB`);
    }

    return { pages, totalPages: result.totalPages };
  } finally {
    // Clean up temp files
    try {
      const { readdir } = await import('fs/promises');
      const files = await readdir(outputDir).catch(() => []);
      for (const f of files) {
        await unlink(join(outputDir, f)).catch(() => {});
      }
      await unlink(pdfPath).catch(() => {});
      const { rmdir } = await import('fs/promises');
      await rmdir(outputDir).catch(() => {});
      await rmdir(tempDir).catch(() => {});
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Fallback: Convert PDF pages to PNG using pdfjs-dist's getScreenshot().
 * WARNING: May lose CJK characters for PDFs with custom font encodings.
 */
async function convertPdfPagesToImagesViaPdfjs(
  buffer: Buffer,
  maxPages: number,
): Promise<{ pages: Buffer[]; totalPages: number }> {
  await ensurePdfWorker();
  const { PDFParse } = await import('pdf-parse');
  const uint8Array = new Uint8Array(buffer);
  const parser = new PDFParse({ data: uint8Array });

  try {
    const previewResult = await parser.getScreenshot({ first: 1, scale: 2 });
    const totalPages = previewResult.total || 1;
    const pagesToConvert = Math.min(totalPages, maxPages);

    console.log(`[pdf-to-png] pdfjs fallback: ${totalPages} pages, converting ${pagesToConvert}`);

    let screenshotResult;
    if (pagesToConvert === 1) {
      screenshotResult = previewResult;
    } else {
      const pageNumbers = Array.from({ length: pagesToConvert }, (_, i) => i + 1);
      screenshotResult = await parser.getScreenshot({ partial: pageNumbers, scale: 2 });
    }

    const pages: Buffer[] = [];
    for (const screenshot of screenshotResult.pages) {
      if (screenshot.data && screenshot.data.length > 0) {
        pages.push(Buffer.from(screenshot.data));
        console.log(`[pdf-to-png] Page ${screenshot.pageNumber}: ${screenshot.width}x${screenshot.height}, ${Math.round(screenshot.data.length / 1024)}KB`);
      }
    }

    return { pages, totalPages };
  } finally {
    await parser.destroy();
  }
}

async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  if (fileName.endsWith('.txt') || mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')
    || mimeType.includes('word') || mimeType.includes('document')) {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch {
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\u4e00-\u9fff\n]/g, '');
    }
  }

  return buffer.toString('utf-8');
}

// ============================================================
// Utility functions
// ============================================================

/**
 * Extract a JSON object from AI response text (handles markdown fences, etc.)
 */
function extractJSON(text: string): Record<string, unknown> {
  // Try to find JSON in markdown code fences first
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fencedMatch
    ? fencedMatch[1].trim()
    : text.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonStr) {
    console.error('[extractJSON] No JSON found in response. Preview:', text.substring(0, 500));
    throw new Error('AI 模型未能返回有效的 JSON 格式');
  }

  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch (parseError) {
    console.error('[extractJSON] JSON parse failed. Raw:', jsonStr.substring(0, 500));
    throw new Error(`AI 返回的 JSON 格式无效: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
  }
}

function isNonEmptyString(val: unknown): boolean {
  return typeof val === 'string' && val.trim().length > 0;
}

function guessMime(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  };
  return map[ext] || 'application/octet-stream';
}

function guessSkillCategory(skillName: string): string {
  const name = skillName.toLowerCase();
  const rules: [string[], string][] = [
    [['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'next.js', 'svelte'], '前端'],
    [['node.js', 'python', 'java', 'go', 'rust', 'php', 'django', 'flask', 'spring', 'express', 'fastapi'], '后端'],
    [['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'elasticsearch'], '数据库'],
    [['docker', 'kubernetes', 'aws', 'azure', 'ci/cd', 'jenkins', 'linux', 'nginx'], 'DevOps'],
    [['tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp', 'opencv'], 'AI/ML'],
    [['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'], '移动端'],
    [['sql', 'pandas', 'numpy', 'spark', 'hadoop', 'tableau'], '数据'],
    [['git', 'svn'], '版本控制'],
  ];
  for (const [keywords, category] of rules) {
    if (keywords.some(k => name.includes(k))) return category;
  }
  return '其他';
}

function calculateYearsOfExperience(workExperience: Array<Record<string, unknown>>): number {
  if (workExperience.length === 0) return 0;

  let earliest = new Date().getFullYear();
  let latest = 0;

  for (const work of workExperience) {
    const startMatch = ((work.startDate as string) || '').match(/(\d{4})/);
    const endMatch = ((work.endDate as string) || '').match(/(\d{4})/);

    if (startMatch) {
      const y = parseInt(startMatch[1]);
      if (y < earliest && y > 1900) earliest = y;
    }
    if (endMatch) {
      const y = parseInt(endMatch[1]);
      if (y > latest && y <= new Date().getFullYear() + 1) latest = y;
    }
  }

  if (latest === 0) latest = new Date().getFullYear();
  const years = latest - earliest;
  return years > 0 && years < 50 ? years : 0;
}
