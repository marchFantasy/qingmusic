import { useEffect } from 'react';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { fileSystem } from '../services/fileSystem';
import { FolderOpen, Music, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export function LibraryGrid() {
	const { rootHandle, files, isScanning, setRootHandle, scanLibrary } =
		useLibraryStore();
	const { play, currentTrack, isPlaying } = usePlayerStore();

	const handleOpenFolder = async () => {
		try {
			const handle = await fileSystem.selectDirectory();
			setRootHandle(handle);
			scanLibrary();
		} catch (error) {
			console.error(error);
		}
	};

	// Auto-scan if handle exists (e.g. persisted later)
	useEffect(() => {
		if (rootHandle && files.length === 0 && !isScanning) {
			scanLibrary();
		}
	}, [rootHandle, files.length, isScanning, scanLibrary]);

	if (!rootHandle) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
				>
					<div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
						<FolderOpen size={40} />
					</div>
					<h2 className="text-3xl font-bold mb-4 text-white">Select Music Folder</h2>
					<p className="text-white/60 mb-8 max-w-md">
						Choose a local directory to scan for music files. <br />
						Your music never leaves your device.
					</p>
					<button
						onClick={handleOpenFolder}
						className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition shadow-lg shadow-white/20"
					>
						Open Folder
					</button>
				</motion.div>
			</div>
		);
	}

	if (isScanning) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="flex flex-col items-center gap-4">
					<div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
					<p className="text-white/60">Scanning library...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
			{files.map((file, index) => {
				const isCurrent = currentTrack?.id === file.id;
				return (
					<motion.div
						key={file.id}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.02 }}
						className={`group relative aspect-square rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition border ${
							isCurrent
								? 'border-primary shadow-[0_0_20px_rgba(255,255,255,0.2)]'
								: 'border-transparent hover:border-white/10'
						}`}
						onClick={() => {
							usePlayerStore.getState().setQueue(files);
							play(file);
						}}
					>
						{/* Placeholder Cover */}
						<div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:text-white/20 transition">
							<Music size={64} />
						</div>

						{/* Overlay */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition" />

						{/* Play Button Overlay */}
						<div
							className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition ${
								isCurrent && isPlaying ? 'opacity-100' : ''
							}`}
						>
							<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-black transform scale-90 group-hover:scale-100 transition">
								{isCurrent && isPlaying ? (
									<div className="w-3 h-3 bg-black rounded-sm animate-pulse" />
								) : (
									<Play size={20} fill="currentColor" className="ml-1" />
								)}
							</div>
						</div>

						{/* Info */}
						<div className="absolute bottom-0 left-0 right-0 p-4">
							<h3
								className={`font-semibold truncate ${
									isCurrent ? 'text-primary' : 'text-white'
								}`}
							>
								{file.name}
							</h3>
							<p className="text-xs text-white/60 truncate">Unknown Artist</p>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
}
