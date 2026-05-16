import { create } from 'zustand';

export interface VideoSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  confidence: number;
  isSilence?: boolean;
  isMistake?: boolean;
  isRemoved?: boolean;
}

export interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
}

export interface BenchmarkAnalysis {
  cutPoints: Array<{ time: number; type: string }>;
  rhythmData: Array<{ time: number; intensity: number }>;
  subtitleStyle: SubtitleStyle;
  transitions: string[];
  tips: string[];
}

export interface VideoState {
  videoId: string | null;
  videoFile: File | null;
  videoUrl: string | null;
  localVideoPath: string | null; // 下载到本地的视频路径
  duration: number;
  fileName: string;
  segments: VideoSegment[];
  isAnalyzing: boolean;
  isProcessing: boolean;
  isDownloading: boolean; // 下载状态
  downloadProgress: number; // 下载进度
  currentStep: number;
  
  // 对标视频相关
  benchmarkId: string | null;
  benchmarkFile: File | null;
  benchmarkUrl: string | null;
  benchmarkDuration: number;
  benchmarkFileName: string;
  isAnalyzingBenchmark: boolean;
  benchmarkAnalysis: BenchmarkAnalysis | null;
  applyBenchmarkCutPoints: boolean;
  applyBenchmarkRhythm: boolean;
  applyBenchmarkSubtitleStyle: boolean;
  applyBenchmarkTransitions: boolean;

  setVideo: (file: File, url: string, duration: number, fileName: string) => void;
  setLocalVideoPath: (localPath: string) => void;
  setDownloading: (isDownloading: boolean) => void;
  setDownloadProgress: (progress: number) => void;
  setSegments: (segments: VideoSegment[]) => void;
  toggleSegment: (id: number) => void;
  setAnalyzing: (value: boolean) => void;
  setProcessing: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
  
  // 对标视频方法
  setBenchmark: (file: File | null, url: string | null, duration: number, fileName: string) => void;
  resetBenchmark: () => void;
  setBenchmarkAnalysis: (analysis: BenchmarkAnalysis) => void;
  setAnalyzingBenchmark: (value: boolean) => void;
  updateBenchmarkApplySettings: (settings: Partial<{
    applyCutPoints: boolean;
    applyRhythm: boolean;
    applySubtitleStyle: boolean;
    applyTransitions: boolean;
  }>) => void;
  
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoId: null,
  videoFile: null,
  videoUrl: null,
  localVideoPath: null, // 本地视频路径
  duration: 0,
  fileName: '',
  segments: [],
  isAnalyzing: false,
  isProcessing: false,
  isDownloading: false, // 下载状态
  downloadProgress: 0, // 下载进度
  currentStep: 0,
  
  // 对标视频相关状态
  benchmarkId: null,
  benchmarkFile: null,
  benchmarkUrl: null,
  benchmarkDuration: 0,
  benchmarkFileName: '',
  isAnalyzingBenchmark: false,
  benchmarkAnalysis: null,
  applyBenchmarkCutPoints: true,
  applyBenchmarkRhythm: true,
  applyBenchmarkSubtitleStyle: true,
  applyBenchmarkTransitions: true,

  setVideo: (file, url, duration, fileName) => set({
    videoFile: file,
    videoUrl: url,
    duration,
    fileName,
    videoId: Date.now().toString(),
  }),

  setLocalVideoPath: (localPath: string) => set({ localVideoPath: localPath }),
  setDownloading: (isDownloading: boolean) => set({ isDownloading }),
  setDownloadProgress: (progress: number) => set({ downloadProgress: progress }),

  setSegments: (segments) => set({ segments }),

  toggleSegment: (id) => set((state) => ({
    segments: state.segments.map(s =>
      s.id === id ? { ...s, isRemoved: !s.isRemoved } : s
    ),
  })),

  setAnalyzing: (value) => set({ isAnalyzing: value }),
  setProcessing: (value) => set({ isProcessing: value }),
  setCurrentStep: (step) => set({ currentStep: step }),
  
  // 对标视频方法
  setBenchmark: (file, url, duration, fileName) => set({
    benchmarkFile: file,
    benchmarkUrl: url,
    benchmarkDuration: duration,
    benchmarkFileName: fileName,
    benchmarkId: file || url ? Date.now().toString() : null,
  }),

  resetBenchmark: () => set({
    benchmarkId: null,
    benchmarkFile: null,
    benchmarkUrl: null,
    benchmarkDuration: 0,
    benchmarkFileName: '',
    isAnalyzingBenchmark: false,
    benchmarkAnalysis: null,
  }),

  setBenchmarkAnalysis: (analysis) => set({ benchmarkAnalysis: analysis }),
  setAnalyzingBenchmark: (value) => set({ isAnalyzingBenchmark: value }),

  updateBenchmarkApplySettings: (settings) => set((state) => ({
    applyBenchmarkCutPoints: settings.applyCutPoints ?? state.applyBenchmarkCutPoints,
    applyBenchmarkRhythm: settings.applyRhythm ?? state.applyBenchmarkRhythm,
    applyBenchmarkSubtitleStyle: settings.applySubtitleStyle ?? state.applyBenchmarkSubtitleStyle,
    applyBenchmarkTransitions: settings.applyTransitions ?? state.applyBenchmarkTransitions,
  })),

  reset: () => set({
    videoId: null,
    videoFile: null,
    videoUrl: null,
    localVideoPath: null, // 重置本地视频路径
    duration: 0,
    fileName: '',
    segments: [],
    isAnalyzing: false,
    isProcessing: false,
    isDownloading: false, // 重置下载状态
    downloadProgress: 0, // 重置下载进度
    currentStep: 0,
    benchmarkId: null,
    benchmarkFile: null,
    benchmarkUrl: null,
    benchmarkDuration: 0,
    benchmarkFileName: '',
    isAnalyzingBenchmark: false,
    benchmarkAnalysis: null,
    applyBenchmarkCutPoints: true,
    applyBenchmarkRhythm: true,
    applyBenchmarkSubtitleStyle: true,
    applyBenchmarkTransitions: true,
  }),
}));
