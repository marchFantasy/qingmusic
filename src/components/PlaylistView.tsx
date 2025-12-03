import { useParams } from 'react-router-dom';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useCoverArtStore } from '../store/useCoverArtStore';
import { Music, Pause, Play, Trash2 } from 'lucide-react';
import { formatTime } from '../utils/formatTime';
import { motion } from 'framer-motion';

export function PlaylistView() {
	const { id } = useParams<{ id: string }>();
	const { playlists, removeTrackFromPlaylist } = usePlaylistStore();
	const { files } = useLibraryStore();
	const { currentTrack, isPlaying, play, pause } = usePlayerStore();
	const { coverUrls } = useCoverArtStore();

	const playlist = id ? playlists[id] : undefined;

	if (!playlist) {
		return (
			<div className="text-center text-white/60 mt-20">
				<h1 className="text-2xl font-bold">Playlist not found</h1>
			</div>
		);
	}

	const tracks = playlist.trackIds
		.map((trackId) => files.find((f) => f.id === trackId))
		.filter((t): t is NonNullable<typeof t> => t !== undefined);

	const handlePlayTrack = (track: (typeof tracks)[0]) => {
		const isCurrent = currentTrack?.id === track.id;
		if (isCurrent && isPlaying) {
			pause();
		} else if (isCurrent && !isPlaying) {
			play();
		} else {
			usePlayerStore.getState().setQueue(tracks, track.id);
			play(track);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: { y: 0, opacity: 1 },
	};

	return (
		<div>
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-8"
			>
				<h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
				<p className="">{tracks.length} songs</p>
			</motion.header>

			<table className="w-full text-left text-sm">
				<thead className="border-b border-white/10">
					<tr>
						<th className="p-3 w-10">#</th>
						<th className="p-3">Title</th>
						<th className="p-3">Album</th>
						<th className="p-3 w-20">Duration</th>
						<th className="p-3 w-10"></th>
					</tr>
				</thead>
				<motion.tbody
					key={`playlist-${id}`}
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					{tracks.map((track, index) => {
						const isCurrent = currentTrack?.id === track.id;

						const albumName = track.metadata?.album;
						const coverUrl =
							(albumName ? coverUrls[albumName] : undefined) || track.metadata?.cover;

						return (
							<motion.tr
								key={track.id}
								variants={itemVariants}
								whileHover={{
									backgroundColor: 'rgba(255, 255, 255, 0.05)',
									scale: 1.02,
								}}
								className="group rounded-lg cursor-pointer"
								onClick={() => handlePlayTrack(track)}
							>
								<td className="p-3 w-10">
									<div className="relative w-4 h-4 flex items-center justify-center">
										{isCurrent ? (
											isPlaying ? (
												<div className="w-3 h-3 flex items-end gap-0.5 text-primary">
													<span className="w-1 h-full bg-current animate-[wave_1s_ease-in-out_-0.4s_infinite]" />
													<span className="w-1 h-2/3 bg-current animate-[wave_1s_ease-in-out_-0.2s_infinite]" />
													<span className="w-1 h-full bg-current animate-[wave_1s_ease-in-out_0s_infinite]" />
												</div>
											) : (
												<Pause size={16} className="text-primary cursor-pointer" />
											)
										) : (
											<>
												<span className="group-hover:opacity-0 transition-opacity">
													{index + 1}
												</span>
												<Play
													size={16}
													className="absolute opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
												/>
											</>
										)}
									</div>
								</td>
								<td className="p-3 flex items-center gap-4">
									<div className="w-12 h-12 rounded-md bg-white/10 shrink-0 overflow-hidden">
										{coverUrl ? (
											<img
												src={coverUrl}
												alt={track.metadata?.title || track.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<Music size={24} />
											</div>
										)}
									</div>
									<div>
										<p
											className={`font-medium truncate ${isCurrent ? 'text-primary' : ''}`}
										>
											{track.metadata?.title || track.name}
										</p>
										<p className="truncate">
											{track.metadata?.artist || 'Unknown Artist'}
										</p>
									</div>
								</td>
								<td className="p-3 truncate">
									{track.metadata?.album || 'Unknown Album'}
								</td>
								<td className="p-3 font-mono">
									{track.metadata?.duration
										? formatTime(track.metadata.duration)
										: '-:--'}
								</td>
								<td className="p-3">
									<button
										className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
										onClick={(e) => {
											e.stopPropagation();
											if (id) {
												removeTrackFromPlaylist(id, track.id);
											}
										}}
									>
										<Trash2 size={16} />
									</button>
								</td>
							</motion.tr>
						);
					})}
				</motion.tbody>
			</table>
		</div>
	);
}
