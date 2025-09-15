// Offline Service for Educational RPG Tutor
// Handles offline functionality, data caching, and sync

interface OfflineData {
  characterProgress: CharacterProgressUpdate[];
  questionResponses: QuestionResponse[];
  achievements: Achievement[];
  lastSync: number;
}

interface CharacterProgressUpdate {
  characterId: string;
  xpGained: number;
  statsChanged: Record<string, number>;
  timestamp: number;
  synced: boolean;
}

interface QuestionResponse {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  xpEarned: number;
  timestamp: number;
  synced: boolean;
}

class OfflineService {
  private dbName = 'educational-rpg-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Character progress store
        if (!db.objectStoreNames.contains('characterProgress')) {
          const progressStore = db.createObjectStore('characterProgress', {
            keyPath: 'id',
            autoIncrement: true
          });
          progressStore.createIndex('characterId', 'characterId', { unique: false });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
          progressStore.createIndex('synced', 'synced', { unique: false });
        }

        // Question responses store
        if (!db.objectStoreNames.contains('questionResponses')) {
          const responsesStore = db.createObjectStore('questionResponses', {
            keyPath: 'id',
            autoIncrement: true
          });
          responsesStore.createIndex('questionId', 'questionId', { unique: false });
          responsesStore.createIndex('timestamp', 'timestamp', { unique: false });
          responsesStore.createIndex('synced', 'synced', { unique: false });
        }

        // Cached data store
        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', {
            keyPath: 'key'
          });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('priority', 'priority', { unique: false });
        }
      };
    });
  }

  // Character progress methods
  async saveCharacterProgress(progress: Omit<CharacterProgressUpdate, 'synced'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['characterProgress'], 'readwrite');
    const store = transaction.objectStore('characterProgress');

    const progressWithSync: CharacterProgressUpdate = {
      ...progress,
      synced: false
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(progressWithSync);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Register for background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('character-progress-sync');
    }
  }

  async getUnsyncedCharacterProgress(): Promise<CharacterProgressUpdate[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['characterProgress'], 'readonly');
    const store = transaction.objectStore('characterProgress');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markCharacterProgressSynced(ids: number[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['characterProgress'], 'readwrite');
    const store = transaction.objectStore('characterProgress');

    const promises = ids.map(id => {
      return new Promise<void>((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const record = getRequest.result;
          if (record) {
            record.synced = true;
            const putRequest = store.put(record);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    });

    await Promise.all(promises);
  }

  // Question response methods
  async saveQuestionResponse(response: Omit<QuestionResponse, 'synced'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['questionResponses'], 'readwrite');
    const store = transaction.objectStore('questionResponses');

    const responseWithSync: QuestionResponse = {
      ...response,
      synced: false
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(responseWithSync);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('question-responses-sync');
    }
  }

  async getUnsyncedQuestionResponses(): Promise<QuestionResponse[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['questionResponses'], 'readonly');
    const store = transaction.objectStore('questionResponses');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Cache management
  async cacheData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');

    const cacheEntry = {
      key,
      data,
      expiry: Date.now() + (ttlMinutes * 60 * 1000),
      timestamp: Date.now()
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Connection status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Sync management
  async syncAllData(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      await this.syncCharacterProgress();
      await this.syncQuestionResponses();
      console.log('All data synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  private async syncCharacterProgress(): Promise<void> {
    const unsyncedProgress = await this.getUnsyncedCharacterProgress();
    
    if (unsyncedProgress.length === 0) return;

    try {
      const response = await fetch('/api/sync/character-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unsyncedProgress)
      });

      if (response.ok) {
        const syncedIds = unsyncedProgress.map((_, index) => index + 1);
        await this.markCharacterProgressSynced(syncedIds);
      } else {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to sync character progress:', error);
      throw error;
    }
  }

  private async syncQuestionResponses(): Promise<void> {
    const unsyncedResponses = await this.getUnsyncedQuestionResponses();
    
    if (unsyncedResponses.length === 0) return;

    try {
      const response = await fetch('/api/sync/question-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unsyncedResponses)
      });

      if (response.ok) {
        // Mark as synced (implementation similar to character progress)
        console.log('Question responses synced');
      } else {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to sync question responses:', error);
      throw error;
    }
  }

  // Cleanup expired cache
  async cleanupExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    const index = store.index('expiry');

    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);

    await new Promise<void>((resolve, reject) => {
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

// Initialize on module load
offlineService.initialize().catch(console.error);

// Auto-sync when coming back online
window.addEventListener('online', () => {
  offlineService.syncAllData().catch(console.error);
});

// Cleanup expired cache periodically
setInterval(() => {
  offlineService.cleanupExpiredCache().catch(console.error);
}, 5 * 60 * 1000); // Every 5 minutes