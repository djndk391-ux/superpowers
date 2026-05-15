import { useState } from 'react';
import {
  Type,
  Palette,
  ArrowDown,
  ArrowUp,
  Download,
  ArrowRight,
} from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
}

const SubtitlesPage = () => {
  const { videoUrl, segments, setCurrentStep } = useVideoStore();
  const navigate = useNavigate();
  const [style, setStyle] = useState<SubtitleStyle>({
    fontSize: 24,
    fontFamily: 'system-ui',
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.75)',
    position: 'bottom',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!videoUrl) {
    navigate('/');
    return null;
  }

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const updateStyle = (key: keyof SubtitleStyle, value: any) => {
    setStyle(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-space">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-orbitron font-bold">自动字幕</h1>
              <button
                onClick={() => navigate('/materials')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                下一步：匹配素材
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 bg-dark-800 rounded-2xl overflow-hidden mb-6 relative">
              <video
                src={videoUrl}
                className="w-full h-full object-contain bg-black"
              />
              <div
                className="absolute left-0 right-0 px-8 text-center pointer-events-none"
                style={{
                  [style.position]: '60px',
                }}
              >
                <div
                  className="inline-block px-6 py-3 rounded-lg"
                  style={{
                    fontSize: `${style.fontSize}px`,
                    fontFamily: style.fontFamily,
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                  }}
                >
                  {segments.find(s => !s.isRemoved)?.text || '预览字幕会在这里显示'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 border-l border-dark-700 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Type className="w-5 h-5 text-secondary" />
              字幕样式设置
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                字体大小
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateStyle('fontSize', Math.max(12, style.fontSize - 2))}
                  className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-medium">{style.fontSize}px</span>
                </div>
                <button
                  onClick={() => updateStyle('fontSize', Math.min(48, style.fontSize + 2))}
                  className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                文字颜色
              </h3>
              <div className="flex gap-3 flex-wrap">
                {['#ffffff', '#f97316', '#6366f1', '#22c55e', '#ef4444'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateStyle('color', color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      style.color === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">背景透明度</h3>
              <div className="space-y-2">
                {[
                  { label: '无背景', value: 'transparent' },
                  { label: '半透明', value: 'rgba(0,0,0,0.5)' },
                  { label: '深色', value: 'rgba(0,0,0,0.75)' },
                  { label: '黑色', value: 'rgba(0,0,0,1)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateStyle('backgroundColor', option.value)}
                    className={`w-full py-2 px-4 rounded-lg text-left transition-all ${
                      style.backgroundColor === option.value
                        ? 'bg-primary text-white'
                        : 'bg-dark-700 hover:bg-dark-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">字幕位置</h3>
              <div className="space-y-2">
                {[
                  { label: '顶部', value: 'top' },
                  { label: '居中', value: 'center' },
                  { label: '底部', value: 'bottom' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateStyle('position', option.value as any)}
                    className={`w-full py-2 px-4 rounded-lg text-left transition-all ${
                      style.position === option.value
                        ? 'bg-primary text-white'
                        : 'bg-dark-700 hover:bg-dark-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-dark-700 space-y-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Type className="w-5 h-5" />
                  生成字幕文件
                </>
              )}
            </button>
            <button className="w-full py-3 bg-dark-700 rounded-xl font-medium hover:bg-dark-600 transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              下载 SRT 文件
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitlesPage;
