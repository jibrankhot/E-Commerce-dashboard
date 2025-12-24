import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * SET value in storage
   */
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * GET value from storage
   */
  get<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /**
   * REMOVE single key
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * CLEAR all storage
   */
  clear(): void {
    localStorage.clear();
  }
}
