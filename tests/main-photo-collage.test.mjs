import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  replaceMainPhoto,
  appendExtraPhotos,
  removeExtraPhoto,
  reorderExtraPhotos,
} from '../lib/primaryPhotoCollage.ts';

const main = { id: 'main' };
const extra1 = { id: 'extra-one' };
const extra2 = { id: 'extra-two' };

test('adding a main photo starts the collage at slot 1', () => {
  assert.deepEqual(replaceMainPhoto([], main), [main]);
});

test('extra photos append without altering the main photo or previous extras', () => {
  const first = appendExtraPhotos([main], [extra1], 4);
  const second = appendExtraPhotos(first, [extra2], 4);
  assert.deepEqual(second, [main, extra1, extra2]);
  assert.equal(second[0], main);
  assert.deepEqual(first, [main, extra1]);
});

test('replacing the main photo leaves all existing extra photos unchanged', () => {
  const newMain = { id: 'new-main' };
  const result = replaceMainPhoto([main, extra1, extra2], newMain);
  assert.deepEqual(result, [newMain, extra1, extra2]);
});

test('remove/reorder actions cannot change or delete the main photo', () => {
  const gallery = [main, extra1, extra2];
  assert.deepEqual(removeExtraPhoto(gallery, 0), gallery);
  assert.deepEqual(removeExtraPhoto(gallery, 1), [main, extra2]);
  assert.deepEqual(reorderExtraPhotos(gallery, 0, 2), gallery);
  assert.deepEqual(reorderExtraPhotos(gallery, 1, 2), [main, extra2, extra1]);
  assert.deepEqual(gallery, [main, extra1, extra2]);
});

test('maximum photo count includes the main photo and rejects excess extras', () => {
  assert.throws(() => appendExtraPhotos([main], [extra1], 1), /too many photos/i);
  assert.throws(() => appendExtraPhotos([main, extra1], [extra2], 2), /too many photos/i);
  assert.throws(() => appendExtraPhotos([], [extra1], 4), /main photo/i);
  assert.deepEqual(appendExtraPhotos([main], [extra1], 2), [main, extra1]);
});

test('coaster occasion section is hidden while other products retain occasion choices', () => {
  const personaliser = readFileSync(new URL('../components/ProductPersonaliser.tsx', import.meta.url), 'utf8');
  assert.match(personaliser, /!isCoaster && \(\s*<div className="smWizardSection">\s*<h3>\s*What is it for\?/);
  assert.match(personaliser, /setGiftPhotos\(appendExtraPhotos\(giftPhotos, extras, maxGiftPhotos\)\)/);
  assert.match(personaliser, /setGiftPhotos\(replaceMainPhoto\(giftPhotos, newMain\)\)/);
  assert.match(personaliser, /lockFirstPhoto/);
});

test('collage editor prevents dragging main image out of slot 1', () => {
  const editor = readFileSync(new URL('../components/PhotoCollageEditor.tsx', import.meta.url), 'utf8');
  assert.match(editor, /lockFirstPhoto && \(first === 0 \|\| second === 0\)/);
  assert.match(editor, /draggable=\{!lockFirstPhoto \|\| index !== 0\}/);
});
