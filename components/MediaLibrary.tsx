
import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Trash2, 
  Maximize2, 
  Zap,
  Info,
  CheckCircle2,
  Loader2,
  HardDrive
} from 'lucide-react';
import { MediaAsset } from '../types';
import { analyzeMedia } from '../services/gemini';
import { db } from '../services/db';

interface Props {
  assets: MediaAsset[];
  setAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>>;
}

const MediaLibrary: React.FC<Props> = ({ assets, setAssets }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newAsset: MediaAsset = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.includes('image') ? 'image' : 'video',
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        resolution: 'Full HD',
        uploadedAt: new Date().toISOString(),
        fileBlob: file // Salvando o arquivo binário real
      };
      
      await db.save('assets', newAsset);
      setAssets(prev => [newAsset, ...prev]);
      new BroadcastChannel('visionflow_global_sync').postMessage({ type: 'DB_UPDATE_NEEDED' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async (asset: MediaAsset) => {
    if (asset.type !== 'image') return;
    setAnalyzingId(asset.id);
    const result = await analyzeMedia(asset.url, asset.name);
    if (result) {
      const updated = { ...asset, aiMetadata: result };
      await db.save('assets', updated);
      setAssets(prev => prev.map(a => a.id === asset.id ? updated : a));
      if (selectedAsset?.id === asset.id) setSelectedAsset(updated);
      new BroadcastChannel('visionflow_global_sync').postMessage({ type: 'DB_UPDATE_NEEDED' });
    }
    setAnalyzingId(null);
  };

  const removeAsset = async (id: string) => {
    if (confirm("Deseja remover este arquivo permanentemente do banco local?")) {
      await db.delete('assets', id);
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAsset?.id === id) setSelectedAsset(null);
      new BroadcastChannel('visionflow_global_sync').postMessage({ type: 'DB_UPDATE_NEEDED' });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca Local</h1>
          <p className="text-zinc-500 mt-1">Gerencie arquivos persistidos no banco de dados local (Offline Ready).</p>
        </div>
        <label className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-lg shadow-blue-900/20 font-bold ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span>{isUploading ? 'Armazenando...' : 'Subir Arquivo'}</span>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                onClick={() => setSelectedAsset(asset)}
                className={`group relative bg-[#121214] border rounded-2xl overflow-hidden cursor-pointer transition-all ${
                  selectedAsset?.id === asset.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="aspect-video bg-zinc-900 overflow-hidden relative">
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                      <Video className="w-8 h-8 text-zinc-600" />
                      <span className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Vídeo Offline</span>
                    </div>
                  )}
                  {asset.aiMetadata && (
                    <div className="absolute top-2 right-2 bg-emerald-500/90 text-white p-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black">{asset.size}</p>
                  </div>
                  <HardDrive className="w-4 h-4 text-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 sticky top-8 shadow-xl">
            {selectedAsset ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Informações do Ativo</h3>
                  <button onClick={() => removeAsset(selectedAsset.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="aspect-video rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800">
                   {selectedAsset.type === 'image' ? (
                    <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-full object-contain" />
                  ) : (
                    <video src={selectedAsset.url} controls className="w-full h-full" />
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <DetailRow label="ID Local" value={selectedAsset.id} />
                  <DetailRow label="Resolução" value={selectedAsset.resolution} />
                  <DetailRow label="Persistência" value={selectedAsset.fileBlob ? 'Binário Local' : 'MOCK URL'} />
                </div>

                {selectedAsset.aiMetadata ? (
                  <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Gemini AI Insights</span>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Legibilidade</span>
                        <span className="text-[10px] font-bold">{selectedAsset.aiMetadata.readabilityScore}%</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${selectedAsset.aiMetadata.readabilityScore}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.aiMetadata.tags.map(tag => (
                        <span key={tag} className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md text-[10px] font-bold">#{tag.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button 
                    disabled={analyzingId === selectedAsset.id || selectedAsset.type !== 'image'}
                    onClick={() => handleAnalyze(selectedAsset)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600/10 text-blue-500 py-3 rounded-xl transition-all disabled:opacity-50 border border-blue-500/20 font-bold text-xs"
                  >
                    {analyzingId === selectedAsset.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>{analyzingId === selectedAsset.id ? 'Analisando...' : 'Analisar com Gemini'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-zinc-600 text-center px-6">
                <Maximize2 className="w-16 h-16 mb-6 opacity-10" />
                <p className="text-sm font-medium">Selecione uma mídia para gerenciar o armazenamento offline.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-zinc-500 uppercase font-bold tracking-tighter text-[10px]">{label}</span>
    <span className="font-medium text-zinc-400 max-w-[120px] truncate">{value}</span>
  </div>
);

export default MediaLibrary;
