/// <reference types="wicg-file-system-access" />
import type { AudioFile } from '../types';
import { parseBlob } from 'music-metadata';

// Supported audio extensions
const AUDIO_EXTENSIONS = new Set(['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac']);

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
			const currentPath = pathPrefix ? `${pathPrefix}/${name}` : name;
			if (handle.kind === 'file') {
				const ext = name.split('.').pop()?.toLowerCase();
				if (ext && AUDIO_EXTENSIONS.has(ext)) {
					try {
						const file = await handle.getFile();
						const metadata = await parseBlob(file);
						const common = metadata.common;

						let coverUrl: string | undefined = undefined;
						if (common.picture?.length) {
							const picture = common.picture[0];
							const blob = new Blob([new Uint8Array(picture.data)], {
								type: picture.format,
							});
							coverUrl = URL.createObjectURL(blob);
						}

						results.push({
							id: currentPath,
							name,
							path: currentPath,
							handle: handle as FileSystemFileHandle,
							metadata: {
								title: common.title,
								artist: common.artist,
								album: common.album,
								duration: metadata.format.duration,
								cover: coverUrl,
							},
						});
					} catch (error) {
						console.warn(`Could not parse metadata for ${name}:`, error);
						// Still add the file, just without metadata
						results.push({
							id: currentPath,
							name,
							path: currentPath,
							handle: handle as FileSystemFileHandle,
						});
					}
				}
			} else if (handle.kind === 'directory') {
				await this._scanRecursive(
					handle as FileSystemDirectoryHandle,
					currentPath,
					results
				);
			}
		}
	}

	async getFile(fileHandle: FileSystemFileHandle): Promise<File> {
		return await fileHandle.getFile();
	}

	async getFileByPath(
		rootHandle: FileSystemDirectoryHandle,
		path: string
	): Promise<File | undefined> {
		const parts = path.split('/');
		const fileName = parts.pop();
		if (!fileName) return undefined;

		let currentHandle = rootHandle;
		for (const part of parts) {
			try {
				currentHandle = await currentHandle.getDirectoryHandle(part);
			} catch {
				return undefined;
			}
		}

		try {
			const fileHandle = await currentHandle.getFileHandle(fileName);
			return await fileHandle.getFile();
		} catch {
			return undefined;
		}
	}
}

export const fileSystem = new FileSystemService();
