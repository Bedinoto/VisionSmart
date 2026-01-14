
import React, { useState } from 'react';
import { Playlist, MediaAsset, PlaylistItem, Device } from '../types';
import { 
  Plus, 
  GripVertical, 
  Clock, 
  PlayCircle,
  Search,
  ChevronRight,
  Eye,
  Trash2,
  Save,
  Sparkles,
  Tv,
  Image as ImageIcon,
  Video,
  ArrowRight,
  Loader2,
  ListPlus,
  Calendar,
  Layers
} from 'lucide-react';
import { suggestPlaylistName } from '../services/gemini';

interface Props {
  playlists: Playlist[];
  assets: MediaAsset[];
  devices: Device[];
  onUpdatePlaylist: (playlist: Playlist) => void;
  onAssignPlaylist: (deviceId: string, playlistId: string) => void;
  onCreatePlaylist: () => Playlist;
}

const PlaylistManager: React.FC<Props> = ({ playlists, assets, devices, onUpdatePlaylist, onAssignPlaylist, onCreatePlaylist }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(playlists[0]);
  const [isNamingAI, setIsNamingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const updateItemDuration = (assetId: string, newDuration: number) => {
    if (!selectedPlaylist) return;
    const updatedItems = selectedPlaylist.items.map(item => 
      item.assetId === assetId ? { ...item, duration: newDuration } : item
    );
    const updatedPlaylist = { ...selectedPlaylist, items: updatedItems };
    setSelectedPlaylist(updatedPlaylist);
    onUpdatePlaylist(updatedPlaylist);
  };

  const removeItem = (assetId: string) => {
    if (!selectedPlaylist) return;
    const updatedItems = selectedPlaylist.items.filter(item => item.assetId !== assetId);
    const updatedPlaylist = { ...selectedPlaylist, items: updatedItems };
    setSelectedPlaylist(updatedPlaylist);
    onUpdatePlaylist(updatedPlaylist);
  };

  const addItemToPlaylist = (asset: MediaAsset) => {
    if (!selectedPlaylist) return;
    const newItem: PlaylistItem = { assetId: asset.id, duration: 10 };
    const updatedPlaylist = { 
      ...selectedPlaylist, 
      items: [...selectedPlaylist.items, newItem] 
    };
    setSelectedPlaylist(updatedPlaylist);
    onUpdatePlaylist(updatedPlaylist);
  };

  const handleAIName = async () => {
    if (!selectedPlaylist || selectedPlaylist.items.length === 0) return;
    setIsNamingAI(true);
    const playlistAssets = selectedPlaylist.items.map(item => assets.find(a => a.id === item.assetId)).filter(Boolean);
    const newName = await suggestPlaylistName(playlistAssets);
    const updatedPlaylist = { ...selectedPlaylist, name: newName };
    setSelectedPlaylist(updatedPlaylist);
    onUpdatePlaylist(updatedPlaylist);
    setIsNamingAI(false);
  };

  const handleCreateNew = () => {
    const newPlaylist = onCreatePlaylist();
    setSelectedPlaylist(newPlaylist);
  };

  const totalDuration = selectedPlaylist?.items.reduce((acc, item) => acc + item.duration, 0) || 0;
  
  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !selectedPlaylist?.items.some(item => item.assetId === a.id)
  );

  const getPlaylistStats = (playlist: Playlist) => {
    const duration = playlist.items.reduce((acc, item) => acc + item.duration, 0);
    return {
      duration,
      count: playlist.items.length
    };
  };

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor de Programação</h1>
          <p className="text-zinc-500 mt-1">Crie sequências dinâmicas e distribua para suas telas.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setSelectedPlaylist(null)}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all border ${
               selectedPlaylist === null 
               ? 'bg-blue-600 border-blue-500 text-white font-bold' 
               : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
             }`}
           >
            <ListPlus className="w-5 h-5" />
            <span>Ver Todas</span>
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Playlist</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Lado Esquerdo: Biblioteca Rápida (Sempre visível ou condicional?) */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 bg-[#121214] border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500">Mídias Disponíveis</h3>
            <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-400">{filteredAssets.length}</span>
          </div>
          
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Filtrar mídias..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {filteredAssets.map(asset => (
              <div 
                key={asset.id}
                className={`group bg-black/40 border border-zinc-800 p-2 rounded-xl transition-all cursor-pointer ${
                  !selectedPlaylist ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-blue-500/50'
                }`}
                onClick={() => selectedPlaylist && addItemToPlaylist(asset)}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                    {asset.type === 'image' ? (
                      <img src={asset.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Video className="w-4 h-4 text-zinc-600" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{asset.name}</p>
                    <p className="text-[10px] text-zinc-600 uppercase">{asset.type}</p>
                  </div>
                  {selectedPlaylist && (
                    <button className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 text-white rounded-md transition-all">
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!selectedPlaylist && (
               <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                  <p className="text-[10px] text-blue-400 font-medium">Selecione uma playlist para adicionar mídias</p>
               </div>
            )}
          </div>
        </div>

        {/* Centro: Timeline Editor OU Playlist Gallery */}
        <div className="lg:col-span-6 bg-[#121214] border border-zinc-800 rounded-3xl p-8 flex flex-col min-h-0 relative shadow-2xl overflow-hidden">
          {selectedPlaylist ? (
            <>
              <div className="flex flex-col gap-6 mb-8 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="text"
                      value={selectedPlaylist.name}
                      onChange={(e) => {
                         const updated = { ...selectedPlaylist, name: e.target.value };
                         setSelectedPlaylist(updated);
                         onUpdatePlaylist(updated);
                      }}
                      className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-blue-500 focus:outline-none transition-all px-1"
                    />
                    <button 
                      onClick={handleAIName}
                      disabled={isNamingAI}
                      className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                      title="Sugerir nome com IA"
                    >
                      {isNamingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800 flex items-center gap-4">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Duração Total</p>
                        <p className="text-lg font-mono font-bold text-blue-500">{totalDuration}s</p>
                     </div>
                     <Clock className="w-5 h-5 text-zinc-700" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {selectedPlaylist.items.length > 0 ? (
                  selectedPlaylist.items.map((item, index) => {
                    const asset = assets.find(a => a.id === item.assetId);
                    if (!asset) return null;
                    return (
                      <div 
                        key={`${asset.id}-${index}`} 
                        className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-zinc-700 transition-all"
                      >
                        <div className="text-zinc-700 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold">{index + 1}</span>
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="w-20 aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800 flex-shrink-0">
                          {asset.type === 'image' ? (
                            <img src={asset.url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-500/10"><PlayCircle className="w-5 h-5 text-blue-500" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{asset.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black rounded text-[10px] text-zinc-500">
                                {asset.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                {asset.type.toUpperCase()}
                             </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-zinc-800">
                           <input 
                             type="number" 
                             value={item.duration}
                             onChange={(e) => updateItemDuration(item.assetId, parseInt(e.target.value) || 0)}
                             className="w-12 bg-transparent text-center font-mono font-bold text-blue-500 focus:outline-none"
                           />
                           <span className="text-[10px] font-black text-zinc-600 uppercase">Seg</span>
                        </div>

                        <button 
                          onClick={() => removeItem(item.assetId)}
                          className="p-2 text-zinc-700 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50 space-y-4">
                     <PlayCircle className="w-20 h-20" />
                     <p className="text-lg font-medium">Sua playlist está vazia.<br/>Arraste mídias da biblioteca.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex gap-3 shrink-0">
                 <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                    <Eye className="w-5 h-5" />
                    Preview Loop
                 </button>
                 <button className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                 </button>
              </div>
            </>
          ) : (
            /* Playlist Gallery View */
            <div className="flex flex-col h-full animate-in slide-in-from-top-4 duration-300">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl">
                     <Layers className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold">Todas as Playlists</h2>
                     <p className="text-zinc-500 text-sm">Gerencie sua biblioteca de sequências</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                  {playlists.map(playlist => {
                    const stats = getPlaylistStats(playlist);
                    return (
                      <div 
                        key={playlist.id}
                        onClick={() => setSelectedPlaylist(playlist)}
                        className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <PlayCircle className="w-20 h-20 -mr-4 -mt-4 text-white" />
                        </div>

                        <h3 className="text-lg font-bold mb-4 pr-10">{playlist.name}</h3>
                        
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-zinc-400">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-xs font-medium">{stats.count} mídias cadastradas</span>
                           </div>
                           <div className="flex items-center gap-2 text-zinc-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-medium">Ciclo de {stats.duration}s</span>
                           </div>
                           <div className="flex items-center gap-2 text-zinc-500">
                              <Calendar className="w-4 h-4" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">Modificado {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                           </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                           <div className="flex items-center gap-1 text-blue-500 font-bold text-xs uppercase tracking-widest">
                              Editar Playlist
                              <ChevronRight className="w-4 h-4" />
                           </div>
                           <button className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Card para Nova Playlist */}
                  <div 
                    onClick={handleCreateNew}
                    className="border-2 border-dashed border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group cursor-pointer"
                  >
                     <div className="p-4 bg-zinc-800 rounded-full group-hover:bg-blue-600 transition-all text-zinc-500 group-hover:text-white">
                        <Plus className="w-8 h-8" />
                     </div>
                     <p className="font-bold text-zinc-500 group-hover:text-blue-500">Nova Sequência</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Distribuição para TVs */}
        <div className="lg:col-span-3 bg-[#121214] border border-zinc-800 rounded-3xl p-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500">Enviar para Telas</h3>
            <Tv className="w-4 h-4 text-zinc-700" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {devices.map(device => {
              const isActive = device.currentPlaylistId === selectedPlaylist?.id;
              return (
                <div 
                  key={device.id}
                  onClick={() => selectedPlaylist && onAssignPlaylist(device.id, selectedPlaylist.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isActive 
                      ? 'bg-blue-600/10 border-blue-500/40' 
                      : 'bg-black/20 border-zinc-800 hover:border-zinc-700'
                  } ${!selectedPlaylist ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-xs font-bold">{device.name}</p>
                        <p className="text-[10px] text-zinc-600">{device.location}</p>
                      </div>
                    </div>
                    {isActive ? (
                      <div className="bg-blue-600 text-white p-1 rounded-md">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    ) : (
                      selectedPlaylist && (
                        <div className="opacity-0 group-hover:opacity-100 text-zinc-600">
                          <Plus className="w-4 h-4" />
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 border-dashed">
            <p className="text-[10px] text-zinc-500 text-center">
              {selectedPlaylist 
                ? 'Ao selecionar uma TV, a playlist será sincronizada e iniciada imediatamente no próximo loop.'
                : 'Selecione uma playlist no editor ou galeria para atribuir a um dispositivo.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistManager;
