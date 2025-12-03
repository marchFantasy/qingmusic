import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PlayerBar } from './components/PlayerBar';
import { LibraryGrid } from './components/LibraryGrid';
import { useLibraryStore } from './store/useLibraryStore';
import { useThemeStore } from './store/useThemeStore';
import { useLanguageStore } from './store/useLanguageStore';
import { usePlayerStore } from './store/usePlayerStore';
import { Search } from 'lucide-react';
import { PlaylistView } from './components/PlaylistView';
import { SettingsModal } from './components/SettingsModal';
import { useCoverArtStore } from './store/useCoverArtStore';
import type { AudioFile } from './types';

function CoverArtBackground({
	currentTrack,
	coverUrls,
}: {
	currentTrack: AudioFile | null;
	coverUrls: Record<string, string>;
}) {
	const albumName = currentTrack?.metadata?.album;
	const coverUrl =
		(albumName ? coverUrls[albumName] : undefined) ||
		currentTrack?.metadata?.cover;

	if (!coverUrl) return null;

	return (
		<div
			className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
			style={{
				backgroundImage: `url(${coverUrl})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				filter: 'blur(30px) brightness(0.6)',
				transform: 'scale(1.1)',
			}}
		/>
	);
}
function App() {
	const { rootHandle, setSearchTerm, loadRootHandle } = useLibraryStore();
	const { currentTheme } = useThemeStore();
	const { t } = useLanguageStore();
	const { currentTrack, isPlaying } = usePlayerStore();

	useEffect(() => {
		loadRootHandle();
	}, [loadRootHandle]);

	useEffect(() => {
		document.body.setAttribute('data-theme', currentTheme);
	}, [currentTheme]);

	useEffect(() => {
		if (currentTrack && isPlaying) {
			const title = currentTrack.metadata?.title || currentTrack.name;
			const artist = currentTrack.metadata?.artist || t('unknownArtist');
			document.title = `${title} - ${artist}`;
		} else {
			document.title = 'QingMusic';
		}
	}, [currentTrack, isPlaying, t]);

	return (
		<Layout bottomBar={<PlayerBar />}>
			{/* Cover Art Background Layer */}
			{useThemeStore.getState().enableCoverArtBackground && (
				<CoverArtBackground
					currentTrack={currentTrack}
					coverUrls={useCoverArtStore.getState().coverUrls}
				/>
			)}

			<div className="max-w-7xl mx-auto relative z-1">
				{rootHandle && (
					<header className="flex items-center justify-between mb-8 sticky top-0 z-10 py-4 glass-panel px-6 rounded-2xl mt-2">
						<div className="flex items-center gap-6">
							<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
								{t('library')}
							</h1>
							<div className="relative">
								<Search
									className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
									size={18}
								/>
								<input
									type="text"
									placeholder={t('searchPlaceholder')}
									className="bg-white/5 border border-transparent hover:border-white/10 focus:border-white/20 focus:bg-white/10 transition rounded-full pl-10 pr-4 py-2 text-sm w-72 focus:outline-none text-white"
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<SettingsModal />
						</div>
					</header>
				)}
				<Routes>
					<Route path="/" element={<LibraryGrid />} />
					<Route path="/playlist/:id" element={<PlaylistView />} />
				</Routes>
			</div>
		</Layout>
	);
}

export default App;
