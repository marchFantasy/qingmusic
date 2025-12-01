import { useParams } from 'react-router-dom';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { Music, Pause, Play, Trash2 } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export function PlaylistView() {
	const { id } = useParams<{ id: string }>();
	const { playlists, removeTrackFromPlaylist } = usePlaylistStore();
	const { files } = useLibraryStore();
	const { currentTrack, isPlaying, play } = usePlayerStore();

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

	const handlePlayTrack = (track: (typeof tracks)[0], index: number) => {
		const playlistQueue = tracks.slice(index);
		usePlayerStore.getState().setQueue(playlistQueue, track.id);
		play(track);
	};

	return (
		<div>
			<header className="mb-8">
				<h1 className="text-4xl font-bold text-white mb-2">{playlist.name}</h1>
				<p className="text-white/60">{tracks.length} songs</p>
			</header>

			<table className="w-full text-left text-sm">
				<thead className="text-white/60 border-b border-white/10">
					<tr>
						<th className="p-3 w-10">#</th>
						<th className="p-3">Title</th>
						<th className="p-3">Album</th>
						<th className="p-3 w-20">Duration</th>
						<th className="p-3 w-10"></th>
					</tr>
				</thead>
				<tbody>
					{tracks.map((track, index) => {
						const isCurrent = currentTrack?.id === track.id;
						return (
							<tr
								key={track.id}
								className="group hover:bg-white/5 rounded-lg cursor-pointer"
								onClick={() => handlePlayTrack(track, index)}
							>
								<td className="p-3 text-white/60">{index + 1}</td>
								<td className="p-3 flex items-center gap-4">
									<div className="w-12 h-12 rounded-md bg-white/10 shrink-0 overflow-hidden">
										{track.metadata?.cover ? (
											<img
												src={track.metadata.cover}
												alt={track.metadata.title || track.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-white/20">
												<Music size={24} />
											</div>
										)}
									</div>
									<div>
										<p
											className={`font-medium truncate ${
												isCurrent ? 'text-primary' : 'text-white'
											}`}
										>
											{track.metadata?.title || track.name}
										</p>
										<p className="text-white/60 truncate">
											{track.metadata?.artist || 'Unknown Artist'}
										</p>
									</div>
								</td>
								<td className="p-3 text-white/80 truncate">
									{track.metadata?.album || 'Unknown Album'}
								</td>
								<td className="p-3 text-white/60 font-mono">
									{track.metadata?.duration
										? formatTime(track.metadata.duration)
										: '-:--'}
								</td>
								<td className="p-3">
									<button
										className="text-white/60 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
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
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
