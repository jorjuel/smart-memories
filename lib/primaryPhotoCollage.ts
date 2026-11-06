/**
 * Photo slot 1 is the main Smart Memory photo.
 * Extra gift/collage images are always appended after it.
 * These helpers never mutate the current selection.
 */
export function replaceMainPhoto<T>(current: readonly T[], main: T): T[] {
  return [main, ...current.slice(1)];
}

export function appendExtraPhotos<T>(
  current: readonly T[],
  extras: readonly T[],
  maximum: number,
): T[] {
  if (!current.length) throw new Error('Add a main photo before extra photos.');
  if (!Number.isInteger(maximum) || maximum < 1 ||
      current.length + extras.length > maximum) {
    throw new Error('Too many photos for the selected gift.');
  }
  return [...current, ...extras];
}

export function removeExtraPhoto<T>(current: readonly T[], index: number): T[] {
  // Main photo is changed only from the dedicated main-photo controls.
  if (!Number.isInteger(index) || index < 1 || index >= current.length) {
    return [...current];
  }
  return current.filter((_, photoIndex) => photoIndex !== index);
}

export function reorderExtraPhotos<T>(
  current: readonly T[],
  first: number,
  second: number,
): T[] {
  if (!Number.isInteger(first) || !Number.isInteger(second) ||
      first < 1 || second < 1 ||
      first >= current.length || second >= current.length) {
    return [...current];
  }
  const next = [...current];
  [next[first], next[second]] = [next[second], next[first]];
  return next;
}
