
export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: string;
  resolution: string;
  uploadedAt: string;
  fileBlob?: Blob; // Armazena o arquivo binário real para uso offline
  aiMetadata?: {
    tags: string[];
    readabilityScore: number;
    optimizationTips: string;
  };
}

export interface PlaylistItem {
  assetId: string;
  duration: number; // Duração em segundos
}

export interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  currentPlaylistId?: string;
  lastPing: string;
  ip: string;
  pairingCode?: string;
}

export interface Schedule {
  id: string;
  deviceId: string;
  playlistId: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  days: string[];    // ['Seg', 'Ter', ...]
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  MEDIA_LIBRARY = 'MEDIA_LIBRARY',
  PLAYLISTS = 'PLAYLISTS',
  DEVICES = 'DEVICES',
  SCHEDULER = 'SCHEDULER',
  PLAYER = 'PLAYER'
}
