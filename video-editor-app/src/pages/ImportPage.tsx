import { useState } from 'react';
import { Upload, X, FileVideo, Sparkles, Link, Video, ArrowRight } from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

const ImportPage = () => {
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [benchmarkVideoUrlInput, setBenchmarkVideoUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { setVideo, setBenchmark, resetBenchmark, videoUrl, fileName, benchmarkUrl, benchmarkFileName } = useVideoStore();
  const navigate = useNavigate();

  const processFile = (file: File, type: 'main' | 'benchmark') => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        if (type === 'main') {
          setVideo(file, url, video.duration, file.name);
        } else {
          setBenchmark(file, url, video.duration, file.name);
        }
      };
    }, 2000);
  };

  const handleUrlSubmit = (e: React.FormEvent, type: 'main' | 'benchmark', url: string) => {
    e.preventDefault();
    if (url.trim()) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      setTimeout(() => {
        const fileName = url.split('/').pop() || `video-${Date.now()}`;
        if (type === 'main') {
          setVideo(null as any, url, 120, fileName);
        } else {
          setBenchmark(null as any, url, 120, fileName);
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-space">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            AI 视频剪辑智能体
          </h1>
          <p className="text-gray-400 text-lg">
            选择您的剪辑方式，上传视频后开始创作
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* 左侧：直接剪辑 */}
          <div className="space-y-4">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-primary to-secondary rounded-xl">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">直接剪辑</h3>
                  <p className="text-gray-400 text-xs">快速剪辑，AI 帮您自动去除口误和静默</p>
                </div>
              </div>

              {!videoUrl ? (
                <div className="space-y-4">
                  {/* 文件上传区域 */}
                  <div
                    className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 border-dark-700 bg-dark-900/50 hover:border-primary/50"
                  >
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processFile(file, 'main');
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-gray-300 text-sm mb-0.5">拖放视频文件到这里</p>
                        <p className="text-gray-500 text-xs">或点击选择文件（支持 MP4, MOV, WEBM）</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-dark-700" />
                    <span className="text-gray-500 text-xs">或</span>
                    <div className="flex-1 h-px bg-dark-700" />
                  </div>

                  {/* URL 上传 */}
                  <form onSubmit={(e) => handleUrlSubmit(e, 'main', mainVideoUrl)} className="space-y-2">
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="url"
                        value={mainVideoUrl}
                        onChange={(e) => setMainVideoUrl(e.target.value)}
                        placeholder="粘贴视频链接地址"
                        className="w-full pl-10 pr-3 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!mainVideoUrl.trim()}
                      className="w-full py-2.5 bg-dark-700 rounded-lg text-sm font-medium hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      从链接导入
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-14 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{fileName}</h4>
                      {uploadProgress < 100 ? (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">处理中...</span>
                            <span className="text-primary">{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1.5 text-green-400 text-xs">
                          <div className="w-4 h-4 border-2 border-green-400 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          </div>
                          <span>准备就绪</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => useVideoStore.getState().reset()}
                      className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {videoUrl && uploadProgress >= 100 && (
              <button
                onClick={() => navigate('/editor')}
                className="w-full py-4 bg-dark-700 rounded-xl font-medium text-lg hover:bg-dark-600 transition-all flex items-center justify-center gap-2"
              >
                开始剪辑
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 右侧：对标视频剪辑 */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-primary to-secondary rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">对标视频剪辑</h3>
                  <p className="text-gray-400 text-xs">学习爆款视频的剪辑技巧</p>
                </div>
              </div>

              {/* 上传您的视频 */}
              <div className="bg-dark-800/50 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3">1️⃣ 上传您的视频</h4>
                {!videoUrl ? (
                  <div className="space-y-4">
                    <div
                      className="relative border-2 border-dashed rounded-xl p-5 text-center transition-all duration-300 border-dark-700 bg-dark-900/50 hover:border-primary/50"
                    >
                      <input
                        type="file"
                        accept="video/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processFile(file, 'main');
                        }}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-7 h-7 text-gray-400" />
                        <div>
                          <p className="text-gray-300 text-xs mb-0.5">拖放视频文件</p>
                          <p className="text-gray-500 text-xs">或点击选择文件</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-dark-700" />
                      <span className="text-gray-500 text-xs">或</span>
                      <div className="flex-1 h-px bg-dark-700" />
                    </div>

                    <form onSubmit={(e) => handleUrlSubmit(e, 'main', mainVideoUrl)} className="space-y-2">
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="url"
                          value={mainVideoUrl}
                          onChange={(e) => setMainVideoUrl(e.target.value)}
                          placeholder="粘贴视频链接"
                          className="w-full pl-10 pr-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!mainVideoUrl.trim()}
                        className="w-full py-2 bg-dark-700 rounded-lg text-xs font-medium hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        从链接导入
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-16 h-12 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs truncate">{fileName}</h4>
                        {uploadProgress >= 100 && (
                          <div className="flex items-center gap-1 mt-1 text-green-400 text-xs">
                            <div className="w-3.5 h-3.5 border-2 border-green-400 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-green-400 rounded-full" />
                            </div>
                            <span>准备就绪</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => useVideoStore.getState().reset()}
                        className="p-1 hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="w-5 h-px bg-gray-600" />
                  <span className="text-xs">+</span>
                  <div className="w-5 h-px bg-gray-600" />
                </div>
              </div>

              {/* 上传对标视频 */}
              <div className="bg-dark-800/50 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3">2️⃣ 上传对标视频</h4>
                {!benchmarkUrl ? (
                  <div className="space-y-4">
                    <div
                      className="relative border-2 border-dashed rounded-xl p-5 text-center transition-all duration-300 border-dark-700 bg-dark-900/50 hover:border-primary/50"
                    >
                      <input
                        type="file"
                        accept="video/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processFile(file, 'benchmark');
                        }}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="w-7 h-7 text-gray-400" />
                        <div>
                          <p className="text-gray-300 text-xs mb-0.5">拖放对标视频文件</p>
                          <p className="text-gray-500 text-xs">或点击选择文件</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-dark-700" />
                      <span className="text-gray-500 text-xs">或</span>
                      <div className="flex-1 h-px bg-dark-700" />
                    </div>

                    <form onSubmit={(e) => handleUrlSubmit(e, 'benchmark', benchmarkVideoUrlInput)} className="space-y-2">
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="url"
                          value={benchmarkVideoUrlInput}
                          onChange={(e) => setBenchmarkVideoUrlInput(e.target.value)}
                          placeholder="粘贴对标视频链接"
                          className="w-full pl-10 pr-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!benchmarkVideoUrlInput.trim()}
                        className="w-full py-2 bg-dark-700 rounded-lg text-xs font-medium hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        从链接导入
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-16 h-12 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs truncate">{benchmarkFileName}</h4>
                        {uploadProgress >= 100 && (
                          <div className="flex items-center gap-1 mt-1 text-green-400 text-xs">
                            <div className="w-3.5 h-3.5 border-2 border-green-400 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-green-400 rounded-full" />
                            </div>
                            <span>准备就绪</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => resetBenchmark()}
                        className="p-1 hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {videoUrl && benchmarkUrl && uploadProgress >= 100 && (
                <button
                  onClick={() => navigate('/benchmark')}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  分析对标视频
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
