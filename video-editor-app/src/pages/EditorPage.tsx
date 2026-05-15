import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Scissors,
  Eye,
  EyeOff,
  Zap,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useVideoStore, VideoSegment } from '../store';
import { useNavigate } from 'react-router-dom';

const EditorPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const {
    videoUrl,
    duration,
    segments,
    setSegments,
    toggleSegment,
    isAnalyzing,
    setAnalyzing,
    benchmarkAnalysis,
    benchmarkFileName,
  } = useVideoStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoUrl) {
      navigate('/');
      return;
    }

    if (segments.length === 0) {
      startAnalysis();
    }
  }, [videoUrl, segments.length]);

  const startAnalysis = () => {
    setAnalyzing(true);
    
    setTimeout(() => {
      const mockSegments: VideoSegment[] = [
        {
          id: 1,
          start: 0,
          end: 3.2,
          text: '大家好，欢迎来到我的频道...',
          confidence: 0.98,
          isSilence: false,
        },
        {
          id: 2,
          start: 3.2,
          end: 4.5,
          text: '...',
          confidence: 0.3,
          isSilence: true,
          isRemoved: true,
        },
        {
          id: 3,
          start: 4.5,
          end: 8.3,
          text: '今天我们来聊一下AI视频剪辑这个话题',
          confidence: 0.95,
        },
        {
          id: 4,
          start: 8.3,
          end: 9.1,
          text: '呃...',
          confidence: 0.7,
          isMistake: true,
          isRemoved: true,
        },
        {
          id: 5,
          start: 9.1,
          end: 15.2,
          text: '首先，我们需要准备一段口播视频素材',
          confidence: 0.96,
        },
        {
          id: 6,
          start: 15.2,
          end: 16.5,
          text: '那个...',
          confidence: 0.5,
          isMistake: true,
          isRemoved: true,
        },
        {
          id: 7,
          start: 16.5,
          end: 22.8,
          text: '然后AI会自动识别并剪辑掉口误和静默片段',
          confidence: 0.97,
        },
        {
          id: 8,
          start: 22.8,
          end: 28.5,
          text: '整个过程只需要几分钟，非常高效',
          confidence: 0.94,
        },
      ];
      setSegments(mockSegments);
      setAnalyzing(false);
    }, 3000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const getSegmentStyle = (segment: VideoSegment) => {
    if (segment.isRemoved) {
      return 'bg-gray-600 opacity-50';
    }
    if (segment.isSilence) {
      return 'bg-blue-500/30';
    }
    if (segment.isMistake) {
      return 'bg-red-500/30';
    }
    return 'bg-primary/30';
  };

  const getSegmentIcon = (segment: VideoSegment) => {
    if (segment.isRemoved) return <EyeOff className="w-4 h-4" />;
    if (segment.isSilence) return <Trash2 className="w-4 h-4 text-blue-400" />;
    if (segment.isMistake) return <Scissors className="w-4 h-4 text-red-400" />;
    return <Eye className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-space">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-orbitron font-bold">智能剪辑</h1>
                {benchmarkAnalysis && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl border border-primary/30">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="text-sm">已应用对标视频剪辑技巧</span>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/subtitles')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                下一步：添加字幕
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 bg-dark-800 rounded-2xl overflow-hidden mb-6">
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain bg-black"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>

            <div className="bg-dark-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <button className="p-3 hover:bg-dark-700 rounded-lg transition-colors">
                  <SkipBack className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-4 bg-gradient-to-r from-primary to-secondary rounded-full hover:shadow-lg transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current" />
                  )}
                </button>
                <button className="p-3 hover:bg-dark-700 rounded-lg transition-colors">
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
              <div className="text-center text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">时间轴</h3>
              <div className="relative h-24 bg-dark-700 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex">
                  {segments.map((segment) => {
                    const width = ((segment.end - segment.start) / duration) * 100;
                    const left = (segment.start / duration) * 100;
                    return (
                      <div
                        key={segment.id}
                        className={`absolute h-full transition-all ${getSegmentStyle(segment)}`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-secondary"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 border-l border-dark-700 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              AI 分析结果
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">AI 正在分析视频...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      segment.isRemoved
                        ? 'bg-dark-700/50 border-dark-600 opacity-60'
                        : 'bg-dark-800 border-dark-700 hover:border-primary/50'
                    }`}
                    onClick={() => toggleSegment(segment.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${segment.isRemoved ? 'text-gray-500' : 'text-primary'}`}>
                        {getSegmentIcon(segment)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${segment.isRemoved ? 'line-through text-gray-500' : ''}`}>
                          {segment.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{formatTime(segment.start)}</span>
                          <span>-</span>
                          <span>{formatTime(segment.end)}</span>
                          {segment.isSilence && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                              静默
                            </span>
                          )}
                          {segment.isMistake && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                              口误
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-dark-700">
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">原始时长</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400">剪辑后时长</span>
                <span className="text-green-400">
                  {formatTime(
                    segments
                      .filter(s => !s.isRemoved)
                      .reduce((acc, s) => acc + (s.end - s.start), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-400">已移除片段</span>
                <span className="text-secondary">
                  {segments.filter(s => s.isRemoved).length} 个
                </span>
              </div>
              {benchmarkAnalysis && (
                <div className="p-3 bg-dark-700/50 rounded-lg text-xs text-gray-400">
                  <p className="mb-1">📌 对标视频剪辑技巧已应用</p>
                  <p className="text-gray-500">{benchmarkFileName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
