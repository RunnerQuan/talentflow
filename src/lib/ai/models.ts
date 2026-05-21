// ============================================================
// TalentFlow — Multi-Model Adapter (OpenAI-compatible)
// ============================================================

import { createOpenAI } from '@ai-sdk/openai';
import type { ModelSettings } from '@/types';

/**
 * Create an AI SDK model instance based on user-provided settings.
 * Uses the OpenAI-compatible adapter for all models — works with
 * OpenAI, DeepSeek, GLM, MiMo, MiniMax, Kimi, and any OpenAI-compatible API.
 */
export function createModel(settings: ModelSettings) {
  if (!settings.modelName) {
    throw new Error('请填写模型名称');
  }
  if (!settings.apiKey) {
    throw new Error('请填写 API Key');
  }
  if (!settings.baseURL) {
    throw new Error('请填写 Base URL');
  }

  const provider = createOpenAI({
    apiKey: settings.apiKey,
    baseURL: settings.baseURL,
  });

  // 使用 chat() 而非默认调用，确保走 /chat/completions 端点
  // 默认调用会走 /responses 端点，很多自定义 OpenAI 兼容 API 不支持
  return provider.chat(settings.modelName);
}

/**
 * Parse a resume image using a vision-capable model.
 * Sends base64 image data directly to the model via OpenAI-compatible vision API.
 * This bypasses the AI SDK's multimodal support for maximum compatibility
 * with custom OpenAI-compatible endpoints.
 */
export async function parseResumeWithVision(
  settings: ModelSettings,
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string,
): Promise<string> {
  const base64 = imageBuffer.toString('base64');
  const endpoint = `${settings.baseURL.replace(/\/+$/, '')}/chat/completions`;

  console.log(`[vision] Calling vision API: ${endpoint}, model: ${settings.modelName}, image size: ${Math.round(imageBuffer.length / 1024)}KB`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.modelName,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Vision API returned ${response.status}: ${errorBody.substring(0, 300)}`);
  }

  const data = await response.json() as Record<string, unknown>;
  const choices = data.choices as Array<Record<string, unknown>> | undefined;
  const firstChoice = choices?.[0];
  const message = firstChoice?.message as Record<string, unknown> | undefined;
  const content =
    (message?.content as string)
    ?? (firstChoice?.content as string)
    ?? (data.result as string)
    ?? '';

  if (!content || typeof content !== 'string') {
    throw new Error('Vision API returned empty response');
  }

  return content;
}

/**
 * Test connection to the model by sending a minimal request.
 * First tries via the AI SDK, then falls back to raw HTTP for better error messages.
 */
export async function testModelConnection(settings: ModelSettings): Promise<{ success: boolean; error?: string }> {
  // 先用原始 HTTP 请求测试，获取最真实的错误信息
  try {
    const baseURL = settings.baseURL.replace(/\/+$/, ''); // 去掉末尾斜杠
    const endpoint = `${baseURL}/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: [{ role: 'user', content: 'Say "ok" in one word.' }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(15000), // 15秒超时
    });

    if (response.ok) {
      const data = await response.json() as Record<string, unknown>;
      // 检查是否有有效的响应
      if (data.choices || data.content || data.result) {
        return { success: true };
      }
      return { success: true }; // 200 OK 就算成功
    }

    // 处理 HTTP 错误
    const status = response.status;
    let responseBody = '';
    try {
      responseBody = await response.text();
    } catch {
      // ignore
    }

    // 解析 API 返回的错误信息
    let apiError = '';
    try {
      const errorJson = JSON.parse(responseBody) as Record<string, unknown>;
      apiError = (errorJson.error as Record<string, unknown>)?.message as string
        || (errorJson.error as string)
        || errorJson.message as string
        || responseBody.substring(0, 200);
    } catch {
      apiError = responseBody.substring(0, 200) || response.statusText;
    }

    // 根据 HTTP 状态码生成友好错误信息
    let friendlyError = '';
    if (status === 401) {
      friendlyError = '认证失败（401）：API Key 无效或已过期';
    } else if (status === 403) {
      friendlyError = '访问被拒绝（403）：API Key 权限不足或模型不可用';
    } else if (status === 404) {
      friendlyError = `接口未找到（404）：请检查 Base URL 是否正确\n`
        + `实际请求地址：${endpoint}\n`
        + `API 返回：${apiError}`;
    } else if (status === 429) {
      friendlyError = '请求过于频繁（429）：已触发速率限制，请稍后再试';
    } else if (status >= 500) {
      friendlyError = `服务器错误（${status}）：API 服务暂时不可用`;
    } else {
      friendlyError = `API 返回错误（${status}）：${apiError}`;
    }

    return { success: false, error: friendlyError };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';

    // 分析网络错误
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      return { success: false, error: `无法解析主机：请检查 Base URL 是否正确（${settings.baseURL}）` };
    }
    if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
      return { success: false, error: `网络错误：无法连接到 ${settings.baseURL}，请检查 URL 和网络连接` };
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('TimeoutError') || errorMessage.includes('abort')) {
      return { success: false, error: `请求超时（15秒）：API 服务器响应过慢，请稍后再试` };
    }
    if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
      return { success: false, error: `SSL/TLS 错误：证书验证失败，可能是网络环境问题` };
    }

    return { success: false, error: `连接失败：${errorMessage}` };
  }
}
