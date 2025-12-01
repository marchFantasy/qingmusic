import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'QingMusicDB';
const STORE_NAME = 'album-covers';

interface MyDB extends DBSchema {
	[STORE_NAME]: {
		key: string; // album name
		value: Blob; // image blob
	};
}

class CoverArtService {
	private dbPromise: Promise<IDBPDatabase<MyDB>>;

	constructor() {
		this.dbPromise = openDB<MyDB>(DB_NAME, 1, {
			upgrade(db) {
				db.createObjectStore(STORE_NAME);
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
