import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'QingMusicDB';
const STORE_NAME = 'album-covers';

interface MyDB extends DBSchema {
	[STORE_NAME]: {
		key: string; // album name
		value: Blob; // image blob
	};
	'directory-handles': {
		key: string;
		value: FileSystemDirectoryHandle;
	};
}

class CoverArtService {
	private dbPromise: Promise<IDBPDatabase<MyDB>>;

	constructor() {
		this.dbPromise = openDB<MyDB>(DB_NAME, 2, {
			upgrade(db, oldVersion) {
				// 版本 1: 创建 album-covers store
				if (oldVersion < 1) {
					if (!db.objectStoreNames.contains(STORE_NAME)) {
						db.createObjectStore(STORE_NAME);
					}
				}
				// 版本 2: 创建 directory-handles store
				if (oldVersion < 2) {
					if (!db.objectStoreNames.contains('directory-handles')) {
						db.createObjectStore('directory-handles');
					}
				}
			},
		});
	}

	async setCover(albumName: string, imageBlob: Blob): Promise<void> {
		const db = await this.dbPromise;
		await db.put(STORE_NAME, imageBlob, albumName);
	}

	async getCover(albumName: string): Promise<Blob | undefined> {
		const db = await this.dbPromise;
		return db.get(STORE_NAME, albumName);
	}

	async getCoverUrl(albumName: string): Promise<string | undefined> {
		const blob = await this.getCover(albumName);
		if (blob) {
			return URL.createObjectURL(blob);
		}
		return undefined;
	}
}

export const coverArtService = new CoverArtService();
