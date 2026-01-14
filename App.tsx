
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  Tv, 
  Calendar, 
  ListMusic, 
  Search, 
  Bell, 
  User, 
  Menu,
  ChevronRight,
  Plus,
  Monitor,
  Activity,
  Zap,
  CloudOff,
  CloudLightning,
  Loader2
} from 'lucide-react';
import { View, MediaAsset, Device, Playlist, Schedule } from './types';
import { MOCK_ASSETS, MOCK_DEVICES, MOCK_PLAYLISTS, MOCK_SCHEDULES } from './constants';
import { db } from './services/db';
import Dashboard from './components/Dashboard';
import MediaLibrary from './components/MediaLibrary';
import DeviceMonitor from './components/DeviceMonitor';
import PlaylistManager from './components/PlaylistManager';
import Scheduler from './components/Scheduler';
import Player from './components/Player';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Canal de sincronização global
  const syncChannel = useMemo(() => new BroadcastChannel('visionflow_global_sync'), []);

  // Identificação do Player Atual
  const [pairingCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('code') || `VF-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const loadAllData = async () => {
    const [storedAssets, storedDevices, storedPlaylists] = await Promise.all([
      db.getAll<MediaAsset>('assets'),
      db.getAll<Device>('devices'),
      db.getAll<Playlist>('playlists')
    ]);

    setAssets(storedAssets.length ? storedAssets : MOCK_ASSETS);
    setDevices(storedDevices.length ? storedDevices : MOCK_DEVICES);
    setPlaylists(storedPlaylists.length ? storedPlaylists : MOCK_PLAYLISTS);
  };

  useEffect(() => {
    const init = async () => {
      await db.init();
      await loadAllData();
      setIsReady(true);
    };
    init();

    syncChannel.onmessage = async (event) => {
      if (event.data.type === 'DB_UPDATE_NEEDED') {
        await loadAllData();
      }
    };
  }, [syncChannel]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'player') {
      setActiveView(View.PLAYER);
    }
  }, []);

  const notifyUpdate = () => {
    syncChannel.postMessage({ type: 'DB_UPDATE_NEEDED' });
  };

  const handlePairNewDevice = async (code: string, name: string) => {
    const newDevice: Device = {
      id: `d-${Date.now()}`,
      name,
      location: 'Smart TV Terminal',
      status: 'online',
      lastPing: 'Conectado agora',
      ip: '10.0.0.' + Math.floor(Math.random() * 255),
      pairingCode: code
    };
    await db.save('devices', newDevice);
    await loadAllData();
    notifyUpdate();
  };

  const handleAssignPlaylist = async (deviceId: string, playlistId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    const updated = { ...device, currentPlaylistId: playlistId };
    await db.save('devices', updated);
    await loadAllData();
    notifyUpdate();
  };

  const handleDeleteDevice = async (deviceId: string) => {
    await db.delete('devices', deviceId);
    await loadAllData();
    notifyUpdate();
  };

  const handleSyncAll = () => {
    notifyUpdate();
    setDevices(prev => prev.map(d => ({ ...d, lastPing: 'Sincronizado' })));
  };

  const handleUpdatePlaylist = async (updatedPlaylist: Playlist) => {
    await db.save('playlists', updatedPlaylist);
    await loadAllData();
    notifyUpdate();
  };

  const handleCreatePlaylist = async () => {
    const newPlaylist: Playlist = {
      id: `p-${Date.now()}`,
      name: `Nova Sequência ${playlists.length + 1}`,
      items: [],
      updatedAt: new Date().toISOString()
    };
    await db.save('playlists', newPlaylist);
    await loadAllData();
    notifyUpdate();
    return newPlaylist;
  };

  if (!isReady) {
    return (
      <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Sincronizando Banco Local...</p>
      </div>
    );
  }

  if (activeView === View.PLAYER) {
    const myDevice = devices.find(d => d.pairingCode === pairingCode);
    const myPlaylist = playlists.find(p => p.id === myDevice?.currentPlaylistId) || null;

    return (
      <Player 
        isPaired={!!myDevice}
        pairingCode={pairingCode}
        currentPlaylist={myPlaylist}
        assets={assets}
        onExit={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          url.searchParams.delete('code');
          window.location.href = url.toString();
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      <aside className={`bg-[#121214] border-r border-zinc-800 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight">VisionFlow</span>}
          </div>

          <nav className="flex-1 px-4 mt-4 space-y-1.5">
            {[
              { name: 'Painel', icon: LayoutDashboard, view: View.DASHBOARD },
              { name: 'Mídias', icon: Library, view: View.MEDIA_LIBRARY },
              { name: 'Playlists', icon: ListMusic, view: View.PLAYLISTS },
              { name: 'Dispositivos', icon: Tv, view: View.DEVICES },
              { name: 'Agendas', icon: Calendar, view: View.SCHEDULER },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  activeView === item.view 
                    ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]' 
                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-semibold">{item.name}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
              {isSidebarOpen && <span>Recolher</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        <header className="h-20 bg-[#121214]/50 backdrop-blur-2xl border-b border-zinc-800 px-10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold">CMS VisionFlow</h2>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
               <CloudLightning className="w-3 h-3 text-emerald-500" />
               <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Sincronizado via VisionDB</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">Terminal Master</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Modo Híbrido Ativo</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
                <User className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {(() => {
            switch (activeView) {
              case View.DASHBOARD: return <Dashboard assets={assets} devices={devices} playlists={playlists} />;
              case View.MEDIA_LIBRARY: return <MediaLibrary assets={assets} setAssets={setAssets} />;
              case View.DEVICES: return <DeviceMonitor devices={devices} playlists={playlists} onPairNew={handlePairNewDevice} onAssignPlaylist={handleAssignPlaylist} onDeleteDevice={handleDeleteDevice} onSyncAll={handleSyncAll} />;
              case View.PLAYLISTS: return <PlaylistManager playlists={playlists} assets={assets} devices={devices} onUpdatePlaylist={handleUpdatePlaylist} onAssignPlaylist={handleAssignPlaylist} onCreatePlaylist={handleCreatePlaylist} />;
              case View.SCHEDULER: return <Scheduler schedules={schedules} devices={devices} playlists={playlists} />;
              default: return <Dashboard assets={assets} devices={devices} playlists={playlists} />;
            }
          })()}
        </div>
      </main>
    </div>
  );
};

export default App;
