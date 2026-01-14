
import React, { useState, useEffect, useMemo } from 'react';
import { Tv, Wifi, WifiOff, Loader2, PlayCircle, AlertCircle, MonitorOff, CloudLightning } from 'lucide-react';
import { MediaAsset, Playlist } from '../types';

interface Props {
  isPaired: boolean;
  pairingCode: string;
  currentPlaylist: Playlist | null;
  assets: MediaAsset[];
  onExit: () => void;
}

const Player: React.FC<Props> = ({ isPaired, pairingCode, currentPlaylist, assets, onExit }) => {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitorar mudanças na playlist para resetar o loop
  useEffect(() => {
    if (isPaired && currentPlaylist && currentPlaylist.items.length > 0) {
      setCurrentAssetIndex(0);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [currentPlaylist?.id, isPaired]);

  // Lógica de Troca de Mídia
  useEffect(() => {
    if (isPaired && currentPlaylist && currentPlaylist.items.length > 0 && !loading) {
      const currentItem = currentPlaylist.items[currentAssetIndex];
      const duration = (currentItem?.duration || 10) * 1000;

      const timer = setTimeout(() => {
        setCurrentAssetIndex((prev) => {
           const next = prev + 1;
           return next >= currentPlaylist.items.length ? 0 : next;
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [currentAssetIndex, currentPlaylist, isPaired, loading]);

  const currentItem = currentPlaylist?.items[currentAssetIndex];
  const currentAsset = currentItem 
    ? assets.find(a => a.id === currentItem.assetId) 
    : null;

  // Gerencia a URL da mídia (Blob ou URL original)
  const mediaUrl = useMemo(() => {
    if (!currentAsset) return '';
    if (currentAsset.fileBlob) {
      return URL.createObjectURL(currentAsset.fileBlob);
    }
    return currentAsset.url;
  }, [currentAsset]);

  // Cleanup dos Object URLs
  useEffect(() => {
    return () => {
      if (mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);

  if (!isPaired) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center text-white p-10 select-none overflow-hidden font-sans">
        <div className="absolute top-12 left-12 flex items-center gap-4">
          <div className="bg-blue-600 p-3.5 rounded-[1.5rem] shadow-2xl shadow-blue-900/40">
            <Tv className="w-12 h-12" />
          </div>
          <div>
            <span className="text-4xl font-black tracking-tighter">VisionFlow</span>
            <div className="text-blue-500 text-sm font-black uppercase tracking-[0.4em]">Terminal Mode</div>
          </div>
        </div>

        <div className="max-w-4xl text-center space-y-16 animate-in fade-in zoom-in duration-1000">
          <div className="space-y-6">
            <h1 className="text-8xl font-black tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent">PAREAMENTO PENDENTE</h1>
            <p className="text-zinc-500 text-3xl font-medium max-w-2xl mx-auto leading-relaxed">
              O VisionFlow detectou este terminal. Use o código abaixo no painel administrativo para vincular esta tela.
            </p>
          </div>
          
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-blue-600/10 blur-[100px] opacity-100" />
            <div className="relative bg-[#121214] border border-zinc-800 p-20 rounded-[5rem] shadow-2xl backdrop-blur-3xl">
              <div className="text-9xl font-mono font-black tracking-[0.3em] text-blue-500">
                {pairingCode}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-10 pt-12">
            <div className="flex items-center gap-4 text-emerald-400 bg-emerald-400/10 px-8 py-4 rounded-[2rem] border border-emerald-400/20">
              <CloudLightning className="w-6 h-6 animate-pulse" />
              <span className="font-black text-lg uppercase tracking-widest">Sincronismo Habilitado</span>
            </div>
            <button 
              onClick={onExit} 
              className="text-zinc-600 hover:text-red-400 transition-all font-bold text-lg flex items-center gap-2 group"
            >
              <MonitorOff className="w-6 h-6 group-hover:rotate-12" />
              Sair do Modo TV
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden cursor-none select-none">
      {/* Indicador de Conexão */}
      {!isOnline && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-6 py-2.5 rounded-full flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce">
          <WifiOff className="w-4 h-4" />
          Modo Offline Ativo - Executando via VisionDB
        </div>
      )}

      {loading ? (
        <div className="h-full flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-28 h-28 border-[6px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
            <Loader2 className="w-10 h-10 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white font-black uppercase tracking-[0.5em] text-xl">Lendo Dados Locais</p>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Acessando mídias persistidas no dispositivo...</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full group">
          {currentAsset ? (
            <div 
              key={`${currentPlaylist?.id}-${currentAssetIndex}`} 
              className="h-full w-full animate-in fade-in zoom-in-105 duration-1000 ease-out"
            >
              {currentAsset.type === 'image' ? (
                <img src={mediaUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <video src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              )}
              
              <div className="absolute top-10 right-10 flex items-center gap-4 bg-black/80 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]' : 'bg-zinc-600'}`} />
                 <div className="flex flex-col">
                    <span className="text-white font-black text-sm uppercase tracking-widest leading-none">{currentPlaylist?.name}</span>
                    <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-tighter mt-1">
                      {isOnline ? 'Sincronizado Cloud' : 'Executando Local (VisionDB)'}
                    </span>
                 </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/5 z-50">
                 <div 
                   key={`progress-${currentAssetIndex}`}
                   className="h-full bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.8)]"
                   style={{ 
                     animation: `progress-bar ${currentItem?.duration}s linear forwards` 
                   }} 
                 />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-800 animate-pulse">
               <AlertCircle className="w-32 h-32 opacity-20 mb-6" />
               <p className="font-black uppercase tracking-[0.8em] text-2xl">Aguardando Programação</p>
               <p className="text-zinc-900 mt-2 font-black uppercase text-sm">O player está pronto, mas não há playlist atribuída no DB.</p>
            </div>
          )}
          
          <button 
            onClick={onExit} 
            className="absolute bottom-10 left-10 w-16 h-16 rounded-[2rem] bg-black/60 text-white/40 hover:bg-white hover:text-black flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-[100] border border-white/5"
          >
            <MonitorOff className="w-6 h-6" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Player;
