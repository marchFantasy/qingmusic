import { usePlaylistStore } from '../store/usePlaylistStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { ListMusic, Plus, Trash2 } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

export function PlaylistSidebar() {
	const { playlists, createPlaylist, deletePlaylist } = usePlaylistStore();
	const { t } = useLanguageStore();
	const navigate = useNavigate();
	const location = useLocation();

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
							isActive ? 'bg-white/10 ' : ' hover:bg-white/5'
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
				<div className="flex items-center gap-3">
					<ListMusic size={24} />
					<h2 className="text-lg font-semibold">{t('playlists')}</h2>
				</div>
				<button
					onClick={handleCreatePlaylist}
					className="p-2 rounded-full hover:bg-white/10 transition"
				>
					<Plus size={20} />
				</button>
			</div>

			<nav className="flex flex-col gap-1 overflow-y-auto flex-1">
				{playlistArray.length > 0 ? (
					playlistArray.map((playlist) => (
						<div
							key={playlist.id}
							className={clsx(
								'group flex items-center justify-between px-4 py-2 rounded-md text-sm transition',
								location.pathname === `/playlist/${playlist.id}`
									? 'bg-white/10'
									: 'hover:bg-white/5'
							)}
						>
							<NavLink to={`/playlist/${playlist.id}`} className="flex-1 truncate">
								{playlist.name}
							</NavLink>
							<button
								onClick={(e) => {
									e.preventDefault();
									if (
										confirm(
											t('deletePlaylistConfirm') || `Delete playlist "${playlist.name}"?`
										)
									) {
										deletePlaylist(playlist.id);
										if (location.pathname === `/playlist/${playlist.id}`) {
											navigate('/');
										}
									}
								}}
								className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
								title={t('deletePlaylist') || 'Delete Playlist'}
							>
								<Trash2 size={14} />
							</button>
						</div>
					))
				) : (
					<p className="text-sm px-4 py-2">{t('newPlaylist')}</p>
				)}
			</nav>
		</div>
	);
}
