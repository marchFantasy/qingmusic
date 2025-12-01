import { useEffect, useMemo, useRef } from 'react';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useCoverArtStore } from '../store/useCoverArtStore';
import { fileSystem } from '../services/fileSystem';
import {
	FolderOpen,
	Music,
	Pause,
	Play,
	MoreHorizontal,
	Plus,
	ImageUp,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../utils/formatTime';
import type { AudioFile } from '../types';

export function LibraryGrid() {
	const {
		rootHandle,
		files,
		isScanning,
		setRootHandle,
		scanLibrary,
		searchTerm,
	} = useLibraryStore();
	const { play, pause, currentTrack, isPlaying } = usePlayerStore();
	const { playlists, addTrackToPlaylist, createPlaylist } = usePlaylistStore();
	const { coverUrls, loadCover, setCover } = useCoverArtStore();
	const playlistArray = Object.values(playlists);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const activeFileRef = useRef<AudioFile | null>(null);

	const handleCreatePlaylist = () => {
		const name = prompt('Enter a name for your new playlist:');
		if (name) {
			createPlaylist(name);
		}
	};

	const handleOpenFolder = async () => {
		try {
			const handle = await fileSystem.selectDirectory();
			setRootHandle(handle);
			scanLibrary();
		} catch (error) {
			console.error(error);
		}
	};

	const handleSetCover = (file: AudioFile) => {
		activeFileRef.current = file;
		fileInputRef.current?.click();
	};

	const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		const audioFile = activeFileRef.current;
		if (file && audioFile?.metadata?.album) {
			setCover(audioFile.metadata.album, file);
		}
		// Reset file input
		if (e.target) e.target.value = '';
	};

	const filteredFiles = useMemo(() => {
		if (!searchTerm) return files;
		const lowercasedTerm = searchTerm.toLowerCase();
		return files.filter((file) => {
			const { title, artist, album } = file.metadata || {};
			return (
				title?.toLowerCase().includes(lowercasedTerm) ||
				artist?.toLowerCase().includes(lowercasedTerm) ||
				album?.toLowerCase().includes(lowercasedTerm) ||
				file.name.toLowerCase().includes(lowercasedTerm)
			);
		});
	}, [files, searchTerm]);

	// Auto-scan if handle exists (e.g. persisted later)
	useEffect(() => {
		if (rootHandle && files.length === 0 && !isScanning) {
			scanLibrary();
		}
	}, [rootHandle, files.length, isScanning, scanLibrary]);

	// Load custom covers for visible albums
	useEffect(() => {
		const albums = new Set(
			filteredFiles.map((f) => f.metadata?.album).filter(Boolean) as string[]
		);
		albums.forEach((albumName) => {
			loadCover(albumName);
		});
	}, [filteredFiles, loadCover]);

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

	if (filteredFiles.length === 0) {
		return (
			<div className="text-center text-white/60 mt-20">
				<p className="text-lg">No results found for "{searchTerm}"</p>
				<p className="text-sm">Try a different search term.</p>
			</div>
		);
	}

	return (
		<>
			<input
				type="file"
				ref={fileInputRef}
				onChange={onFileSelected}
				className="hidden"
				accept="image/*"
			/>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
				<AnimatePresence mode="popLayout">
					{filteredFiles.map((file, index) => {
						const isCurrent = currentTrack?.id === file.id;
						const customCoverUrl = file.metadata?.album
							? coverUrls[file.metadata.album]
							: undefined;
						const coverUrl = customCoverUrl || file.metadata?.cover;

						const handlePlay = () => {
							if (isCurrent && isPlaying) {
								pause();
							} else if (isCurrent && !isPlaying) {
								play();
							} else {
								// Important: set the queue to the *full* library for continuous play
								usePlayerStore.getState().setQueue(files, file.id);
								play(file);
							}
						};

						return (
							<motion.div
								key={file.id}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{
									delay: index * 0.02,
									duration: 0.3,
									ease: 'easeOut',
								}}
								className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-white/10"
							>
								<div onClick={handlePlay} className="absolute inset-0 cursor-pointer">
									{coverUrl ? (
										<img
											src={coverUrl}
											alt={file.metadata?.title || file.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:text-white/20 transition">
											<Music size={64} />
										</div>
									)}

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
												<Pause size={20} fill="currentColor" />
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
											{file.metadata?.title || file.name}
										</h3>
										<p className="text-xs text-white/60 truncate">
											{file.metadata?.artist || 'Unknown Artist'}
										</p>
									</div>

									{/* Duration */}
									{file.metadata?.duration && (
										<div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full font-mono">
											{formatTime(file.metadata.duration)}
										</div>
									)}
								</div>

								{/* More Options Menu */}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild>
										<button
											onClick={(e) => e.stopPropagation()}
											className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition opacity-0 group-hover:opacity-100"
										>
											<MoreHorizontal size={16} />
										</button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Portal>
										<DropdownMenu.Content
											align="start"
											sideOffset={5}
											className="bg-neutral-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl text-sm text-white/90 py-1 w-48"
											onClick={(e) => e.stopPropagation()}
										>
											<DropdownMenu.Sub>
												<DropdownMenu.SubTrigger className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-white/10">
													Add to playlist
												</DropdownMenu.SubTrigger>
												<DropdownMenu.Portal>
													<DropdownMenu.SubContent
														sideOffset={5}
														className="bg-neutral-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl text-sm text-white/90 py-1 w-48"
													>
														{playlistArray.map((playlist) => (
															<DropdownMenu.Item
																key={playlist.id}
																className="px-3 py-2 cursor-pointer hover:bg-white/10"
																onSelect={() => addTrackToPlaylist(playlist.id, file.id)}
															>
																{playlist.name}
															</DropdownMenu.Item>
														))}
														<DropdownMenu.Separator className="h-px bg-white/10 my-1" />
														<DropdownMenu.Item
															className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10"
															onSelect={handleCreatePlaylist}
														>
															<Plus size={16} /> Create new playlist
														</DropdownMenu.Item>
													</DropdownMenu.SubContent>
												</DropdownMenu.Portal>
											</DropdownMenu.Sub>
											<DropdownMenu.Separator className="h-px bg-white/10 my-1" />
											<DropdownMenu.Item
												className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10"
												onSelect={() => handleSetCover(file)}
												disabled={!file.metadata?.album}
											>
												<ImageUp size={16} /> Set custom cover
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Portal>
								</DropdownMenu.Root>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</>
	);
}
