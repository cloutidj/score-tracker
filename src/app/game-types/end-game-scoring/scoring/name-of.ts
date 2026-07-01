import { CategoryNames } from '../_shared/models/category-names';

/** Resolve a category id to its display name for rule descriptions, or a neutral fallback. */
export function nameOf(names: CategoryNames, id: string): string {
  return names.get(id) ?? '(category)';
}
