
import React, { useState } from 'react';
import { Device, Playlist } from '../types';
import { 
  Tv, 
  Wifi, 
  Settings, 
  RefreshCw, 
  Plus,
  X,
  Play,
  Loader2,
  Check,
  Trash2,
  ExternalLink,
  MonitorPlay,
  Activity
} from 'lucide-react';

interface Props {
  devices: Device[];
  playlists: Playlist[];
  onPairNew: (code: string, name: string) => void;
  onAssignPlaylist: (deviceId: string, playlistId: string) => void;
  onDeleteDevice: (deviceId: string) => void;
  onSyncAll: () => void;
}

const DeviceMonitor: React.FC<Props> = ({ devices, playlists, onPairNew, onAssignPlaylist, onDeleteDevice, onSyncAll }) => {
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [pairName, setPairName] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleCreateNewDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (pairName) {
      // Geração automática de código VF-XXXX
      const newCode = `VF-${Math.floor(1000 + Math.random() * 8999)}`;
      onPairNew(newCode, pairName);
      setIsPairingModalOpen(false);
      setPairName('');
    }
  };

  const handleSyncAllClick = () => {
    setIsSyncing(true);
    setSyncDone(false);
    onSyncAll();
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    }, 1500);
  };

  const openPlayerTab = (pairingCode?: string) => {
    if (!pairingCode) return;
    const url = `${window.location.origin}${window.location.pathname}?view=player&code=${pairingCode}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Terminais</h1>
          <p className="text-zinc-500 mt-1">Sua rede de telas Android sincronizadas em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSyncAllClick}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all border font-semibold ${
              syncDone 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
            }`}
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : syncDone ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isSyncing ? 'Sincronizando...' : syncDone ? 'Sincronizado' : 'Sincronizar Todas'}</span>
          </button>
          <button 
            onClick={() => setIsPairingModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Adicionar TV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => {
          const currentPlaylist = playlists.find(p => p.id === device.currentPlaylistId);
          
          return (
            <div key={device.id} className="bg-[#121214] border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all group flex flex-col relative shadow-xl">
              <button 
                onClick={() => {
                  if (confirm(`Remover dispositivo "${device.name}"?`)) {
                    onDeleteDevice(device.id);
                  }
                }}
                className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="p-6 flex-1">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl ${device.status === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                    <Tv className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl truncate">{device.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{device.status}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Playlist em Exibição</label>
                    <div className="flex items-center gap-3">
                      <select 
                        value={device.currentPlaylistId || ''}
                        onChange={(e) => onAssignPlaylist(device.id, e.target.value)}
                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-300"
                      >
                        <option value="">Nenhuma</option>
                        {playlists.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                      <p className="text-[10px] text-zinc-600 uppercase font-bold">Código Único</p>
                      <p className="text-sm font-mono text-blue-500 font-bold">{device.pairingCode}</p>
                    </div>
                    <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                      <p className="text-[10px] text-zinc-600 uppercase font-bold">Último Ping</p>
                      <p className="text-xs text-zinc-400">{device.lastPing}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
                <button 
                  onClick={() => openPlayerTab(device.pairingCode)}
                  className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors group/btn"
                >
                  <MonitorPlay className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  ABRIR TERMINAL DEDICADO
                  <ExternalLink className="w-3 h-3" />
                </button>
                <Activity className="w-4 h-4 text-zinc-700" />
              </div>
            </div>
          );
        })}
      </div>

      {isPairingModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Nova Smart TV</h2>
              <button onClick={() => setIsPairingModalOpen(false)} className="p-3 hover:bg-zinc-800 rounded-2xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNewDevice} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Nome do Dispositivo</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={pairName}
                  onChange={(e) => setPairName(e.target.value)}
                  placeholder="Ex: TV Mural Entrada"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-700"
                />
              </div>
              <div className="bg-blue-600/5 p-6 rounded-3xl border border-blue-500/20 text-center">
                 <p className="text-xs text-blue-400 font-medium leading-relaxed">
                   O sistema gerará um link único para esta TV.<br/>Você poderá abri-lo e gerenciar o conteúdo remotamente.
                 </p>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-5 rounded-[1.5rem] transition-all shadow-xl shadow-blue-900/40 mt-4 active:scale-95 flex items-center justify-center gap-3"
              >
                CRIAR E REGISTRAR TV
                <Plus className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceMonitor;
