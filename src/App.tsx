import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PlayerBar } from './components/PlayerBar';
import { LibraryGrid } from './components/LibraryGrid';
import { useLibraryStore } from './store/useLibraryStore';
import { useThemeStore } from './store/useThemeStore';
import { Search } from 'lucide-react';
import { PlaylistView } from './components/PlaylistView';
import { ThemeSelector } from './components/ThemeSelector';

function App() {
	const { rootHandle, setSearchTerm, loadRootHandle } = useLibraryStore();
	const { currentTheme } = useThemeStore();

	useEffect(() => {
		loadRootHandle();
	}, [loadRootHandle]);

	useEffect(() => {
		document.body.setAttribute('data-theme', currentTheme);
	}, [currentTheme]);

	return (
		<Layout bottomBar={<PlayerBar />}>
			<div className="max-w-7xl mx-auto">
				{rootHandle && (
					<header className="flex items-center justify-between mb-8 sticky top-0 z-10 py-4 glass-panel px-6 rounded-2xl mt-2">
						<div className="flex items-center gap-6">
							<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
								Search
							</h1>
							<div className="relative">
								<Search
									className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
									size={18}
								/>
								<input
									type="text"
									placeholder="Search by artist, album, song..."
									className="bg-white/5 border border-transparent hover:border-white/10 focus:border-white/20 focus:bg-white/10 transition rounded-full pl-10 pr-4 py-2 text-sm w-72 focus:outline-none text-white"
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<ThemeSelector />
							<button
								onClick={() => useLibraryStore.getState().scanLibrary()}
								className="text-sm text-white/60 hover:text-white transition"
							>
								Rescan
							</button>
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
