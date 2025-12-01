import { create } from 'zustand';
import type { AudioFile, DirectoryHandle } from '../types';
import { fileSystem } from '../services/fileSystem';
import { directoryHandleService } from '../services/directoryHandleService';

interface LibraryState {
	rootHandle: DirectoryHandle | null;
	files: AudioFile[];
	isScanning: boolean;
	error: string | null;
	searchTerm: string;

	loadRootHandle: () => Promise<void>;
	setRootHandle: (handle: DirectoryHandle) => void;
	scanLibrary: () => Promise<void>;
	reset: () => void;
	setSearchTerm: (term: string) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
	rootHandle: null,
	files: [],
	isScanning: false,
	error: null,
	searchTerm: '',

	loadRootHandle: async () => {
		try {
			const handle = await directoryHandleService.getHandle();
			if (handle) {
				// Check for permission first
				const permission = await handle.queryPermission({ mode: 'read' });
				if (permission === 'granted') {
					set({ rootHandle: handle });
					await get().scanLibrary();
				} else if (permission === 'prompt') {
					// Request permission
					const newPermission = await handle.requestPermission({ mode: 'read' });
					if (newPermission === 'granted') {
						set({ rootHandle: handle });
						await get().scanLibrary();
					}
				}
				// If permission is 'denied', do nothing. User will have to re-select.
			}
		} catch (error) {
			console.error('Failed to load directory handle from storage', error);
		}
	},

	setRootHandle: (handle) => {
		set({ rootHandle: handle });
		directoryHandleService.saveHandle(handle);
	},

	scanLibrary: async () => {
		const { rootHandle } = get();
		if (!rootHandle) return;

		set({ isScanning: true, error: null });
		try {
			const files = await fileSystem.scanDirectory(rootHandle);
			set({ files, isScanning: false });
		} catch (error) {
			set({ error: (error as Error).message, isScanning: false });
		}
	},

	reset: () => {
		set({ rootHandle: null, files: [], error: null });
		// We could also clear the saved handle here if we want a full reset
		// directoryHandleService.saveHandle(null);
	},
	setSearchTerm: (term) => set({ searchTerm: term }),
}));
