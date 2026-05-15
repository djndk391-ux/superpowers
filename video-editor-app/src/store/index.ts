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

export interface VideoState {
  videoId: string | null;
  videoFile: File | null;
  videoUrl: string | null;
  duration: number;
  fileName: string;
  segments: VideoSegment[];
  isAnalyzing: boolean;
  isProcessing: boolean;
  currentStep: number;
  
  setVideo: (file: File, url: string, duration: number, fileName: string) => void;
  setSegments: (segments: VideoSegment[]) => void;
  toggleSegment: (id: number) => void;
  setAnalyzing: (value: boolean) => void;
  setProcessing: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoId: null,
  videoFile: null,
  videoUrl: null,
  duration: 0,
  fileName: '',
  segments: [],
  isAnalyzing: false,
  isProcessing: false,
  currentStep: 0,

  setVideo: (file, url, duration, fileName) => set({
    videoFile: file,
    videoUrl: url,
    duration,
    fileName,
    videoId: Date.now().toString(),
  }),

  setSegments: (segments) => set({ segments }),

  toggleSegment: (id) => set((state) => ({
    segments: state.segments.map(s =>
      s.id === id ? { ...s, isRemoved: !s.isRemoved } : s
    ),
  })),

  setAnalyzing: (value) => set({ isAnalyzing: value }),
  setProcessing: (value) => set({ isProcessing: value }),
  setCurrentStep: (step) => set({ currentStep: step }),

  reset: () => set({
    videoId: null,
    videoFile: null,
    videoUrl: null,
    duration: 0,
    fileName: '',
    segments: [],
    isAnalyzing: false,
    isProcessing: false,
    currentStep: 0,
  }),
}));
