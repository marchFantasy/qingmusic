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
	setQueue: (queue: AudioFile[], currentTrackId?: string) => void;
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
			set({ progress: 0, duration: 0 }); // Reset progress for new track
			try {
				const file = await fileSystem.getFile(track.handle);
				audioEngine.play(
					file,
					volume,
					() => next(), // onEnd: play next
					() => set({ duration: audioEngine.duration() }), // onLoad
					(progress) => set({ progress }) // onProgress
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

	setQueue: (queue, currentTrackId) => {
		const track = queue.find((t) => t.id === currentTrackId);
		set({ queue, currentTrack: track });
	},

	next: () => {
		const { queue, currentTrack, repeatMode, isShuffled } = get();
		if (queue.length === 0) return;

		if (repeatMode === 'one' && currentTrack) {
			get().play(currentTrack); // Replay current track
			return;
		}

		if (isShuffled) {
			const randomIndex = Math.floor(Math.random() * queue.length);
			get().play(queue[randomIndex]);
			return;
		}

		const currentIndex = currentTrack
			? queue.findIndex((t) => t.id === currentTrack.id)
			: -1;
		let nextIndex = currentIndex + 1;

		if (nextIndex >= queue.length) {
			if (repeatMode === 'all') {
				nextIndex = 0; // Loop back to start
			} else {
				set({ isPlaying: false }); // Stop at end of queue
				audioEngine.stop();
				return;
			}
		}

		get().play(queue[nextIndex]);
	},

	prev: () => {
		const { queue, currentTrack, progress } = get();
		if (queue.length === 0 || !currentTrack) return;

		// If more than 3s into track, or it's the first track, restart it
		if (progress > 3) {
			get().play(currentTrack);
			return;
		}

		const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
		let prevIndex = currentIndex - 1;

		if (prevIndex < 0) {
			prevIndex = queue.length - 1; // Loop back to end
		}

		get().play(queue[prevIndex]);
	},

	toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
	toggleRepeat: () =>
		set((state) => {
			const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
			const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
			return { repeatMode: modes[nextIndex] };
		}),
}));
