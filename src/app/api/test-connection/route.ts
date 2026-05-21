// ============================================================
// TalentFlow — Test Model Connection API Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { testModelConnection } from '@/lib/ai/models';
import type { ModelSettings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelName, apiKey, baseURL } = body as ModelSettings;

    // 验证必填字段
    if (!modelName) {
      return NextResponse.json(
        { success: false, error: '请填写模型名称' },
        { status: 400 }
      );
    }
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '请填写 API Key' },
        { status: 400 }
      );
    }
    if (!baseURL) {
      return NextResponse.json(
        { success: false, error: '请填写 Base URL' },
        { status: 400 }
      );
    }

    const result = await testModelConnection({ modelName, apiKey, baseURL });
    return NextResponse.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json(
      { success: false, error: `服务器内部错误：${errorMessage}` },
      { status: 500 }
    );
  }
}
