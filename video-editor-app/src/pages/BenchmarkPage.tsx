import React, { useState, useRef } from 'react';
import { Video, Sparkles, Upload, Link, ArrowRight, TrendingUp, Clock, Zap, Type, Check, Info } from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

const BenchmarkPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    videoUrl,
    benchmarkUrl,
    setBenchmark,
    setAnalyzingBenchmark,
    isAnalyzingBenchmark,
    benchmarkAnalysis,
    setBenchmarkAnalysis,
    updateBenchmarkApplySettings,
    applyBenchmarkCutPoints,
    applyBenchmarkRhythm,
    applyBenchmarkSubtitleStyle,
    applyBenchmarkTransitions
  } = useVideoStore();

  const [benchmarkVideoUrlInput, setBenchmarkVideoUrlInput] = useState('');
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  if (!videoUrl) {
    navigate('/');
    return null;
  }

  const processBenchmarkFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setBenchmark(file, url, 120, file.name);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (benchmarkVideoUrlInput.trim()) {
      const fileName = benchmarkVideoUrlInput.split('/').pop() || `video-${Date.now()}`;
      setBenchmark(null as any, benchmarkVideoUrlInput, 120, fileName);
    }
  };

  const startAnalysis = () => {
    setAnalyzingBenchmark(true);
    setTimeout(() => {
      setBenchmarkAnalysis({
        cutPoints: [
          { time: 3.2, type: '场景切换' },
          { time: 7.8, type: '节奏转折点' },
          { time: 12.5, type: '黄金分割点' }
        ],
        rhythmData: [
          { time: 0, intensity: 0.3 },
          { time: 5, intensity: 0.5 },
          { time: 10, intensity: 0.7 }
        ],
        subtitleStyle: {
          fontSize: 28,
          fontFamily: 'system-ui',
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.75)',
          position: 'bottom'
        },
        transitions: ['淡入淡出', '硬切'],
        tips: ['开头3秒用痛点式切入', '每3-5秒一个信息点']
      });
      setAnalyzingBenchmark(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
            <span className="gradient-text">对标视频分析</span>
          </h1>
          <p className="text-gray-400 text-lg">上传对标视频，让 AI 分析它的剪辑技巧</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            {!benchmarkUrl ? (
              <div className="glass-card rounded-3xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">上传对标视频</h2>
                  <p className="text-gray-400">选择或拖放您想要学习的视频</p>
                </div>

                <div className="space-y-6">
                  <div className="upload-zone rounded-2xl p-10 text-center cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processBenchmarkFile(file);
                      }}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-gray-200 text-lg font-medium">拖放视频文件到这里</p>
                        <p className="text-gray-500 text-sm mt-1">或点击选择文件</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                    <span className="text-gray-500 text-sm">或通过链接导入</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                  </div>

                  <form onSubmit={handleUrlSubmit} className="space-y-3">
                    <div className="relative">
                      <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={benchmarkVideoUrlInput}
                        onChange={(e) => setBenchmarkVideoUrlInput(e.target.value)}
                        placeholder="粘贴对标视频链接地址..."
                        className="input-field w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!benchmarkVideoUrlInput.trim()}
                      className="w-full py-4 bg-dark-700 hover:bg-dark-600 rounded-xl font-medium text-gray-200 transition-all disabled:opacity-50"
                    >
                      从链接导入
                    </button>
                  </form>
                </div>
              </div>
            ) : !benchmarkAnalysis ? (
              <div className="glass-card rounded-3xl p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-dark-800/50 rounded-2xl overflow-hidden">
                    <video ref={videoRef1} src={videoUrl} className="w-full aspect-video object-cover bg-black" />
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl overflow-hidden border border-primary/20">
                    <video ref={videoRef2} src={benchmarkUrl} className="w-full aspect-video object-cover bg-black" />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={startAnalysis}
                    disabled={isAnalyzingBenchmark}
                    className="px-10 py-5 btn-primary rounded-2xl font-semibold text-lg text-white flex items-center gap-3 disabled:opacity-50"
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
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                    剪辑技巧分析报告
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-dark-800/50 rounded-xl p-5">
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        关键剪辑点
                      </h4>
                      <div className="space-y-2">
                        {benchmarkAnalysis.cutPoints.map((point, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                            <span className="text-gray-400 font-mono">{formatTime(point.time)}</span>
                            <span className="text-primary text-sm font-medium">{point.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-dark-800/50 rounded-xl p-5">
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-secondary" />
                        节奏强度曲线
                      </h4>
                      <div className="h-28 flex items-end gap-1">
                        {benchmarkAnalysis.rhythmData.map((data, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t"
                            style={{ height: `${data.intensity * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-secondary" />
                      剪辑建议
                    </h4>
                    <div className="space-y-3">
                      {benchmarkAnalysis.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-dark-800/50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          </div>
                          <p className="text-gray-300">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/editor')}
                  className="w-full py-5 btn-secondary rounded-2xl font-semibold text-lg text-white flex items-center justify-center gap-3"
                >
                  应用技巧并继续
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {benchmarkAnalysis && (
            <div className="lg:col-span-1">
              <div className="glass-card rounded-3xl p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  应用对标技巧
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">应用剪辑点</p>
                        <p className="text-xs text-gray-500">自动识别最佳剪辑位置</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateBenchmarkApplySettings({ applyCutPoints: !applyBenchmarkCutPoints })}
                      className="w-14 h-8 rounded-full transition-all relative"
                      style={{
                        background: applyBenchmarkCutPoints ? 'linear-gradient(135deg, #6366F1, #F97316)' : '#374151'
                      }}
                    >
                      <div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full transition-all"
                        style={{
                          left: applyBenchmarkCutPoints ? '28px' : '4px'
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">应用节奏模式</p>
                        <p className="text-xs text-gray-500">匹配视频节奏曲线</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateBenchmarkApplySettings({ applyRhythm: !applyBenchmarkRhythm })}
                      className="w-14 h-8 rounded-full transition-all relative"
                      style={{
                        background: applyBenchmarkRhythm ? 'linear-gradient(135deg, #6366F1, #F97316)' : '#374151'
                      }}
                    >
                      <div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full transition-all"
                        style={{
                          left: applyBenchmarkRhythm ? '28px' : '4px'
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Type className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">应用字幕风格</p>
                        <p className="text-xs text-gray-500">字体大小和位置</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateBenchmarkApplySettings({ applySubtitleStyle: !applyBenchmarkSubtitleStyle })}
                      className="w-14 h-8 rounded-full transition-all relative"
                      style={{
                        background: applyBenchmarkSubtitleStyle ? 'linear-gradient(135deg, #6366F1, #F97316)' : '#374151'
                      }}
                    >
                      <div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full transition-all"
                        style={{
                          left: applyBenchmarkSubtitleStyle ? '28px' : '4px'
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Video className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">应用转场效果</p>
                        <p className="text-xs text-gray-500">匹配转场方式</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateBenchmarkApplySettings({ applyTransitions: !applyBenchmarkTransitions })}
                      className="w-14 h-8 rounded-full transition-all relative"
                      style={{
                        background: applyBenchmarkTransitions ? 'linear-gradient(135deg, #6366F1, #F97316)' : '#374151'
                      }}
                    >
                      <div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full transition-all"
                        style={{
                          left: applyBenchmarkTransitions ? '28px' : '4px'
                        }}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        💡 建议首次尝试开启全部选项，效果更佳
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BenchmarkPage;
