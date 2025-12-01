import { create } from 'zustand';
import type { AudioFile, DirectoryHandle } from '../types';
import { fileSystem } from '../services/fileSystem';

interface LibraryState {
	rootHandle: DirectoryHandle | null;
	files: AudioFile[];
	isScanning: boolean;
	error: string | null;

	setRootHandle: (handle: DirectoryHandle) => void;
	scanLibrary: () => Promise<void>;
	reset: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
	rootHandle: null,
	files: [],
	isScanning: false,
	error: null,

	setRootHandle: (handle) => set({ rootHandle: handle }),

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

	reset: () => set({ rootHandle: null, files: [], error: null }),
}));
