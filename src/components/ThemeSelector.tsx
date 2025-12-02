import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Palette, Check } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import type { Theme } from '../store/useThemeStore';

const themes: { id: Theme; name: string }[] = [
	{ id: 'atmospheric', name: 'Atmospheric' },
	{ id: 'aesthetic', name: 'Aesthetic' },
	{ id: 'ink', name: 'Ink' },
	{ id: 'animated', name: 'Animated' },
];

export function ThemeSelector() {
	const { currentTheme, setTheme } = useThemeStore();

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition">
					<Palette size={20} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					sideOffset={5}
					className="glass border border-white/10 rounded-lg shadow-2xl text-sm text-white/90 py-1 w-40 z-50"
				>
					<DropdownMenu.Label className="px-3 py-2 text-xs text-white/50 uppercase tracking-wider font-semibold">
						Select Theme
					</DropdownMenu.Label>
					<DropdownMenu.Separator className="h-px bg-white/10 my-1" />
					{themes.map((theme) => (
						<DropdownMenu.Item
							key={theme.id}
							className="px-3 py-2 cursor-pointer hover:bg-white/10 flex items-center justify-between outline-none"
							onSelect={() => setTheme(theme.id)}
						>
							{theme.name}
							{currentTheme === theme.id && (
								<Check size={14} className="text-primary" />
							)}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
