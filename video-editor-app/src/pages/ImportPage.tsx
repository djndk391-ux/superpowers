import { useState } from 'react';
import { Upload, X, FileVideo, Sparkles, Link, Video, ArrowRight, Zap, TrendingUp, Play } from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

const ImportPage = () => {
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [benchmarkVideoUrlInput, setBenchmarkVideoUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleUrlSubmit = async (e: React.FormEvent, type: 'main' | 'benchmark', url: string) => {
    e.preventDefault();
    if (url.trim()) {
      setUploadProgress(0);
      
      try {
        // 调用后端API下载视频
        const response = await fetch('/api/download/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url.trim() }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          // 下载成功，使用本地路径
          const localPath = result.data.filePath;
          const fileName = result.data.fileName;
          
          // 模拟加载进度
          for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          // 构建本地视频URL
          const videoUrl = localPath;

          if (type === 'main') {
            // 获取视频时长
            const video = document.createElement('video');
            video.src = videoUrl;
            video.onloadedmetadata = () => {
              setVideo(null as any, videoUrl, video.duration, fileName);
            };
            video.onerror = () => {
              // 如果无法加载，使用默认时长
              setVideo(null as any, videoUrl, 120, fileName);
            };
          } else {
            setBenchmark(null as any, videoUrl, 120, fileName);
          }
        } else {
          alert(`下载失败: ${result.error || '未知错误'}`);
          setUploadProgress(0);
        }
      } catch (error) {
        console.error('下载错误:', error);
        alert('下载失败，请检查网络连接');
        setUploadProgress(0);
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl floating"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-secondary/15 rounded-full blur-3xl floating" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-primary/15 rounded-full blur-3xl floating" style={{ animationDelay: '-6s' }}></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm text-primary/80 font-medium">AI 驱动的智能剪辑</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-orbitron font-extrabold mb-6">
            <span className="gradient-text">AI 视频剪辑</span>
            <br />
            <span className="text-white">智能体</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            选择您的剪辑方式，让 AI 帮您快速制作高质量短视频
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8 card-hover">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center pulse-glow">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">直接剪辑</h2>
                  <p className="text-gray-400 mt-1">快速剪辑，适合有经验的创作者</p>
                </div>
              </div>

              {!videoUrl ? (
                <div className="space-y-6">
                  <div
                    className={`relative upload-zone rounded-2xl p-10 text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const files = Array.from(e.dataTransfer.files);
                      const videoFile = files.find(f => f.type.startsWith('video/'));
                      if (videoFile) {
                        processFile(videoFile, 'main');
                      }
                    }}
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
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-gray-200 text-lg font-medium">拖放视频文件到这里</p>
                        <p className="text-gray-500 text-sm mt-1">或点击选择文件</p>
                        <p className="text-gray-600 text-xs mt-2">支持 MP4 · MOV · WEBM</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                    <span className="text-gray-500 text-sm">或通过链接导入</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                  </div>

                  <form onSubmit={(e) => handleUrlSubmit(e, 'main', mainVideoUrl)} className="space-y-3">
                    <div className="relative">
                      <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={mainVideoUrl}
                        onChange={(e) => setMainVideoUrl(e.target.value)}
                        placeholder="粘贴视频链接地址..."
                        className="input-field w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!mainVideoUrl.trim()}
                      className="w-full py-4 bg-dark-700 hover:bg-dark-600 rounded-xl font-medium text-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Link className="w-5 h-5" />
                      从链接导入
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-dark-800/50 rounded-2xl">
                    <div className="w-24 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Video className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{fileName}</h3>
                      {uploadProgress < 100 ? (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400">正在处理...</span>
                            <span className="text-primary font-medium">{uploadProgress}%</span>
                          </div>
                          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div
                              className="progress-bar h-full rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-green-400 text-sm font-medium">准备就绪</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => useVideoStore.getState().reset()}
                      className="p-2 hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {videoUrl && uploadProgress >= 100 && (
              <button
                onClick={() => navigate('/editor')}
                className="w-full py-5 btn-primary rounded-2xl font-semibold text-lg text-white flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                开始剪辑
                <ArrowRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 border border-primary/20 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">对标视频剪辑</h2>
                    <p className="text-gray-400 mt-1">学习爆款视频的剪辑技巧</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-dark-800/40 rounded-2xl p-6 border border-dark-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">1</div>
                      <h3 className="font-medium text-white">上传您的视频</h3>
                    </div>
                    
                    {!videoUrl ? (
                      <div className="space-y-4">
                        <div
                          className="relative upload-zone rounded-xl p-6 text-center cursor-pointer"
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const files = Array.from(e.dataTransfer.files);
                            const videoFile = files.find(f => f.type.startsWith('video/'));
                            if (videoFile) {
                              processFile(videoFile, 'main');
                            }
                          }}
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
                            <Upload className="w-6 h-6 text-gray-400" />
                            <p className="text-gray-300 text-sm">拖放或点击上传</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-dark-700"></div>
                          <span className="text-gray-500 text-xs">或</span>
                          <div className="flex-1 h-px bg-dark-700"></div>
                        </div>

                        <form onSubmit={(e) => handleUrlSubmit(e, 'main', mainVideoUrl)} className="space-y-2">
                          <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="url"
                              value={mainVideoUrl}
                              onChange={(e) => setMainVideoUrl(e.target.value)}
                              placeholder="粘贴视频链接..."
                              className="input-field w-full pl-10 pr-3 py-2.5 rounded-lg text-white text-sm placeholder-gray-500"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={!mainVideoUrl.trim()}
                            className="w-full py-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm font-medium text-gray-200 transition-all disabled:opacity-50"
                          >
                            导入链接
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-xl">
                        <div className="w-14 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{fileName}</p>
                          {uploadProgress >= 100 && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-green-400 text-xs">已就绪</span>
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
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-6 h-px bg-gray-600"></div>
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      <div className="w-6 h-px bg-gray-600"></div>
                    </div>
                  </div>

                  <div className="bg-dark-800/40 rounded-2xl p-6 border border-dark-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary">2</div>
                      <h3 className="font-medium text-white">上传对标视频</h3>
                    </div>
                    
                    {!benchmarkUrl ? (
                      <div className="space-y-4">
                        <div
                          className="relative upload-zone rounded-xl p-6 text-center cursor-pointer"
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const files = Array.from(e.dataTransfer.files);
                            const videoFile = files.find(f => f.type.startsWith('video/'));
                            if (videoFile) {
                              processFile(videoFile, 'benchmark');
                            }
                          }}
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
                            <Sparkles className="w-6 h-6 text-gray-400" />
                            <p className="text-gray-300 text-sm">拖放或点击上传</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-dark-700"></div>
                          <span className="text-gray-500 text-xs">或</span>
                          <div className="flex-1 h-px bg-dark-700"></div>
                        </div>

                        <form onSubmit={(e) => handleUrlSubmit(e, 'benchmark', benchmarkVideoUrlInput)} className="space-y-2">
                          <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="url"
                              value={benchmarkVideoUrlInput}
                              onChange={(e) => setBenchmarkVideoUrlInput(e.target.value)}
                              placeholder="粘贴对标视频链接..."
                              className="input-field w-full pl-10 pr-3 py-2.5 rounded-lg text-white text-sm placeholder-gray-500"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={!benchmarkVideoUrlInput.trim()}
                            className="w-full py-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm font-medium text-gray-200 transition-all disabled:opacity-50"
                          >
                            导入链接
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-xl">
                        <div className="w-14 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{benchmarkFileName}</p>
                          {uploadProgress >= 100 && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-green-400 text-xs">已就绪</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => resetBenchmark()}
                          className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {videoUrl && benchmarkUrl && uploadProgress >= 100 && (
                  <button
                    onClick={() => navigate('/benchmark')}
                    className="w-full py-5 mt-8 btn-secondary rounded-2xl font-semibold text-lg text-white flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-6 h-6" />
                    分析对标视频
                    <ArrowRight className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
