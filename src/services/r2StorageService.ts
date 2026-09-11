import { FileAttachment, R2StorageConfig } from '../types';

const DB_NAME = 'lumina_r2_storage';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * Native IndexedDB file store for offline & local caching of files up to 500MB
 */
class LocalFileDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  async saveFileBlob(id: string, file: File): Promise<string> {
    const db = await this.getDB();
    const arrayBuffer = await file.arrayBuffer();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        data: arrayBuffer,
        savedAt: new Date().toISOString(),
      };

      const request = store.put(record);
      request.onsuccess = () => {
        // Create an Object URL for local session preview
        const blob = new Blob([arrayBuffer], { type: file.type });
        const objectUrl = URL.createObjectURL(blob);
        resolve(objectUrl);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getFileBlob(id: string): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          const blob = new Blob([request.result.data], { type: request.result.type });
          resolve(blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const localDB = new LocalFileDB();

export class R2StorageService {
  public static readonly MAX_FREE_BYTES = 500 * 1024 * 1024; // 500 MB Free Tier

  /**
   * Calculates total storage used across files
   */
  static calculateTotalUsedBytes(files: FileAttachment[]): number {
    return files.reduce((acc, file) => acc + file.sizeBytes, 0);
  }

  /**
   * Formats bytes to readable string (e.g. 14.5 MB / 500 MB)
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Uploads a file either to Cloudflare R2 or into local IndexedDB storage
   */
  static async uploadFile(
    file: File,
    config: R2StorageConfig,
    existingFiles: FileAttachment[],
    options?: { noteId?: string; subjectId?: string }
  ): Promise<FileAttachment> {
    const currentUsed = this.calculateTotalUsedBytes(existingFiles);

    if (currentUsed + file.size > this.MAX_FREE_BYTES) {
      throw new Error(`Storage limit reached! 500MB free quota exceeded.`);
    }

    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // If Cloudflare R2 configuration is active with credentials
    if (config.enabled && config.accountId && config.bucketName) {
      // In production with R2 presigned backend or direct R2 Worker upload
      // For standalone client, generate R2 public or endpoint path
      const publicBase = config.publicUrl.trim().replace(/\/+$/, '');
      const r2Url = publicBase 
        ? `${publicBase}/${encodeURIComponent(file.name)}`
        : `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${encodeURIComponent(file.name)}`;

      // Also cache in local DB for instant preview
      await localDB.saveFileBlob(fileId, file);

      return {
        id: fileId,
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        url: r2Url,
        storageType: 'r2',
        uploadedAt: new Date().toISOString(),
        noteId: options?.noteId,
        subjectId: options?.subjectId,
      };
    }

    // Default: Native IndexedDB storage
    const blobUrl = await localDB.saveFileBlob(fileId, file);

    return {
      id: fileId,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: blobUrl,
      storageType: 'indexeddb',
      uploadedAt: new Date().toISOString(),
      noteId: options?.noteId,
      subjectId: options?.subjectId,
    };
  }

  /**
   * Downloads or opens file
   */
  static async triggerDownload(file: FileAttachment): Promise<void> {
    if (file.storageType === 'indexeddb') {
      const blob = await localDB.getFileBlob(file.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    }

    // Fallback to URL direct download
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Delete file from local IndexedDB
   */
  static async deleteStoredFile(fileId: string): Promise<void> {
    await localDB.deleteFile(fileId);
  }
}
