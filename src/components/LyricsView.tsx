import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { fileSystem } from '../services/fileSystem';
import { parseLrc, type LyricLine } from '../utils/lyricsParser';
import { motion, AnimatePresence } from 'framer-motion';

export function LyricsView() {
	const { currentTrack, progress } = usePlayerStore();
	const { rootHandle } = useLibraryStore();
	const { t } = useLanguageStore();
	const [lyrics, setLyrics] = useState<LyricLine[]>([]);
	const [activeIndex, setActiveIndex] = useState<number>(-1);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let isMounted = true;

		const loadLyrics = async () => {
			if (!currentTrack || !rootHandle) {
				setLyrics([]);
				return;
			}

			// Construct potential lyrics path (replace extension with .lrc)
			const lastDotIndex = currentTrack.path.lastIndexOf('.');
			if (lastDotIndex === -1) {
				setLyrics([]);
				return;
			}
			const lrcPath = currentTrack.path.substring(0, lastDotIndex) + '.lrc';

			try {
				const file = await fileSystem.getFileByPath(rootHandle, lrcPath);
				if (file && isMounted) {
					const text = await file.text();
					const parsed = parseLrc(text);
					setLyrics(parsed);
				} else if (isMounted) {
					setLyrics([]);
				}
			} catch (error) {
				console.warn('Failed to load lyrics:', error);
				if (isMounted) setLyrics([]);
			}
		};

		loadLyrics();

		return () => {
			isMounted = false;
		};
	}, [currentTrack, rootHandle]);

	useLayoutEffect(() => {
		if (lyrics.length === 0) return;

		// Find active lyric line
		// We want the last line where time <= progress
		let index = -1;
		for (let i = 0; i < lyrics.length; i++) {
			if (lyrics[i].time <= progress) {
				index = i;
			} else {
				break;
			}
		}

		if (index !== activeIndex) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setActiveIndex(index);
			// Auto-scroll
			if (scrollRef.current) {
				const activeElement = scrollRef.current.children[index] as HTMLElement;
				if (activeElement) {
					activeElement.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					});
				}
			}
		}
	}, [progress, lyrics, activeIndex]);

	if (lyrics.length === 0) return null;

	return (
		<div className="h-full w-80 shrink-0 border-l border-white/10 bg-black/20 backdrop-blur-md flex flex-col">
			<div className="p-6 border-b border-white/5">
				<h3 className="text-lg font-bold text-white">{t('lyrics')}</h3>
			</div>
			<div
				className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
				ref={scrollRef}
			>
				<AnimatePresence mode="popLayout">
					{lyrics.map((line, index) => {
						const isActive = index === activeIndex;
						return (
							<motion.p
								key={index}
								initial={{ opacity: 0, y: 10 }}
								animate={{
									opacity: isActive ? 1 : 0.4,
									scale: isActive ? 1.05 : 1,
									y: 0,
									color: isActive ? '#ffffff' : '#a0a0a0',
								}}
								className={`text-center transition-all duration-300 ${
									isActive ? 'font-bold text-lg' : 'text-sm font-medium'
								}`}
							>
								{line.text}
							</motion.p>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}
