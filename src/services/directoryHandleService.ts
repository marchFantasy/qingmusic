import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { DirectoryHandle } from '../types';

const DB_NAME = 'QingMusicDB';
const STORE_NAME = 'directory-handles';
const HANDLE_KEY = 'root-directory';

interface MyDB extends DBSchema {
	[STORE_NAME]: {
		key: string;
		value: DirectoryHandle;
	};
}

class DirectoryHandleService {
	private dbPromise: Promise<IDBPDatabase<MyDB>>;

	constructor() {
		this.dbPromise = openDB<MyDB>(DB_NAME, 2, {
			upgrade(db, oldVersion) {
				if (oldVersion < 2) {
					if (!db.objectStoreNames.contains(STORE_NAME)) {
						db.createObjectStore(STORE_NAME);
					}
				}
				// Note: We are using the same DB as coverArtService,
				// so versioning needs to be managed carefully.
			},
		});
	}

	async saveHandle(handle: DirectoryHandle): Promise<void> {
		const db = await this.dbPromise;
		await db.put(STORE_NAME, handle, HANDLE_KEY);
	}

	async getHandle(): Promise<DirectoryHandle | undefined> {
		const db = await this.dbPromise;
		return db.get(STORE_NAME, HANDLE_KEY);
	}
}

export const directoryHandleService = new DirectoryHandleService();
