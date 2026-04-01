import { generateConnectionId } from './uuid';

const DB_NAME = 'AudioBookConvertDB';
const STORE_NAME = 'chunks';
const DB_VERSION = 1;

export type SynthesisSession = {
    id: string;
    fileName: string;
    chunkSize: number;
    voice: string;
    totalChunks: number;
    createdAt: string;
};

export class PersistenceService {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        if (this.db) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onerror = (event) => {
                reject(new Error(`Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error}`));
            };
        });
    }

    private async ensureInited(): Promise<void> {
        if (!this.db) await this.init();
    }

    async saveChunk(sessionId: string, index: number, data: Uint8Array): Promise<void> {
        await this.ensureInited();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(data, `${sessionId}:${index}`);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to save chunk to IndexedDB'));
        });
    }

    async getChunk(sessionId: string, index: number): Promise<Uint8Array | null> {
        await this.ensureInited();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(`${sessionId}:${index}`);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(new Error('Failed to load chunk from IndexedDB'));
        });
    }

    async getSessionChunksCount(sessionId: string): Promise<number> {
        await this.ensureInited();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const range = IDBKeyRange.bound(`${sessionId}:0`, `${sessionId}:999999`);
            const countRequest = store.count(range);
            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = () => reject(countRequest.error);
        });
    }

    async deleteSession(sessionId: string, totalChunks: number): Promise<void> {
        await this.ensureInited();
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        for (let i = 0; i < totalChunks; i++) {
            store.delete(`${sessionId}:${i}`);
        }
        return new Promise((resolve) => {
            transaction.oncomplete = () => resolve();
        });
    }

    // Helper to generate a deterministic session ID based on conversion parameters
    static generateSessionId(fileName: string, totalChunks: number, voice: string): string {
        // Simple hash/string to identify the unique task
        return `${fileName}_${totalChunks}_${voice.replace(/[^a-zA-Z0-9]/g, '')}`;
    }
}

export const persistence = new PersistenceService();
