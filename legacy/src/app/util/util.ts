export class Util {
  public static distinct(array: any[], predicate: (obj: any) => any): any[] {
    const map = new Map<any, any>();

    array.forEach(obj => {
      const key = predicate(obj);
      if (!map.has(key)) {
        map.set(key, obj);
      }
    });

    return Array.from(map.keys()).map(k => map.get(k));
  }
}
