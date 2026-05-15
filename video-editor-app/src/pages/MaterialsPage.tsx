import { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useVideoStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface Material {
  id: number;
  type: 'image' | 'video';
  thumbnail: string;
  relevance: number;
  keyword: string;
}

const MaterialsPage = () => {
  const { videoUrl, segments } = useVideoStore();
  const navigate = useNavigate();
  const [isMatching, setIsMatching] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);

  if (!videoUrl) {
    navigate('/');
    return null;
  }

  const handleMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      const mockMaterials: Material[] = [
        {
          id: 1,
          type: 'image',
          thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop',
          relevance: 0.95,
          keyword: 'AI 人工智能',
        },
        {
          id: 2,
          type: 'image',
          thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=200&fit=crop',
          relevance: 0.88,
          keyword: '视频剪辑',
        },
        {
          id: 3,
          type: 'image',
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
          relevance: 0.82,
          keyword: '技术',
        },
        {
          id: 4,
          type: 'image',
          thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop',
          relevance: 0.79,
          keyword: '机器人',
        },
        {
          id: 5,
          type: 'image',
          thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop',
          relevance: 0.75,
          keyword: '未来科技',
        },
        {
          id: 6,
          type: 'image',
          thumbnail: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=200&fit=crop',
          relevance: 0.71,
          keyword: '编程',
        },
      ];
      setMaterials(mockMaterials);
      setIsMatching(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-space">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-orbitron font-bold">AI 素材匹配</h1>
              <button
                onClick={() => navigate('/export')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                下一步：导出视频
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 bg-dark-800 rounded-2xl overflow-hidden mb-6">
              <video
                src={videoUrl}
                className="w-full h-full object-contain bg-black"
              />
            </div>
          </div>
        </div>

        <div className="w-96 border-l border-dark-700 flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              智能素材推荐
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <ImageIcon className="w-16 h-16 text-gray-600" />
                <p className="text-gray-400 text-center">
                  点击下方按钮，AI 会根据视频内容自动匹配相关素材
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={material.thumbnail}
                      alt={material.keyword}
                      className="w-full aspect-video object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span className="text-sm font-medium">{material.keyword}</span>
                      <span className="text-xs text-gray-300">
                        匹配度: {Math.round(material.relevance * 100)}%
                      </span>
                    </div>
                    <button className="absolute top-2 right-2 p-2 bg-dark-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-dark-700">
            <button
              onClick={handleMatch}
              disabled={isMatching}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  匹配素材中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  AI 智能匹配素材
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsPage;
