import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'atmospheric' | 'aesthetic' | 'ink' | 'animated';

interface ThemeState {
	currentTheme: Theme;
	enableCoverArtBackground: boolean;
	setTheme: (theme: Theme) => void;
	toggleCoverArtBackground: () => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			currentTheme: 'atmospheric',
			enableCoverArtBackground: false,
			setTheme: (theme) => set({ currentTheme: theme }),
			toggleCoverArtBackground: () =>
				set((state) => ({
					enableCoverArtBackground: !state.enableCoverArtBackground,
				})),
		}),
		{
			name: 'theme-storage',
		}
	)
);
