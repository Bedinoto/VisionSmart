
import { MediaAsset, Device, Playlist, Schedule } from './types';

export const MOCK_ASSETS: MediaAsset[] = [
  {
    id: '1',
    name: 'Boas-vindas Manhã.jpg',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920',
    type: 'image',
    size: '1.2MB',
    resolution: '1920x1080',
    uploadedAt: '2024-05-10T08:30:00Z',
    aiMetadata: {
      tags: ['escritório', 'clean', 'moderno'],
      readabilityScore: 92,
      optimizationTips: "Contraste ideal para textos em branco."
    }
  },
  {
    id: '2',
    name: 'Menu Almoço.jpg',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920',
    type: 'image',
    size: '2.1MB',
    resolution: '1920x1080',
    uploadedAt: '2024-05-11T14:20:00Z',
  },
  {
    id: '3',
    name: 'Promoção Digital.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-circuit-board-1542-large.mp4',
    type: 'video',
    size: '45MB',
    resolution: '1080p',
    uploadedAt: '2024-05-12T19:00:00Z',
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  { 
    id: 'p1', 
    name: 'Recepção VIP', 
    items: [
      { assetId: '1', duration: 15 },
      { assetId: '3', duration: 30 }
    ], 
    updatedAt: '2024-05-12T10:00:00Z' 
  },
  { 
    id: 'p2', 
    name: 'Menu Restaurante', 
    items: [
      { assetId: '2', duration: 20 }
    ], 
    updatedAt: '2024-05-11T16:00:00Z' 
  },
];

export const MOCK_DEVICES: Device[] = [
  { id: 'd1', name: 'Lobby Entrada', location: 'Térreo', status: 'online', currentPlaylistId: 'p1', lastPing: 'Agora', ip: '192.168.1.101' },
  { id: 'd2', name: 'Painel Refeitório', location: '2º Andar', status: 'online', currentPlaylistId: 'p2', lastPing: '1 min atrás', ip: '192.168.1.102' },
  { id: 'd3', name: 'Sala Reuniões 04', location: '3º Andar', status: 'offline', lastPing: '2 dias atrás', ip: '192.168.1.105' },
];

export const MOCK_SCHEDULES: Schedule[] = [
  { id: 's1', deviceId: 'd1', playlistId: 'p1', startTime: '08:00', endTime: '18:00', days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] },
];
