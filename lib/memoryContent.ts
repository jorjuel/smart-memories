/**
 * Require a meaningful memory, not a written message specifically.
 * A photograph, voice recording, video or written text is sufficient.
 */
export function hasMeaningfulMemoryContent(value: {
  message?: string | null;
  photo?: boolean;
  audio?: boolean;
  video?: boolean;
}): boolean {
  return Boolean(
    value.message?.trim() ||
    value.photo ||
    value.audio ||
    value.video
  );
}
