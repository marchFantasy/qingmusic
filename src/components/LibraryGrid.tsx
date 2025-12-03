import { useEffect, useMemo, useRef, useState } from 'react';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useCoverArtStore } from '../store/useCoverArtStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { fileSystem } from '../services/fileSystem';
import {
	FolderOpen,
	Music,
	Pause,
	Play,
	MoreHorizontal,
	Plus,
	ImageUp,
	ArrowLeft,
	Disc,
	Mic2,
	LayoutGrid,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../utils/formatTime';
import type { AudioFile } from '../types';

type FilterType = 'all' | 'album' | 'artist';
type ViewMode = 'songs' | 'albums' | 'artists';

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
	const { t } = useLanguageStore();
	const playlistArray = Object.values(playlists);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const activeFileRef = useRef<AudioFile | null>(null);

	const [viewMode, setViewMode] = useState<ViewMode>('songs');
	const [filterType, setFilterType] = useState<FilterType>('all');
	const [filterValue, setFilterValue] = useState<string | null>(null);

	const handleCreatePlaylist = () => {
		const name = prompt(t('enterPlaylistName'));
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
		let result = files;

		// Apply Search
		if (searchTerm) {
			const lowercasedTerm = searchTerm.toLowerCase();
			result = result.filter((file) => {
				const { title, artist, album } = file.metadata || {};
				return (
					title?.toLowerCase().includes(lowercasedTerm) ||
					artist?.toLowerCase().includes(lowercasedTerm) ||
					album?.toLowerCase().includes(lowercasedTerm) ||
					file.name.toLowerCase().includes(lowercasedTerm)
				);
			});
		}

		// Apply Album/Artist Filter
		if (filterType === 'album' && filterValue) {
			result = result.filter((file) => file.metadata?.album === filterValue);
		} else if (filterType === 'artist' && filterValue) {
			result = result.filter((file) => file.metadata?.artist === filterValue);
		}

		return result;
	}, [files, searchTerm, filterType, filterValue]);

	const albums = useMemo(() => {
		const albumMap = new Map<
			string,
			{ name: string; artist: string; cover?: string }
		>();
		files.forEach((file) => {
			const album = file.metadata?.album;
			if (album && !albumMap.has(album)) {
				albumMap.set(album, {
					name: album,
					artist: file.metadata?.artist || t('unknownArtist'),
					cover: file.metadata?.cover,
				});
			}
		});
		return Array.from(albumMap.values());
	}, [files, t]);

	const artists = useMemo(() => {
		const artistSet = new Set<string>();
		files.forEach((file) => {
			if (file.metadata?.artist) {
				artistSet.add(file.metadata.artist);
			}
		});
		return Array.from(artistSet).sort();
	}, [files]);

	// Auto-scan if handle exists (e.g. persisted later)
	useEffect(() => {
		if (rootHandle && files.length === 0 && !isScanning) {
			scanLibrary();
		}
	}, [rootHandle, files.length, isScanning, scanLibrary]);

	// Load custom covers for visible albums
	useEffect(() => {
		const albumsToLoad = new Set<string>();

		if (viewMode === 'songs' || (viewMode === 'albums' && filterType === 'all')) {
			// Load covers for filtered files
			filteredFiles.forEach((f) => {
				if (f.metadata?.album) albumsToLoad.add(f.metadata.album);
			});
		} else if (viewMode === 'albums') {
			// Load covers for all albums
			albums.forEach((a) => albumsToLoad.add(a.name));
		}

		albumsToLoad.forEach((albumName) => {
			loadCover(albumName);
		});
	}, [filteredFiles, albums, viewMode, filterType, loadCover]);

	const clearFilter = () => {
		setFilterType('all');
		setFilterValue(null);
		// Return to the view mode that corresponds to the filter we just cleared
		if (filterType === 'album') {
			setViewMode('albums');
		} else if (filterType === 'artist') {
			setViewMode('artists');
		} else {
			setViewMode('songs');
		}
	};

	const handleFilterByAlbum = (album: string) => {
		setFilterType('album');
		setFilterValue(album);
		setViewMode('songs'); // Switch to song list view
	};

	const handleFilterByArtist = (artist: string) => {
		setFilterType('artist');
		setFilterValue(artist);
		setViewMode('songs'); // Switch to song list view
	};

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
					<h2 className="text-3xl font-bold mb-4 text-white">{t('selectFolder')}</h2>
					<p className="text-white/60 mb-8 max-w-md">{t('selectFolderDesc')}</p>
					<button
						onClick={handleOpenFolder}
						className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition shadow-lg shadow-white/20"
					>
						{t('openFolder')}
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
					<p className="text-white/60">{t('scanning')}</p>
				</div>
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

			{/* Top Bar: Tabs or Back Button */}
			<div className="flex items-center justify-between mb-6">
				{filterType !== 'all' && filterValue ? (
					<div className="flex items-center gap-4">
						<button
							onClick={clearFilter}
							className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
						>
							<ArrowLeft size={20} />
						</button>
						<div>
							<p className="text-white/60 text-sm uppercase tracking-wider font-medium">
								{filterType === 'album' ? 'Album' : 'Artist'}
							</p>
							<h2 className="text-2xl font-bold text-white">{filterValue}</h2>
						</div>
					</div>
				) : (
					<div className="flex bg-white/10 p-1 rounded-xl">
						<button
							onClick={() => setViewMode('songs')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
								viewMode === 'songs'
									? 'bg-white text-black shadow-sm'
									: 'hover:text-white'
							}`}
						>
							<LayoutGrid size={16} /> {t('allSongs')}
						</button>
						<button
							onClick={() => setViewMode('albums')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
								viewMode === 'albums'
									? 'bg-white text-black shadow-sm'
									: 'hover:text-white'
							}`}
						>
							<Disc size={16} /> {t('albums')}
						</button>
						<button
							onClick={() => setViewMode('artists')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
								viewMode === 'artists'
									? 'bg-white text-black shadow-sm'
									: 'hover:text-white'
							}`}
						>
							<Mic2 size={16} /> {t('artists')}
						</button>
					</div>
				)}
			</div>

			{/* Content Area */}
			{viewMode === 'albums' && filterType === 'all' ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
					{albums.map((album) => {
						const customCoverUrl = coverUrls[album.name];
						const coverUrl = customCoverUrl || album.cover;
						return (
							<motion.div
								key={album.name}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-white/10 cursor-pointer"
								onClick={() => handleFilterByAlbum(album.name)}
							>
								{coverUrl ? (
									<img
										src={coverUrl}
										alt={album.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:text-white/20 transition">
										<Disc size={64} />
									</div>
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition" />
								<div className="absolute bottom-0 left-0 right-0 p-4">
									<h3 className="font-semibold truncate text-white">{album.name}</h3>
									<p className="text-xs text-white/60 truncate">{album.artist}</p>
								</div>
							</motion.div>
						);
					})}
				</div>
			) : viewMode === 'artists' && filterType === 'all' ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
					{artists.map((artist) => (
						<motion.div
							key={artist}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="group relative aspect-square rounded-full overflow-hidden bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-white/10 cursor-pointer flex items-center justify-center"
							onClick={() => handleFilterByArtist(artist)}
						>
							<div className="text-white/20 group-hover:text-white/40 transition">
								<Mic2 size={48} />
							</div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition" />
							<div className="absolute bottom-0 left-0 right-0 p-4 text-center">
								<h3 className="font-semibold truncate text-white">{artist}</h3>
							</div>
						</motion.div>
					))}
				</div>
			) : (
				// Songs View (All or Filtered)
				<>
					{filteredFiles.length === 0 ? (
						<div className="text-center text-white/60 mt-20">
							<p className="text-lg">
								{t('noResults')} "{searchTerm}"
							</p>
							<p className="text-sm">{t('tryDifferent')}</p>
						</div>
					) : (
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
											// Important: set the queue to the *filtered* library for continuous play
											usePlayerStore.getState().setQueue(filteredFiles, file.id);
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
											<div
												onClick={handlePlay}
												className="absolute inset-0 cursor-pointer"
											>
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
													<p className="text-xs text-white/60 truncate flex gap-1">
														<span
															className="hover:text-white hover:underline cursor-pointer"
															onClick={(e) => {
																e.stopPropagation();
																if (file.metadata?.artist) {
																	handleFilterByArtist(file.metadata.artist);
																}
															}}
														>
															{file.metadata?.artist || t('unknownArtist')}
														</span>
														{file.metadata?.album && (
															<>
																<span>•</span>
																<span
																	className="hover:text-white hover:underline cursor-pointer"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleFilterByAlbum(file.metadata!.album!);
																	}}
																>
																	{file.metadata.album}
																</span>
															</>
														)}
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
														className="z-50 bg-neutral-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl text-sm text-white/90 py-1 w-48"
														onClick={(e) => e.stopPropagation()}
													>
														<DropdownMenu.Sub>
															<DropdownMenu.SubTrigger className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-white/10">
																{t('addToPlaylist')}
															</DropdownMenu.SubTrigger>
															<DropdownMenu.Portal>
																<DropdownMenu.SubContent
																	sideOffset={5}
																	className="z-50 bg-neutral-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl text-sm text-white/90 py-1 w-48"
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
																		<Plus size={16} /> {t('createPlaylist')}
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
															<ImageUp size={16} /> {t('setCustomCover')}
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Portal>
											</DropdownMenu.Root>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					)}
				</>
			)}
		</>
	);
}
