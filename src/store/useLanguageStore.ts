import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'zh';

type Translations = {
	[key in Language]: {
		[key: string]: string;
	};
};

const translations: Translations = {
	en: {
		// General
		settings: 'Settings',
		language: 'Language',
		theme: 'Theme',
		close: 'Close',

		// Library
		library: 'Library',
		allSongs: 'All Songs',
		albums: 'Albums',
		artists: 'Artists',
		searchPlaceholder: 'Search by artist, album, song...',
		selectFolder: 'Select Music Folder',
		selectFolderDesc:
			'Choose a local directory to scan for music files. Your music never leaves your device.',
		openFolder: 'Open Folder',
		rescan: 'Rescan Library',
		scanning: 'Scanning library...',
		noResults: 'No results found for',
		tryDifferent: 'Try a different search term.',
		unknownArtist: 'Unknown Artist',

		// Playlist
		playlists: 'Playlists',
		createPlaylist: 'Create Playlist',
		newPlaylist: 'New Playlist',
		enterPlaylistName: 'Enter a name for your new playlist:',
		addToPlaylist: 'Add to playlist',
		removeFromPlaylist: 'Remove from playlist',
		deletePlaylist: 'Delete Playlist',
		deletePlaylistConfirm: 'Are you sure you want to delete this playlist?',

		// Lyrics
		lyrics: 'Lyrics',

		// Themes
		atmospheric: 'Atmospheric',
		aesthetic: 'Aesthetic',
		ink: 'Ink',
		animated: 'Animated',

		// Settings
		general: 'General',
		appearance: 'Appearance',
		currentPath: 'Current Library Path',
		changeFolder: 'Change Folder',

		// Player
		setCustomCover: 'Set custom cover',
	},
	zh: {
		// General
		settings: '设置',
		language: '语言',
		theme: '主题',
		close: '关闭',

		// Library
		library: '音乐库',
		allSongs: '所有歌曲',
		albums: '专辑',
		artists: '歌手',
		searchPlaceholder: '搜索歌手、专辑、歌曲...',
		selectFolder: '选择音乐文件夹',
		selectFolderDesc:
			'选择一个本地目录以扫描音乐文件。您的音乐永远不会离开您的设备。',
		openFolder: '打开文件夹',
		rescan: '重新扫描',
		scanning: '正在扫描音乐库...',
		noResults: '未找到结果',
		tryDifferent: '尝试不同的搜索词。',
		unknownArtist: '未知歌手',

		// Playlist
		playlists: '播放列表',
		createPlaylist: '创建歌单',
		newPlaylist: '新建歌单',
		enterPlaylistName: '输入新歌单的名称：',
		addToPlaylist: '添加到歌单',
		removeFromPlaylist: '从歌单移除',
		deletePlaylist: '删除歌单',
		deletePlaylistConfirm: '确定要删除此歌单吗？',

		// Lyrics
		lyrics: '歌词',

		// Themes
		atmospheric: '氛围',
		aesthetic: '唯美',
		ink: '水墨',
		animated: '3D动画',

		// Settings
		general: '常规',
		appearance: '外观',
		currentPath: '当前音乐库路径',
		changeFolder: '更变文件夹',

		// Player
		setCustomCover: '设置自定义封面',
	},
};

interface LanguageState {
	currentLanguage: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set, get) => ({
			currentLanguage: 'en',
			setLanguage: (lang) => set({ currentLanguage: lang }),
			t: (key) => {
				const lang = get().currentLanguage;
				return translations[lang][key] || key;
			},
		}),
		{
			name: 'language-storage',
			partialize: (state) => ({ currentLanguage: state.currentLanguage }),
		}
	)
);
