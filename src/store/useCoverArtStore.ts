import { create } from 'zustand';
import { coverArtService } from '../services/coverArtService';

interface CoverArtState {
	// albumName -> coverUrl
	coverUrls: Record<string, string>;
	loadCover: (albumName: string) => Promise<void>;
	setCover: (albumName: string, imageBlob: Blob) => Promise<void>;
}

export const useCoverArtStore = create<CoverArtState>((set, get) => ({
	coverUrls: {},

	loadCover: async (albumName: string) => {
		if (get().coverUrls[albumName]) return; // Already loaded

		const url = await coverArtService.getCoverUrl(albumName);
		if (url) {
			set((state) => ({
				coverUrls: { ...state.coverUrls, [albumName]: url },
			}));
		}
	},

	setCover: async (albumName: string, imageBlob: Blob) => {
		await coverArtService.setCover(albumName, imageBlob);
		// Invalidate old URL if it exists
		const oldUrl = get().coverUrls[albumName];
		if (oldUrl) {
			URL.revokeObjectURL(oldUrl);
		}
		const newUrl = URL.createObjectURL(imageBlob);
		set((state) => ({
			coverUrls: { ...state.coverUrls, [albumName]: newUrl },
		}));
	},
}));
