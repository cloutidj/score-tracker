import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  get<T>(key: string): T | null {
    const savedJSON = localStorage.getItem(key);
    return savedJSON ? (JSON.parse(savedJSON) as T) : null;
  }

  save<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  add<T>(key: string, data: T): void {
    const current = this.getAsArray<T>(key);
    current.push(data);
    this.save(key, current.slice());
  }

  remove<T>(key: string, predicate: (obj: T) => boolean): void {
    const current = this.getAsArray<T>(key);
    const index = current.findIndex(predicate);
    if (index === -1) {
      throw new Error('Object not found to remove');
    }

    current.splice(index, 1);
    this.save(key, current.slice());
  }

  update<T>(key: string, data: T, predicate: (obj: T) => boolean): void {
    const current = this.getAsArray<T>(key);
    const index = current.findIndex(predicate);
    if (index === -1) {
      throw new Error('Object not found to update');
    }

    current[index] = data;
    this.save(key, current.slice());
  }

  private getAsArray<T>(key: string): T[] {
    const current = this.get<T[]>(key);
    if (!Array.isArray(current)) {
      throw new TypeError('Value for the provided key is not an array');
    }

    return current;
  }
}
