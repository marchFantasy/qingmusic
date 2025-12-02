import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'atmospheric' | 'aesthetic' | 'ink' | 'animated';

interface ThemeState {
	currentTheme: Theme;
	setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			currentTheme: 'atmospheric',
			setTheme: (theme) => set({ currentTheme: theme }),
		}),
		{
			name: 'theme-storage',
		}
	)
);
