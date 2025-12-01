import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface PlaylistItem {
	id: string;
	name: string;
	trackIds: string[];
}

interface PlaylistState {
	playlists: Record<string, PlaylistItem>;
	createPlaylist: (name: string, trackIds?: string[]) => void;
	deletePlaylist: (playlistId: string) => void;
	renamePlaylist: (playlistId: string, newName: string) => void;
	addTrackToPlaylist: (playlistId: string, trackId: string) => void;
	removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const usePlaylistStore = create<PlaylistState>()(
	persist(
		(set) => ({
			playlists: {},

			createPlaylist: (name, trackIds = []) =>
				set((state) => {
					const newId = uuidv4();
					return {
						playlists: {
							...state.playlists,
							[newId]: { id: newId, name, trackIds },
						},
					};
				}),

			deletePlaylist: (playlistId) =>
				set((state) => {
					const newPlaylists = { ...state.playlists };
					delete newPlaylists[playlistId];
					return { playlists: newPlaylists };
				}),

			renamePlaylist: (playlistId, newName) =>
				set((state) => {
					if (!state.playlists[playlistId]) return state;
					return {
						playlists: {
							...state.playlists,
							[playlistId]: {
								...state.playlists[playlistId],
								name: newName,
							},
						},
					};
				}),

			addTrackToPlaylist: (playlistId, trackId) =>
				set((state) => {
					if (!state.playlists[playlistId]) return state;
					const playlist = state.playlists[playlistId];
					if (playlist.trackIds.includes(trackId)) return state; // Avoid duplicates
					return {
						playlists: {
							...state.playlists,
							[playlistId]: {
								...playlist,
								trackIds: [...playlist.trackIds, trackId],
							},
						},
					};
				}),
			
			removeTrackFromPlaylist: (playlistId, trackId) =>
				set((state) => {
					if (!state.playlists[playlistId]) return state;
					const playlist = state.playlists[playlistId];
					return {
						playlists: {
							...state.playlists,
							[playlistId]: {
								...playlist,
								trackIds: playlist.trackIds.filter((id) => id !== trackId),
							},
						},
					};
				}),
		}),
		{
			name: 'qingmusic-playlists', // name of the item in the storage (must be unique)
		}
	)
);
