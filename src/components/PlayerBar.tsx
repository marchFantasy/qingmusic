import * as Slider from '@radix-ui/react-slider';
import {
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
	Repeat,
	Shuffle,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useCoverArtStore } from '../store/useCoverArtStore';
import { formatTime } from '../utils/formatTime';
import { clsx } from 'clsx';
import { useRef, useState } from 'react';

export function PlayerBar() {
	const {
		isPlaying,
		currentTrack,
		volume,
		progress,
		duration,
		play,
		pause,
		next,
		prev,
		setVolume,
		setProgress,
		toggleShuffle,
		toggleRepeat,
		isShuffled,
		repeatMode,
	} = usePlayerStore();
	const { coverUrls } = useCoverArtStore();

	// 本地状态用于拖动时的临时进度
	const [isDragging, setIsDragging] = useState(false);
	const [tempProgress, setTempProgress] = useState(0);
	const seekTimeoutRef = useRef<number | null>(null);

	// 显示的进度：拖动时显示临时进度，否则显示实际进度
	const displayProgress = isDragging ? tempProgress : progress;

	const handlePlayPause = () => {
		if (isPlaying) pause();
		else play();
	};

	const handleSeek = (value: number[]) => {
		const newProgress = value[0];
		setTempProgress(newProgress);
		setIsDragging(true);

		// 清除之前的定时器
		if (seekTimeoutRef.current !== null) {
			window.clearTimeout(seekTimeoutRef.current);
		}

		// 延迟执行实际的 seek 操作（防抖）
		seekTimeoutRef.current = window.setTimeout(() => {
			setProgress(newProgress);
			setIsDragging(false);
		}, 100); // 100ms 防抖
	};

	const handleSeekCommit = (value: number[]) => {
		// 用户释放滑块时，立即执行 seek
		if (seekTimeoutRef.current !== null) {
			window.clearTimeout(seekTimeoutRef.current);
		}
		setProgress(value[0]);
		setIsDragging(false);
	};

	const handleVolumeChange = (value: number[]) => {
		setVolume(value[0]);
	};

	const customCoverUrl =
		currentTrack?.metadata?.album && coverUrls[currentTrack.metadata.album];
	const coverUrl = customCoverUrl || currentTrack?.metadata?.cover;

	return (
		<div className="flex items-center justify-between h-full px-8 w-full max-w-7xl mx-auto">
			{/* Track Info */}
			<div className="flex items-center w-1/4 min-w-[200px] gap-4">
				{currentTrack ? (
					<>
						<div className="w-14 h-14 bg-white/10 rounded-md flex items-center justify-center overflow-hidden shadow-lg">
							{coverUrl ? (
								<img
									src={coverUrl}
									alt="Cover"
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="text-2xl">🎵</div>
							)}
						</div>
						<div className="flex flex-col truncate">
							<span className="font-medium truncate">
								{currentTrack.metadata?.title || currentTrack.name}
							</span>
							<span className="text-sm truncate">
								{currentTrack.metadata?.artist || 'Unknown Artist'}
							</span>
						</div>
					</>
				) : (
					<div className="text-sm">No track selected</div>
				)}
			</div>

			{/* Controls & Progress */}
			<div className="flex flex-col items-center flex-1 max-w-2xl px-4 gap-2">
				<div className="flex items-center gap-6">
					<button
						onClick={toggleShuffle}
						className={clsx(
							'p-2 rounded-full hover:bg-white/10 transition',
							isShuffled ? 'text-primary' : 'text-white/60'
						)}
					>
						<Shuffle size={18} />
					</button>
					<button
						onClick={prev}
						className="p-2 rounded-full hover:bg-white/10 transition text-white"
					>
						<SkipBack size={24} fill="currentColor" />
					</button>
					<button
						onClick={handlePlayPause}
						className="p-3 bg-white text-black rounded-full hover:scale-105 transition shadow-lg shadow-white/20"
					>
						{isPlaying ? (
							<Pause size={24} fill="currentColor" />
						) : (
							<Play size={24} fill="currentColor" className="ml-1" />
						)}
					</button>
					<button
						onClick={next}
						className="p-2 rounded-full hover:bg-white/10 transition text-white"
					>
						<SkipForward size={24} fill="currentColor" />
					</button>
					<button
						onClick={toggleRepeat}
						className={clsx(
							'p-2 rounded-full hover:bg-white/10 transition relative',
							repeatMode !== 'none' ? 'text-primary' : 'text-white/60'
						)}
					>
						<Repeat size={18} />
						{repeatMode === 'one' && (
							<span className="absolute top-2 right-2 text-[8px] font-bold">1</span>
						)}
					</button>
				</div>

				<div className="flex items-center w-full gap-3 text-xs text-white/60 font-mono">
					<span className="w-10 text-right">{formatTime(displayProgress)}</span>
					<Slider.Root
						className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer group"
						value={[displayProgress]}
						max={duration || 100}
						step={1}
						onValueChange={handleSeek}
						onValueCommit={handleSeekCommit}
					>
						<Slider.Track className="bg-white/10 relative grow rounded-full h-[4px] overflow-hidden group-hover:h-[6px] transition-all">
							<Slider.Range className="absolute bg-white h-full" />
						</Slider.Track>
						<Slider.Thumb
							className="block w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
							aria-label="Progress"
						/>
					</Slider.Root>
					<span className="w-10">{formatTime(duration)}</span>
				</div>
			</div>

			{/* Volume */}
			<div className="flex items-center justify-end w-1/4 min-w-[150px] gap-3">
				<button
					onClick={() => setVolume(volume === 0 ? 1 : 0)}
					className="text-white/60 hover:text-white"
				>
					{volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
				</button>
				<Slider.Root
					className="relative flex items-center select-none touch-none w-24 h-5 cursor-pointer group"
					value={[volume]}
					max={1}
					step={0.01}
					onValueChange={handleVolumeChange}
				>
					<Slider.Track className="bg-white/10 relative grow rounded-full h-[4px] overflow-hidden">
						<Slider.Range className="absolute bg-white h-full" />
					</Slider.Track>
					<Slider.Thumb
						className="block w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
						aria-label="Volume"
					/>
				</Slider.Root>
			</div>
		</div>
	);
}
