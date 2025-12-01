import { Howl } from 'howler';

class AudioEngine {
	private howl: Howl | null = null;
	private currentUrl: string | null = null;

	play(blob: Blob, volume: number, onEnd: () => void, onLoad: () => void) {
		if (this.currentUrl) {
			URL.revokeObjectURL(this.currentUrl);
		}

		// Stop previous instance if exists
		if (this.howl) {
			this.howl.unload();
		}

		this.currentUrl = URL.createObjectURL(blob);

		this.howl = new Howl({
			src: [this.currentUrl],
			html5: true, // Force HTML5 Audio to support large files and streaming
			format: ['mp3', 'flac', 'wav', 'ogg', 'm4a'],
			volume: volume,
			onend: onEnd,
			onload: onLoad,
		});

		this.howl.play();
	}

	pause() {
		this.howl?.pause();
	}

	resume() {
		this.howl?.play();
	}

	stop() {
		this.howl?.stop();
	}

	setVolume(volume: number) {
		this.howl?.volume(volume);
	}

	seek(position: number) {
		this.howl?.seek(position);
	}

	duration(): number {
		return this.howl?.duration() || 0;
	}

	currentTime(): number {
		return (this.howl?.seek() as number) || 0;
	}

	isPlaying(): boolean {
		return this.howl?.playing() || false;
	}
}

export const audioEngine = new AudioEngine();
