import { Injectable, inject, isDevMode, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { openDB, type IDBPDatabase } from 'idb';
import type { WeatherData, WeatherCache } from '../models/weather.model';

const DB_NAME = 'weather-cache';
const STORE_NAME = 'weather';
const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private readonly platformId = inject(PLATFORM_ID);
  private db: IDBPDatabase | null = null;
  readonly ready = signal(false);
  private initPromise: Promise<void> | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPromise = this.initDB();
    }
  }

  private async initDB(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        },
      });
      this.ready.set(true);
    } catch (err: unknown) {
      if (isDevMode()) {
        console.warn('CacheService: IndexedDB init failed', err);
      }
    }
  }

  async saveWeather(data: WeatherData): Promise<void> {
    if (!this.db || !this.ready()) {
      await this.initPromise;
    }
    if (!this.db) return;

    const cache: WeatherCache & { id: string } = {
      id: 'current',
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    try {
      await this.db.put(STORE_NAME, cache);
    } catch (err: unknown) {
      if (isDevMode()) {
        console.warn('CacheService: save failed', err);
      }
    }
  }

  async getWeather(): Promise<WeatherData | null> {
    if (!this.db || !this.ready()) {
      await this.initPromise;
    }
    if (!this.db) return null;

    try {
      const cached = await this.db.get(STORE_NAME, 'current');
      if (cached) {
        return cached.data as WeatherData;
      }
    } catch (err: unknown) {
      if (isDevMode()) {
        console.warn('CacheService: read failed', err);
      }
    }
    return null;
  }

  async clear(): Promise<void> {
    if (!this.db || !this.ready()) {
      await this.initPromise;
    }
    if (!this.db) return;

    try {
      await this.db.delete(STORE_NAME, 'current');
    } catch (err: unknown) {
      if (isDevMode()) {
        console.warn('CacheService: clear failed', err);
      }
    }
  }
}
