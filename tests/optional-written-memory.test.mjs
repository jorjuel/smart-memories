import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { hasMeaningfulMemoryContent } from '../lib/memoryContent.ts';

test('voice alone is a valid memory without written text', () => {
  assert.equal(hasMeaningfulMemoryContent({ message: '', audio: true }), true);
  assert.equal(hasMeaningfulMemoryContent({ message: '   ', audio: true }), true);
});

test('video alone or photo alone are valid without written text', () => {
  assert.equal(hasMeaningfulMemoryContent({ message: null, video: true }), true);
  assert.equal(hasMeaningfulMemoryContent({ message: '', photo: true }), true);
});

test('written-only memories remain supported', () => {
  assert.equal(hasMeaningfulMemoryContent({ message: 'Happy Birthday!' }), true);
});

test('empty memories are rejected even if sender or recipient is present', () => {
  assert.equal(hasMeaningfulMemoryContent({ message: '' }), false);
  assert.equal(hasMeaningfulMemoryContent({ message: '  \n ' }), false);
});

test('form labels written message as optional and API validates same content rule', () => {
  const create = readFileSync(new URL('../app/create/page.tsx', import.meta.url), 'utf8');
  const api = readFileSync(new URL('../app/api/memories/route.ts', import.meta.url), 'utf8');
  assert.match(create, /Written message <small>\(optional\)<\/small>/);
  assert.match(create, /hasMeaningfulMemoryContent\(\{/);
  assert.match(api, /hasMeaningfulMemoryContent\(\{/);
});

test('recipient page hides unneeded letter and body when media stands alone', () => {
  const recipient = readFileSync(new URL('../components/recipient/RecipientMemoryExperience.tsx', import.meta.url), 'utf8');
  assert.match(recipient, /hasLetterContent && \(/);
  assert.match(recipient, /hasStoryBody && \(/);
  assert.match(recipient, /smRecipientUnifiedBodyPhotoOnly/);
});
