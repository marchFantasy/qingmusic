/// <reference types="wicg-file-system-access" />
import type { AudioFile } from '../types';

// Supported audio extensions
const AUDIO_EXTENSIONS = new Set(['mp3', 'flac', 'wav', 'ogg', 'm4a']);

export class FileSystemService {
	async selectDirectory(): Promise<FileSystemDirectoryHandle> {
		try {
			const handle = await window.showDirectoryPicker({
				mode: 'read',
			});
			return handle;
		} catch (error) {
			if ((error as Error).name === 'AbortError') {
				throw new Error('User cancelled directory selection');
			}
			throw error;
		}
	}

	async scanDirectory(handle: FileSystemDirectoryHandle): Promise<AudioFile[]> {
		const audioFiles: AudioFile[] = [];
		await this._scanRecursive(handle, '', audioFiles);
		return audioFiles;
	}

	private async _scanRecursive(
		dirHandle: FileSystemDirectoryHandle,
		pathPrefix: string,
		results: AudioFile[]
	) {
		for await (const [name, handle] of dirHandle.entries()) {
			if (handle.kind === 'file') {
				const ext = name.split('.').pop()?.toLowerCase();
				if (ext && AUDIO_EXTENSIONS.has(ext)) {
					results.push({
						id: `${pathPrefix}/${name}`,
						name,
						path: `${pathPrefix}/${name}`,
						handle: handle as FileSystemFileHandle,
					});
				}
			} else if (handle.kind === 'directory') {
				await this._scanRecursive(
					handle as FileSystemDirectoryHandle,
					`${pathPrefix}/${name}`,
					results
				);
			}
		}
	}

	async getFile(fileHandle: FileSystemFileHandle): Promise<File> {
		return await fileHandle.getFile();
	}
}

export const fileSystem = new FileSystemService();
