import { useState } from 'react';
import {
  Download,
  Settings,
  CheckCircle2,
  Music,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface ExportConfig {
  resolution: '720p' | '1080p' | '4k';
  fps: 30 | 60;
  bitrate: 'high' | 'medium' | 'low';
  platform: 'tiktok' | 'youtube' | 'bilibili' | 'xiaohongshu' | 'custom';
  addWatermark: boolean;
  addBackgroundMusic: boolean;
}

const ExportPage = () => {
  const { videoUrl, fileName, duration, segments } = useVideoStore();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [config, setConfig] = useState<ExportConfig>({
    resolution: '1080p',
    fps: 30,
    bitrate: 'medium',
    platform: 'tiktok',
    addWatermark: false,
    addBackgroundMusic: true,
  });

  if (!videoUrl) {
    navigate('/');
    return null;
  }

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportComplete(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const updateConfig = (key: keyof ExportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const platforms = [
    { value: 'tiktok', label: '抖音 / TikTok', icon: '🎵' },
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'bilibili', label: 'B站', icon: '📹' },
    { value: 'xiaohongshu', label: '小红书', icon: '📕' },
    { value: 'custom', label: '自定义', icon: '⚙️' },
  ];

  const finalDuration = segments
    .filter(s => !s.isRemoved)
    .reduce((acc, s) => acc + (s.end - s.start), 0);

  return (
    <div className="min-h-screen bg-dark-900 text-white font-space">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <h1 className="text-2xl font-orbitron font-bold">导出视频</h1>
          </div>

          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 bg-dark-800 rounded-2xl overflow-hidden mb-6 relative">
              <video
                src={videoUrl}
                className="w-full h-full object-contain bg-black"
              />
              {isExporting && (
                <div className="absolute inset-0 bg-dark-900/90 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 mb-6 relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="#374151"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="276.46"
                        strokeDashoffset={276.46 - (276.46 * exportProgress) / 100}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{exportProgress}%</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-300">正在导出视频...</p>
                </div>
              )}
              {exportComplete && (
                <div className="absolute inset-0 bg-dark-900/90 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">导出完成！</h2>
                  <p className="text-gray-400 mb-6">您的视频已准备好</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        // 创建下载链接，下载我们的原始视频作为示例
                        const link = document.createElement('a');
                        link.href = videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';
                        link.download = 'edited-video.mp4';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      下载视频
                    </button>
                    <button 
                      onClick={() => alert('分享功能需要连接社交平台API，这是演示版本，分享功能待开发！')}
                      className="px-6 py-3 bg-dark-700 rounded-xl font-medium hover:bg-dark-600 transition-all flex items-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      分享
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setExportComplete(false);
                      useVideoStore.getState().reset();
                      navigate('/');
                    }}
                    className="mt-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    剪辑新视频
                  </button>
                </div>
              )}
            </div>

            <div className="bg-dark-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4">视频信息</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">文件名</p>
                  <p className="font-medium">{fileName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">原始时长</p>
                  <p className="font-medium">
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">最终时长</p>
                  <p className="font-medium text-green-400">
                    {Math.floor(finalDuration / 60)}:{Math.floor(finalDuration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 border-l border-dark-700 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Settings className="w-5 h-5 text-secondary" />
              导出设置
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">目标平台</h3>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => updateConfig('platform', platform.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      config.platform === platform.value
                        ? 'border-primary bg-primary/10'
                        : 'border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <span className="text-xl">{platform.icon}</span>
                    <p className="text-sm font-medium mt-1">{platform.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">分辨率</h3>
              <div className="space-y-2">
                {['720p', '1080p', '4k'].map((res) => (
                  <button
                    key={res}
                    onClick={() => updateConfig('resolution', res)}
                    className={`w-full py-2 px-4 rounded-lg text-left transition-all ${
                      config.resolution === res
                        ? 'bg-primary text-white'
                        : 'bg-dark-700 hover:bg-dark-600'
                    }`}
                  >
                    {res.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">帧率</h3>
              <div className="flex gap-2">
                {[30, 60].map((fps) => (
                  <button
                    key={fps}
                    onClick={() => updateConfig('fps', fps)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                      config.fps === fps
                        ? 'bg-primary text-white'
                        : 'bg-dark-700 hover:bg-dark-600'
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">附加选项</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    添加背景音乐
                  </span>
                  <button
                    onClick={() => updateConfig('addBackgroundMusic', !config.addBackgroundMusic)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      config.addBackgroundMusic ? 'bg-primary' : 'bg-dark-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                        config.addBackgroundMusic ? 'ml-6' : 'ml-1'
                      }`}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>添加水印</span>
                  <button
                    onClick={() => updateConfig('addWatermark', !config.addWatermark)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      config.addWatermark ? 'bg-primary' : 'bg-dark-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                        config.addWatermark ? 'ml-6' : 'ml-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-dark-700">
            {!exportComplete && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {isExporting ? '导出中...' : '开始导出'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
