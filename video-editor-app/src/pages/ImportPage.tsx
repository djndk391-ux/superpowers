import { useCallback, useState } from 'react';
import { Upload, X, FileVideo, CheckCircle2 } from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

const ImportPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { setVideo, videoUrl, fileName } = useVideoStore();
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(f => f.type.startsWith('video/'));
    if (videoFile) {
      processFile(videoFile);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
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
        setVideo(file, url, video.duration, file.name);
      };
    }, 2000);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-space">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            AI 视频剪辑智能体
          </h1>
          <p className="text-gray-400 text-lg">
            上传您的口播视频，让 AI 帮您完成剪辑
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!videoUrl ? (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-dark-700 bg-dark-800 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <div>
                  <p className="text-xl font-medium mb-2">
                    拖放视频文件到这里
                  </p>
                  <p className="text-gray-400">
                    或点击选择文件（支持 MP4, MOV, WEBM）
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-32 h-20 bg-dark-700 rounded-lg flex items-center justify-center">
                  <FileVideo className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-2">{fileName}</h3>
                  <p className="text-gray-400 mb-4">
                    已准备好进行 AI 分析
                  </p>
                  {uploadProgress < 100 ? (
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-2">
                        <span>处理中...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>准备就绪</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => useVideoStore.getState().reset()}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              {uploadProgress >= 100 && (
                <button
                  onClick={() => navigate('/editor')}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  开始 AI 智能剪辑
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
