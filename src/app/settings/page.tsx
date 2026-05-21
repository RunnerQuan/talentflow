// ============================================================
// TalentFlow — Model Settings Page
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModelStore } from '@/lib/store/model-store';
import {
  Settings,
  Key,
  Globe,
  Cpu,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    settings,
    isConnected,
    isTesting,
    error,
    setModelName,
    setApiKey,
    setBaseURL,
    setConnected,
    setTesting,
    setError,
    persist,

    visionSettings,
    isVisionConnected,
    isVisionTesting,
    visionError,
    setVisionEnabled,
    setVisionModelName,
    setVisionApiKey,
    setVisionBaseURL,
    setVisionConnected,
    setVisionTesting,
    setVisionError,
    persistVision,

    loadFromStorage,
  } = useModelStore();

  const [saved, setSaved] = useState(false);
  const [visionSaved, setVisionSaved] = useState(false);
  const [visionExpanded, setVisionExpanded] = useState(false);

  /** Load persisted settings on mount. */
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Expand vision section if it was previously enabled
  useEffect(() => {
    if (visionSettings.enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing store state to UI
      setVisionExpanded(true);
    }
  }, [visionSettings.enabled]);

  /** Test the text model connection via API route to avoid CORS issues. */
  const handleTest = useCallback(async () => {
    if (!settings.modelName) {
      setError('请先填写模型名称');
      return;
    }
    if (!settings.apiKey) {
      setError('请先填写 API Key');
      return;
    }
    if (!settings.baseURL) {
      setError('请先填写 Base URL');
      return;
    }

    setTesting(true);
    setError(null);
    setConnected(false);

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      setConnected(result.success);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('连接测试失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setTesting(false);
    }
  }, [settings, setTesting, setError, setConnected]);

  /** Test the vision model connection. */
  const handleVisionTest = useCallback(async () => {
    if (!visionSettings.modelName) {
      setVisionError('请先填写视觉模型名称');
      return;
    }
    if (!visionSettings.apiKey) {
      setVisionError('请先填写视觉模型 API Key');
      return;
    }
    if (!visionSettings.baseURL) {
      setVisionError('请先填写视觉模型 Base URL');
      return;
    }

    setVisionTesting(true);
    setVisionError(null);
    setVisionConnected(false);

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: visionSettings.modelName,
          apiKey: visionSettings.apiKey,
          baseURL: visionSettings.baseURL,
        }),
      });
      const result = await response.json();
      setVisionConnected(result.success);
      if (!result.success && result.error) {
        setVisionError(result.error);
      }
    } catch (err) {
      setVisionError('连接测试失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setVisionTesting(false);
    }
  }, [visionSettings, setVisionTesting, setVisionError, setVisionConnected]);

  /** Save text model settings to localStorage. */
  const handleSave = useCallback(() => {
    persist();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [persist]);

  /** Save vision model settings to localStorage. */
  const handleVisionSave = useCallback(() => {
    persistVision();
    setVisionSaved(true);
    setTimeout(() => setVisionSaved(false), 2000);
  }, [persistVision]);

  /** Toggle vision model enabled state. */
  const handleVisionToggle = useCallback(() => {
    const newEnabled = !visionSettings.enabled;
    setVisionEnabled(newEnabled);
    if (newEnabled) {
      setVisionExpanded(true);
    }
  }, [visionSettings.enabled, setVisionEnabled]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-4">
            <Settings className="w-4 h-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">系统配置</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-tf-primary mb-2">
            AI 模型配置
          </h1>
          <p className="text-tf-secondary">
            输入模型名称、API Key 和 Base URL，数据仅保存在本地浏览器中
          </p>
        </div>

        {/* ======================== Main Model Config ======================== */}
        <GlassCard className="p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-5 h-5 text-tf-accent" />
            <h2 className="text-lg font-semibold text-tf-primary">文本模型</h2>
            <span className="text-xs text-tf-text-secondary ml-auto">用于简历文本解析、匹配分析等</span>
          </div>
          <div className="flex flex-col gap-6">
            {/* Model name */}
            <Input
              label="模型名称"
              placeholder="例如：gpt-4o、claude-3-5-sonnet-20241022、deepseek-chat"
              value={settings.modelName}
              onChange={(e) => setModelName(e.target.value)}
              icon={<Cpu className="w-4 h-4" />}
              hint="填写 API 对应的模型标识符"
            />

            {/* API Key */}
            <Input
              label="API Key"
              type="password"
              placeholder="sk-..."
              value={settings.apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              icon={<Key className="w-4 h-4" />}
              hint="密钥仅存储在浏览器本地，不会上传到任何服务器"
            />

            {/* Base URL */}
            <Input
              label="Base URL"
              type="url"
              placeholder="例如：https://api.openai.com/v1"
              value={settings.baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              icon={<Globe className="w-4 h-4" />}
              hint="填写完整的 API 地址，支持任何 OpenAI 兼容的端点（包括自定义/代理地址）"
            />
          </div>
        </GlassCard>

        {/* Action buttons for text model */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            variant="secondary"
            onClick={handleTest}
            loading={isTesting}
            icon={isTesting ? undefined : <Wifi className="w-4 h-4" />}
            className="flex-1"
          >
            {isTesting ? '测试中...' : '测试连接'}
          </Button>

          <Button
            onClick={handleSave}
            icon={saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            className="flex-1"
          >
            {saved ? '已保存' : '保存配置'}
          </Button>
        </div>

        {/* Connection status for text model */}
        {isConnected && (
          <GlassCard variant="sm" className="p-4 flex items-center gap-3 border-emerald-200 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-tf-primary">连接成功</p>
              <p className="text-xs text-tf-text-secondary">文本模型已就绪，可以开始使用</p>
            </div>
          </GlassCard>
        )}

        {error && (
          <GlassCard variant="sm" className="p-4 border-red-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-tf-primary mb-1">连接失败</p>
                <pre className="text-xs text-red-500 whitespace-pre-wrap break-all font-sans leading-relaxed">{error}</pre>
              </div>
            </div>
          </GlassCard>
        )}

        {/* ======================== Vision Model Config ======================== */}
        <div className="mb-6">
          {/* Toggle header */}
          <button
            onClick={() => setVisionExpanded(!visionExpanded)}
            className="w-full glass-card p-4 flex items-center gap-3 cursor-pointer hover:bg-tf-glass/50 transition-colors"
          >
            <Eye className="w-5 h-5 text-tf-accent" />
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-tf-primary">视觉模型</h2>
                {visionSettings.enabled && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-tf-accent/10 text-tf-accent">
                    已启用
                  </span>
                )}
              </div>
              <p className="text-xs text-tf-text-secondary mt-0.5">
                用于图片简历和扫描件 PDF 的识别解析（可选，不配置则使用文本模型）
              </p>
            </div>
            {visionExpanded ? (
              <ChevronUp className="w-5 h-5 text-tf-text-secondary flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-tf-text-secondary flex-shrink-0" />
            )}
          </button>

          {/* Expanded content */}
          {visionExpanded && (
            <GlassCard className="p-8 mt-1 rounded-t-none border-t-0">
              {/* Enable toggle */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-tf-glass-border">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-tf-accent" />
                  <div>
                    <p className="text-sm font-medium text-tf-primary">启用独立视觉模型</p>
                    <p className="text-xs text-tf-text-secondary">
                      开启后，图片和扫描件将使用单独配置的视觉模型处理
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleVisionToggle}
                  className={`
                    relative w-12 h-7 rounded-full transition-colors duration-300 cursor-pointer
                    ${visionSettings.enabled ? 'bg-tf-accent' : 'bg-gray-300 dark:bg-gray-600'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md
                      transition-transform duration-300
                      ${visionSettings.enabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              {/* Vision model fields */}
              <div className={`flex flex-col gap-6 ${!visionSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <Input
                  label="视觉模型名称"
                  placeholder="例如：gpt-4o、claude-3-5-sonnet-20241022"
                  value={visionSettings.modelName}
                  onChange={(e) => setVisionModelName(e.target.value)}
                  icon={<Eye className="w-4 h-4" />}
                  hint="需要支持视觉/多模态输入的模型"
                />

                <Input
                  label="视觉模型 API Key"
                  type="password"
                  placeholder="sk-..."
                  value={visionSettings.apiKey}
                  onChange={(e) => setVisionApiKey(e.target.value)}
                  icon={<Key className="w-4 h-4" />}
                  hint="可以与文本模型使用不同的 API Key"
                />

                <Input
                  label="视觉模型 Base URL"
                  type="url"
                  placeholder="例如：https://api.openai.com/v1"
                  value={visionSettings.baseURL}
                  onChange={(e) => setVisionBaseURL(e.target.value)}
                  icon={<Globe className="w-4 h-4" />}
                  hint="视觉模型的 API 端点地址"
                />

                {/* Vision action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleVisionTest}
                    loading={isVisionTesting}
                    icon={isVisionTesting ? undefined : <Wifi className="w-4 h-4" />}
                    className="flex-1"
                    size="sm"
                  >
                    {isVisionTesting ? '测试中...' : '测试视觉模型连接'}
                  </Button>

                  <Button
                    onClick={handleVisionSave}
                    icon={visionSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    className="flex-1"
                    size="sm"
                  >
                    {visionSaved ? '已保存' : '保存视觉模型配置'}
                  </Button>
                </div>

                {/* Vision connection status */}
                {isVisionConnected && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">视觉模型连接成功</p>
                  </div>
                )}

                {visionError && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <pre className="text-xs text-red-500 whitespace-pre-wrap break-all font-sans leading-relaxed">{visionError}</pre>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>

        {/* ======================== Reference Configs ======================== */}
        <GlassCard variant="xs" className="p-4 mt-8">
          <p className="text-sm font-medium text-tf-primary mb-3">常用模型配置示例</p>
          <p className="text-xs text-tf-secondary mb-4 leading-relaxed">
            Base URL 支持任何 OpenAI 兼容的 API 端点。以下是常见平台的参考配置，您也可以使用自定义或代理地址。
          </p>
          <div className="space-y-3 text-xs text-tf-secondary">
            <div>
              <p className="font-medium text-tf-primary">LongCat (美团)</p>
              <p>Base URL: https://api.longcat.chat/openai</p>
              <p>模型: LongCat-2.0-Preview, LongCat-Flash-Chat, LongCat-Flash-Thinking</p>
            </div>
            <div>
              <p className="font-medium text-tf-primary">MiMo (小米)</p>
              <p>Base URL: https://api.mimo-v2.com/v1 或其他可用端点</p>
              <p>模型: mimo-v2.5-pro, mimo-v2.5, mimo-v2-pro, mimo-v2-flash</p>
            </div>
            <div>
              <p className="font-medium text-tf-primary">OpenAI</p>
              <p>Base URL: https://api.openai.com/v1</p>
              <p>模型: gpt-4o, gpt-4o-mini, gpt-3.5-turbo</p>
            </div>
            <div>
              <p className="font-medium text-tf-primary">DeepSeek</p>
              <p>Base URL: https://api.deepseek.com/v1</p>
              <p>模型: deepseek-chat, deepseek-coder</p>
            </div>
          </div>
        </GlassCard>

        {/* Security note */}
        <GlassCard variant="xs" className="p-4 mt-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-tf-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-tf-primary mb-1">隐私与安全</p>
            <p className="text-xs text-tf-secondary leading-relaxed">
              所有配置数据（包括 API Key）仅保存在您的浏览器本地存储中，
              不会上传至任何第三方服务器。简历数据在本地解析处理后同样仅保留在浏览器端。
              请妥善保管您的 API Key，避免泄露。
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
