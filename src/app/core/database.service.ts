import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  get<T>(key: string): T | null {
    const savedJSON = localStorage.getItem(key);
    if (!savedJSON) {
      return null;
    }
    try {
      return JSON.parse(savedJSON) as T;
    } catch {
      console.warn(`Corrupt JSON for key "${key}"; discarding it.`);
      localStorage.removeItem(key);
      return null;
    }
  }

  save<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  delete(key: string): void {
    localStorage.removeItem(key);
  }

  /** Returns the resulting array so callers can update in-memory state without a re-read. */
  add<T>(key: string, data: T): T[] {
    const current = this.getAsArray<T>(key);
    current.push(data);
    const next = current.slice();
    this.save(key, next);
    return next;
  }

  /** No-ops (returning the unchanged array) if nothing matches the predicate — a stale
   *  double-click or a cross-tab race is an expected, recoverable case, not an error.
   *  Returns the resulting array so callers can update in-memory state without a re-read. */
  remove<T>(key: string, predicate: (obj: T) => boolean): T[] {
    const current = this.getAsArray<T>(key);
    const index = current.findIndex(predicate);
    if (index === -1) {
      return current;
    }

    current.splice(index, 1);
    const next = current.slice();
    this.save(key, next);
    return next;
  }

  /** No-ops if nothing matches the predicate — see {@link remove}. */
  update<T>(key: string, data: T, predicate: (obj: T) => boolean): T[] {
    const current = this.getAsArray<T>(key);
    const index = current.findIndex(predicate);
    if (index === -1) {
      return current;
    }

    current[index] = data;
    const next = current.slice();
    this.save(key, next);
    return next;
  }

  /** Missing key or wrong-shaped data both normalize to `[]` so `add`/`remove`/`update`
   *  work on a never-seeded key instead of crashing. */
  private getAsArray<T>(key: string): T[] {
    const current = this.get<T[]>(key);
    if (current === null) {
      return [];
    }
    if (!Array.isArray(current)) {
      console.warn(`Value for key "${key}" is not an array; discarding it.`);
      return [];
    }

    return current;
  }
}
