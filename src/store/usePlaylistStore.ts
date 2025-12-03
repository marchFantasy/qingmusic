import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

			createPlaylist: (name) =>
				set((state) => {
					const id = crypto.randomUUID();
					return {
						playlists: {
							...state.playlists,
							[id]: { id, name, trackIds: [], createdAt: Date.now() },
						},
					};
				}),

			deletePlaylist: (id) =>
				set((state) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { [id]: _deleted, ...rest } = state.playlists;
					return { playlists: rest };
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
