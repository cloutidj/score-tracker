export class Util {
  static distinct<T, K>(array: T[], predicate: (obj: T) => K): T[] {
    const map = new Map<K, T>();

    array.forEach((obj) => {
      const key = predicate(obj);
      if (!map.has(key)) {
        map.set(key, obj);
      }
    });

    return Array.from(map.values());
  }
}
