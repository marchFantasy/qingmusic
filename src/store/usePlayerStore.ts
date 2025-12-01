import { create } from 'zustand';
import type { AudioFile } from '../types';
import { audioEngine } from '../services/audioEngine';
import { fileSystem } from '../services/fileSystem';

interface PlayerState {
	isPlaying: boolean;
	currentTrack: AudioFile | null;
	queue: AudioFile[];
	volume: number;
	progress: number;
	duration: number;
	isShuffled: boolean;
	repeatMode: 'none' | 'all' | 'one';

	play: (track?: AudioFile) => void;
	pause: () => void;
	setVolume: (volume: number) => void;
	setProgress: (progress: number) => void;
	setDuration: (duration: number) => void;
	next: () => void;
	prev: () => void;
	setQueue: (queue: AudioFile[]) => void;
	toggleShuffle: () => void;
	toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
	isPlaying: false,
	currentTrack: null,
	queue: [],
	volume: 1.0,
	progress: 0,
	duration: 0,
	isShuffled: false,
	repeatMode: 'none',

	play: async (track) => {
		const { currentTrack, volume, next } = get();

		if (track) {
			// Play new track
			try {
				const file = await fileSystem.getFile(track.handle);
				audioEngine.play(
					file,
					volume,
					() => next(), // onEnd: play next
					() => set({ duration: audioEngine.duration() }) // onLoad
				);
				set({ currentTrack: track, isPlaying: true });
			} catch (error) {
				console.error('Failed to play file', error);
			}
		} else {
			// Resume
			if (currentTrack && !audioEngine.isPlaying()) {
				audioEngine.resume();
				set({ isPlaying: true });
			}
		}
	},

	pause: () => {
		audioEngine.pause();
		set({ isPlaying: false });
	},

	setVolume: (volume) => {
		audioEngine.setVolume(volume);
		set({ volume });
	},

	setProgress: (progress) => {
		audioEngine.seek(progress);
		set({ progress });
	},

	setDuration: (duration) => set({ duration }),

	setQueue: (queue) => set({ queue }),

	next: () => {
		const { queue, currentTrack, repeatMode } = get();
		if (queue.length === 0) return;

		if (repeatMode === 'one' && currentTrack) {
			// Just restart current track (handled by engine usually, but here we just re-set)
			// Actually, 'next' usually forces next track even in repeat one, unless it's auto-next.
			// Let's assume this is user-triggered 'next'.
		}

		const currentIndex = currentTrack
			? queue.findIndex((t) => t.id === currentTrack.id)
			: -1;
		let nextIndex = currentIndex + 1;

		if (nextIndex >= queue.length) {
			if (repeatMode === 'all') {
				nextIndex = 0;
			} else {
				set({ isPlaying: false }); // Stop at end
				return;
			}
		}

		set({ currentTrack: queue[nextIndex], isPlaying: true });
	},

	prev: () => {
		const { queue, currentTrack } = get();
		if (queue.length === 0) return;

		const currentIndex = currentTrack
			? queue.findIndex((t) => t.id === currentTrack.id)
			: -1;
		let prevIndex = currentIndex - 1;

		if (prevIndex < 0) {
			prevIndex = queue.length - 1; // Loop back or stop? Usually loop back or go to 0.
		}

		set({ currentTrack: queue[prevIndex], isPlaying: true });
	},

	toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
	toggleRepeat: () =>
		set((state) => {
			const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
			const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
			return { repeatMode: modes[nextIndex] };
		}),
}));
