import { usePlaylistStore } from '../store/usePlaylistStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { ListMusic, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function PlaylistSidebar() {
	const { playlists, createPlaylist } = usePlaylistStore();
	const { t } = useLanguageStore();

	const handleCreatePlaylist = () => {
		const name = prompt(t('enterPlaylistName'));
		if (name) {
			createPlaylist(name);
		}
	};

	const playlistArray = Object.values(playlists);

	return (
		<div className="p-4 flex flex-col gap-4 h-full">
			<nav className="flex flex-col gap-1">
				<NavLink
					to="/"
					className={({ isActive }) =>
						`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-semibold transition ${
							isActive ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5'
						}`
					}
				>
					{/* <Library size={20} /> */}
					<img
						src={`${import.meta.env.BASE_URL}logo-500-dark.png`}
						className="w-8 h-8"
						alt="Logo"
					/>
					{t('library')}
				</NavLink>
			</nav>

			<div className="flex items-center justify-between mt-4">
				<div className="flex items-center gap-3 text-white/80">
					<ListMusic size={24} />
					<h2 className="text-lg font-semibold">{t('playlists')}</h2>
				</div>
				<button
					onClick={handleCreatePlaylist}
					className="p-2 rounded-full text-white/60 hover:bg-white/10 hover:text-white transition"
				>
					<Plus size={20} />
				</button>
			</div>

			<nav className="flex flex-col gap-1 overflow-y-auto flex-1">
				{playlistArray.length > 0 ? (
					playlistArray.map((playlist) => (
						<NavLink
							key={playlist.id}
							to={`/playlist/${playlist.id}`}
							className={({ isActive }) =>
								`px-4 py-2 rounded-md text-sm transition truncate ${
									isActive ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5'
								}`
							}
						>
							{playlist.name}
						</NavLink>
					))
				) : (
					<p className="text-sm text-white/40 px-4 py-2">{t('newPlaylist')}</p>
				)}
			</nav>
		</div>
	);
}
