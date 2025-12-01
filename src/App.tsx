import { Layout } from './components/Layout';
import { PlayerBar } from './components/PlayerBar';
import { LibraryGrid } from './components/LibraryGrid';
import { useLibraryStore } from './store/useLibraryStore';

function App() {
	const { rootHandle } = useLibraryStore();

	return (
		<Layout bottomBar={<PlayerBar />}>
			<div className="max-w-7xl mx-auto">
				{rootHandle && (
					<header className="flex items-center justify-between mb-8 sticky top-0 z-10 py-4 glass-panel px-6 rounded-2xl mt-2">
						<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
							Library
						</h1>
						<button
							onClick={() => useLibraryStore.getState().scanLibrary()}
							className="text-sm text-white/60 hover:text-white transition"
						>
							Rescan
						</button>
					</header>
				)}
				<LibraryGrid />
			</div>
		</Layout>
	);
}

export default App;
