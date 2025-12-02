import * as Dialog from '@radix-ui/react-dialog';
import {
	X,
	FolderOpen,
	RefreshCw,
	Settings as SettingsIcon,
} from 'lucide-react';
import { useLanguageStore, type Language } from '../store/useLanguageStore';
import { useThemeStore, type Theme } from '../store/useThemeStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { fileSystem } from '../services/fileSystem';

export function SettingsModal() {
	const { t, currentLanguage, setLanguage } = useLanguageStore();
	const { currentTheme, setTheme } = useThemeStore();
	const { rootHandle, setRootHandle, scanLibrary } = useLibraryStore();

	const handleOpenFolder = async () => {
		try {
			const handle = await fileSystem.selectDirectory();
			setRootHandle(handle);
			scanLibrary();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<button className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition">
					<SettingsIcon size={20} />
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[85vh] bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl p-6 z-50 text-white overflow-y-auto focus:outline-none">
					<div className="flex items-center justify-between mb-6">
						<Dialog.Title className="text-xl font-bold">{t('settings')}</Dialog.Title>
						<Dialog.Close asChild>
							<button className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition">
								<X size={20} />
							</button>
						</Dialog.Close>
					</div>

					<div className="space-y-8">
						{/* General Section */}
						<section>
							<h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
								{t('general')}
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-white/80">{t('language')}</span>
									<div className="flex bg-white/5 rounded-lg p-1">
										{(['en', 'zh'] as Language[]).map((lang) => (
											<button
												key={lang}
												onClick={() => setLanguage(lang)}
												className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
													currentLanguage === lang
														? 'bg-white/10 text-white shadow-sm'
														: 'text-white/40 hover:text-white/60'
												}`}
											>
												{lang === 'en' ? 'English' : '中文'}
											</button>
										))}
									</div>
								</div>
							</div>
						</section>

						{/* Appearance Section */}
						<section>
							<h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
								{t('appearance')}
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-white/80">{t('theme')}</span>
								</div>
								<div className="grid grid-cols-2 gap-3">
									{(['atmospheric', 'aesthetic', 'ink', 'animated'] as Theme[]).map(
										(theme) => (
											<button
												key={theme}
												onClick={() => setTheme(theme)}
												className={`px-4 py-3 rounded-xl text-sm font-medium transition border text-left ${
													currentTheme === theme
														? 'bg-white/10 border-primary/50 text-white'
														: 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
												}`}
											>
												{t(theme)}
											</button>
										)
									)}
								</div>
							</div>
						</section>

						{/* Library Section */}
						<section>
							<h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
								{t('library')}
							</h3>
							<div className="bg-white/5 rounded-xl p-4 space-y-4">
								<div>
									<p className="text-xs text-white/40 mb-1">{t('currentPath')}</p>
									<p
										className="text-sm font-mono text-white/80 truncate"
										title={rootHandle?.name}
									>
										{rootHandle?.name || 'No folder selected'}
									</p>
								</div>
								<div className="flex gap-3">
									<button
										onClick={handleOpenFolder}
										className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
									>
										<FolderOpen size={16} />
										{t('changeFolder')}
									</button>
									<button
										onClick={() => scanLibrary()}
										className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
									>
										<RefreshCw size={16} />
										{t('rescan')}
									</button>
								</div>
							</div>
						</section>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
