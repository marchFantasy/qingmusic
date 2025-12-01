import { Howl } from 'howler';

class AudioEngine {
	private howl: Howl | null = null;
	private currentUrl: string | null = null;
	private animationFrameId: number | null = null;
	private onProgressCallback: ((progress: number) => void) | null = null;

	play(
		blob: Blob,
		volume: number,
		onEnd: () => void,
		onLoad: () => void,
		onProgress: (progress: number) => void
	) {
		if (this.currentUrl) {
			URL.revokeObjectURL(this.currentUrl);
		}

		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		// Stop previous instance if exists
		if (this.howl) {
			this.howl.unload();
		}

		this.currentUrl = URL.createObjectURL(blob);
		this.onProgressCallback = onProgress;

		this.howl = new Howl({
			src: [this.currentUrl],
			html5: true, // Force HTML5 Audio to support large files and streaming
			format: ['mp3', 'flac', 'wav', 'ogg', 'm4a'],
			volume: volume,
			onend: onEnd,
			onload: onLoad,
		});

		const updateProgress = () => {
			if (this.howl && this.onProgressCallback) {
				this.onProgressCallback(this.currentTime());
				if (this.howl.playing()) {
					this.animationFrameId = requestAnimationFrame(updateProgress);
				}
			}
		};

		this.howl.on('play', () => {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
			}
			this.animationFrameId = requestAnimationFrame(updateProgress);
		});

		this.howl.on('pause', () => {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
		});

		this.howl.play();
	}

	pause() {
		this.howl?.pause();
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	resume() {
		this.howl?.play();
	}

	stop() {
		this.howl?.stop();
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	setVolume(volume: number) {
		this.howl?.volume(volume);
	}

	seek(position: number) {
		const wasPlaying = this.howl?.playing() || false;
		this.howl?.seek(position);

		// 如果之前在播放，确保 seek 后继续播放，并触发 'play' 事件来重启进度更新
		if (wasPlaying) {
			this.howl?.play();
		}
	}

	duration(): number {
		return this.howl?.duration() || 0;
	}

	currentTime(): number {
		const time = this.howl?.seek();
		if (typeof time === 'number') {
			return time;
		}
		return 0;
	}

	isPlaying(): boolean {
		return this.howl?.playing() || false;
	}
}

export const audioEngine = new AudioEngine();
