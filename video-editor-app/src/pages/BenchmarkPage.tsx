import { useState, useRef } from 'react';
import {
  Video,
  TrendingUp,
  Clock,
  Type,
  Zap,
  Check,
  ArrowRight,
  Eye,
  Play,
  Pause,
  Sparkles,
  Info,
} from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

const BenchmarkPage = () => {
  const navigate = useNavigate();
  const {
    videoUrl,
    benchmarkUrl,
    benchmarkFile,
    setBenchmark,
    setAnalyzingBenchmark,
    isAnalyzingBenchmark,
    benchmarkAnalysis,
    setBenchmarkAnalysis,
    updateBenchmarkApplySettings,
    applyBenchmarkCutPoints,
    applyBenchmarkRhythm,
    applyBenchmarkSubtitleStyle,
    applyBenchmarkTransitions,
  } = useVideoStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  // 如果没有主视频，先回到首页
  if (!videoUrl) {
    navigate('/');
    return null;
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(f => f.type.startsWith('video/'));
    if (videoFile) {
      processBenchmarkFile(videoFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBenchmarkFile(file);
    }
  };

  const processBenchmarkFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      setBenchmark(file, url, video.duration, file.name);
    };
  };

  const startAnalysis = () => {
    setAnalyzingBenchmark(true);
    
    // 模拟AI分析
    setTimeout(() => {
      const mockAnalysis = {
        cutPoints: [
          { time: 3.2, type: '场景切换' },
          { time: 7.8, type: '节奏转折点' },
          { time: 12.5, type: '黄金分割点' },
          { time: 18.3, type: '转场点' },
          { time: 24.1, type: '高潮开始' },
        ],
        rhythmData: [
          { time: 0, intensity: 0.3 },
          { time: 5, intensity: 0.5 },
          { time: 10, intensity: 0.7 },
          { time: 15, intensity: 0.9 },
          { time: 20, intensity: 0.8 },
          { time: 25, intensity: 0.6 },
        ],
        subtitleStyle: {
          fontSize: 28,
          fontFamily: 'system-ui',
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.75)',
          position: 'bottom' as const,
        },
        transitions: ['淡入淡出', '硬切', '缩放'],
        tips: [
          '开头3秒使用痛点式切入，直接抓住观众注意力',
          '每3-5秒一个信息点，避免节奏拖沓',
          '使用情绪转折点增加视频张力',
          '字幕使用大号字体，提高可读性',
          '视频时长控制在25-40秒区间数据最佳',
        ],
      };
      setBenchmarkAnalysis(mockAnalysis);
      setAnalyzingBenchmark(false);
    }, 3000);
  };

  const togglePlay1 = () => {
    if (videoRef1.current) {
      isPlaying1 ? videoRef1.current.pause() : videoRef1.current.play();
      setIsPlaying1(!isPlaying1);
    }
  };

  const togglePlay2 = () => {
    if (videoRef2.current) {
      isPlaying2 ? videoRef2.current.pause() : videoRef2.current.play();
      setIsPlaying2(!isPlaying2);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-space">
      <div className="flex h-screen">
        {/* 左侧：视频对比播放区域 */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-orbitron font-bold">对标视频分析</h1>
            {benchmarkAnalysis && (
              <button
                onClick={() => navigate('/editor')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                应用技巧并继续
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 视频对比播放 */}
          <div className="flex-1 flex flex-col gap-6 mb-6">
            <div className="grid grid-cols-2 gap-6 h-1/2">
              {/* 主视频 */}
              <div className="bg-dark-800 rounded-2xl overflow-hidden relative">
                <video
                  ref={videoRef1}
                  src={videoUrl}
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={togglePlay1}
                    className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    {isPlaying1 ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                </div>
                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-sm">
                  你的视频
                </div>
              </div>

              {/* 对标视频 */}
              <div className="bg-dark-800 rounded-2xl overflow-hidden relative">
                {benchmarkUrl ? (
                  <>
                    <video
                      ref={videoRef2}
                      src={benchmarkUrl}
                      className="w-full h-full object-contain bg-black"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <button
                        onClick={togglePlay2}
                        className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      >
                        {isPlaying2 ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-lg text-sm">
                      对标视频
                    </div>
                  </>
                ) : (
                  <div
                    className={`h-full flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragging
                        ? 'bg-primary/10 border-2 border-primary border-dashed'
                        : 'hover:bg-dark-700 border-2 border-dashed border-dark-600'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileInput}
                    />
                    <Video className="w-16 h-16 text-gray-500 mb-4" />
                    <p className="text-gray-400 text-center mb-2">
                      拖放对标视频到这里
                    </p>
                    <p className="text-gray-500 text-sm">
                      或点击选择文件
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 分析按钮 */}
            {benchmarkUrl && !benchmarkAnalysis && (
              <div className="flex justify-center">
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzingBenchmark}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isAnalyzingBenchmark ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      AI 正在分析剪辑技巧...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      开始分析对标视频
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 分析结果展示 */}
            {benchmarkAnalysis && (
              <div className="bg-dark-800 rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  剪辑技巧分析报告
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  {/* 剪辑点分析 */}
                  <div className="bg-dark-700/50 rounded-xl p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      关键剪辑点
                    </h4>
                    <div className="space-y-2">
                      {benchmarkAnalysis.cutPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{formatTime(point.time)}</span>
                          <span className="text-primary">{point.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 节奏曲线 */}
                  <div className="bg-dark-700/50 rounded-xl p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-secondary" />
                      节奏强度曲线
                    </h4>
                    <div className="h-24 flex items-end gap-1">
                      {benchmarkAnalysis.rhythmData.map((data, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t transition-all hover:opacity-80"
                          style={{ height: `${data.intensity * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 转场方式 */}
                  <div className="bg-dark-700/50 rounded-xl p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      使用的转场方式
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {benchmarkAnalysis.transitions.map((trans, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                        >
                          {trans}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 字幕风格 */}
                  <div className="bg-dark-700/50 rounded-xl p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Type className="w-4 h-4 text-secondary" />
                      字幕风格
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">字体大小</span>
                        <span>{benchmarkAnalysis.subtitleStyle.fontSize}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">位置</span>
                        <span>
                          {benchmarkAnalysis.subtitleStyle.position === 'top'
                            ? '顶部'
                            : benchmarkAnalysis.subtitleStyle.position === 'center'
                            ? '居中'
                            : '底部'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 剪辑建议 */}
                <div className="mt-6 bg-dark-700/50 rounded-xl p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-secondary" />
                    剪辑建议
                  </h4>
                  <div className="space-y-2">
                    {benchmarkAnalysis.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：对标技巧应用设置 */}
        {benchmarkAnalysis && (
          <div className="w-80 border-l border-dark-700 flex flex-col">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                应用对标技巧
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <label className="flex items-center justify-between p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>应用剪辑点</span>
                </div>
                <button
                  onClick={() => updateBenchmarkApplySettings({ applyCutPoints: !applyBenchmarkCutPoints })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    applyBenchmarkCutPoints ? 'bg-primary' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                      applyBenchmarkCutPoints ? 'ml-6' : 'ml-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-secondary" />
                  <span>应用节奏模式</span>
                </div>
                <button
                  onClick={() => updateBenchmarkApplySettings({ applyRhythm: !applyBenchmarkRhythm })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    applyBenchmarkRhythm ? 'bg-secondary' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                      applyBenchmarkRhythm ? 'ml-6' : 'ml-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-primary" />
                  <span>应用字幕风格</span>
                </div>
                <button
                  onClick={() => updateBenchmarkApplySettings({ applySubtitleStyle: !applyBenchmarkSubtitleStyle })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    applyBenchmarkSubtitleStyle ? 'bg-primary' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                      applyBenchmarkSubtitleStyle ? 'ml-6' : 'ml-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-secondary" />
                  <span>应用转场效果</span>
                </div>
                <button
                  onClick={() => updateBenchmarkApplySettings({ applyTransitions: !applyBenchmarkTransitions })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    applyBenchmarkTransitions ? 'bg-secondary' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                      applyBenchmarkTransitions ? 'ml-6' : 'ml-1'
                    }`}
                  />
                </button>
              </label>

              <div className="p-4 bg-dark-800/50 rounded-xl border border-primary/30">
                <p className="text-sm text-gray-400">
                  💡 建议首次尝试开启全部选项，效果更佳
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkPage;
