import { Injectable } from '@angular/core';

/* istanbul ignore file */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public get(key: string): any {
    const savedJSON = localStorage.getItem(key);
    return savedJSON ? JSON.parse(savedJSON) : null;
  }

  public save(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  public add(key: string, data: any): void {
    const current = this.getAsArrray(key);
    current.push(data);
    this.save(key, current.slice());
  }

  public remove(key: string, predicate: (obj: any) => boolean) {
    const current = this.getAsArrray(key);
    const toRemove = current.findIndex(predicate);
    if (!toRemove) {
      throw new Error('Object not found to remove');
    }

    current.splice(toRemove, 1);
    this.save(key, current.slice());
  }

  public update(key: string, data: any, predicate: (obj: any) => boolean) {
    const current = this.getAsArrray(key);
    const toUpdate = current.findIndex(predicate);
    if (!toUpdate) {
      throw new Error('Object not found to update');
    }

    current[toUpdate] = data;
    this.save(key, current.slice());
  }

  private getAsArrray(key): any[] {
    const current = this.get(key);
    if (!Array.isArray(current)) {
      throw new TypeError('Value for the provided key is not an array');
    }

    return current;
  }
}
