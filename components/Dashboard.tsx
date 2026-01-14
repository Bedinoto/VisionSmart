
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { MediaAsset, Device, Playlist } from '../types';
import { Monitor, HardDrive, PlayCircle, Zap, ArrowUpRight, Activity } from 'lucide-react';

interface Props {
  assets: MediaAsset[];
  devices: Device[];
  playlists: Playlist[];
}

const data = [
  { name: 'Seg', uptime: 98, viewers: 1200 },
  { name: 'Ter', uptime: 99, viewers: 1500 },
  { name: 'Qua', uptime: 95, viewers: 1100 },
  { name: 'Qui', uptime: 100, viewers: 1800 },
  { name: 'Sex', uptime: 99, viewers: 2200 },
  { name: 'Sáb', uptime: 92, viewers: 800 },
  { name: 'Dom', uptime: 94, viewers: 600 },
];

const StatCard: React.FC<{ title: string, value: string | number, icon: any, trend?: string, color: string }> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-zinc-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500">
        <ArrowUpRight className="w-4 h-4" />
        <span>{trend} vs semana anterior</span>
      </div>
    )}
  </div>
);

const Dashboard: React.FC<Props> = ({ assets, devices, playlists }) => {
  const onlineDevices = devices.filter(d => d.status === 'online').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral da Rede</h1>
          <p className="text-zinc-500 mt-1">Status em tempo real da sua rede global de TVs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3,4].map(i => (
              <img 
                key={i}
                src={`https://picsum.photos/seed/${i}/40/40`} 
                className="w-8 h-8 rounded-full border-2 border-[#09090b]"
                alt="Membro"
              />
            ))}
          </div>
          <button className="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors">
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Dispositivos Ativos" value={`${onlineDevices}/${devices.length}`} icon={Monitor} trend="+2 novos" color="bg-blue-500" />
        <StatCard title="Arquivos de Mídia" value={assets.length} icon={HardDrive} trend="+12.5%" color="bg-purple-500" />
        <StatCard title="Playlists Ativas" value={playlists.length} icon={PlayCircle} color="bg-amber-500" />
        <StatCard title="Audiência Total" value="8.432" icon={Activity} trend="+18.4%" color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121214] border border-zinc-800 p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Alcance da Rede</h2>
            <select className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="viewers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViewers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-8 rounded-2xl">
          <h2 className="text-xl font-bold mb-8">Alertas Recentes</h2>
          <div className="space-y-6">
            {[
              { id: 1, type: 'warning', msg: 'TV do Lobby Principal desconectada', time: 'há 12m' },
              { id: 2, type: 'info', msg: 'Nova mídia "Promo_V2.mp4" carregada', time: 'há 1h' },
              { id: 3, type: 'success', msg: 'Agenda semanal sincronizada', time: 'há 4h' },
              { id: 4, type: 'warning', msg: 'Armazenamento quase cheio (85%)', time: 'Ontem' },
            ].map(alert => (
              <div key={alert.id} className="flex gap-4">
                <div className={`w-2 rounded-full ${alert.type === 'warning' ? 'bg-amber-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-sm font-medium">{alert.msg}</p>
                  <p className="text-xs text-zinc-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm text-zinc-400 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
            Ver Todos os Alertas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
