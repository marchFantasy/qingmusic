import { useEffect } from 'react';
import { useLibraryStore } from '../store/useLibraryStore';

export function useFocusRevalidate() {
	const { scanLibrary, rootHandle, isScanning } = useLibraryStore();

	useEffect(() => {
		const onFocus = () => {
			if (rootHandle && !isScanning) {
				console.log('Window focused, rescanning library...');
				scanLibrary();
			}
		};

		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
	}, [rootHandle, isScanning, scanLibrary]);
}
