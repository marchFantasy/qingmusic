export interface AudioMetadata {
	title?: string;
	artist?: string;
	album?: string;
	cover?: string; // Blob URL or base64
	duration?: number;
}

export interface AudioFile {
	id: string; // Unique ID (can be path)
	name: string;
	path: string; // Relative path from root
	handle: FileSystemFileHandle;
	metadata?: AudioMetadata;
}

export type DirectoryHandle = FileSystemDirectoryHandle;
