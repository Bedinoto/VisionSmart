
import React, { useState } from 'react';
import { Schedule, Device, Playlist } from '../types';
import { Calendar as CalendarIcon, Plus, BrainCircuit, Loader2, Sparkles, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { suggestSmartSchedule } from '../services/gemini';

interface Props {
  schedules: Schedule[];
  devices: Device[];
  playlists: Playlist[];
}

const Scheduler: React.FC<Props> = ({ schedules, devices, playlists }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleGenerateAISchedule = async () => {
    setIsGenerating(true);
    const result = await suggestSmartSchedule(playlists, devices);
    setAiSuggestion(result);
    setIsGenerating(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendador de Conteúdo</h1>
          <p className="text-zinc-500 mt-1">Automatize a entrega de conteúdo com precisão de horários.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerateAISchedule}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 font-semibold"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            <span>Agendamento Inteligente IA</span>
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 font-semibold">
            <Plus className="w-5 h-5" />
            <span>Novo Evento de Agenda</span>
          </button>
        </div>
      </div>

      {aiSuggestion && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden group">
          <Sparkles className="absolute top-4 right-4 text-purple-400 w-8 h-8 opacity-20 group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-2 mb-3 text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Insights do Gemini</span>
          </div>
          <p className="text-zinc-200 leading-relaxed max-w-4xl">{aiSuggestion}</p>
          <button 
            onClick={() => setAiSuggestion(null)} 
            className="mt-4 text-xs font-bold text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            FECHAR
          </button>
        </div>
      )}

      {/* Grade de Calendário */}
      <div className="bg-[#121214] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
        {/* Cabeçalho do Calendário */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold">Maio 2024</h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button className="px-3 py-1 bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">Hoje</button>
          </div>
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {[ { label: 'Dia', val: 'Day' }, { label: 'Semana', val: 'Week' }, { label: 'Mês', val: 'Month' } ].map(view => (
              <button key={view.val} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view.val === 'Week' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Rolável */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="grid grid-cols-[100px_repeat(7,1fr)] min-w-[1000px]">
            {/* Canto superior esquerdo */}
            <div className="sticky top-0 left-0 bg-[#121214] z-20 border-b border-r border-zinc-800 p-4" />
            
            {/* Cabeçalhos de Dias */}
            {days.map(day => (
              <div key={day} className="sticky top-0 bg-[#121214] z-10 border-b border-zinc-800 p-4 text-center">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{day.slice(0, 3)}</span>
                <p className="text-lg font-bold mt-1">1{days.indexOf(day) + 3}</p>
              </div>
            ))}

            {/* Slots de Tempo */}
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="border-r border-zinc-800/50 p-4 text-xs font-medium text-zinc-500 text-right bg-zinc-900/20">{hour}</div>
                {days.map(day => {
                  const hasSchedule = (hour === '09:00' && day === 'Segunda-feira') || (hour === '12:00' && day === 'Quarta-feira');
                  return (
                    <div key={`${hour}-${day}`} className="border-r border-b border-zinc-800/50 min-h-[80px] p-1 relative group hover:bg-zinc-800/10 transition-colors">
                      {hasSchedule && (
                        <div className="bg-blue-600/20 border-l-4 border-blue-500 p-2 rounded-r-lg shadow-lg animate-in slide-in-from-left-2">
                          <p className="text-[10px] font-bold text-blue-400 uppercase">Boas-vindas Geral</p>
                          <p className="text-xs font-medium mt-1 truncate">TV Lobby Principal</p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span>1h 30m</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
