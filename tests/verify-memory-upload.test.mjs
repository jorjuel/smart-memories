import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifyMemoryUpload } from '../lib/verifyMemoryUpload.ts';

const path = 'memory-uploads/00000000-0000-4000-8000-000000000001.webm';

function storageWith(info) {
  return {
    storage: {
      from: () => ({
        info: async () => ({ data: info, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: `https://example.test/${path}` } }),
      }),
    },
  };
}

test('verified storage metadata accepts supported media above the app request limit', async () => {
  const client = storageWith({ size: 8 * 1024 * 1024, contentType: 'audio/webm;codecs=opus' });
  assert.deepEqual(await verifyMemoryUpload(client, path, 'audio'), {
    url: `https://example.test/${path}`,
    mimeType: 'audio/webm',
  });
});

test('storage references reject legacy paths, missing files, mismatched types, and invalid sizes', async () => {
  const audio = { size: 500, contentType: 'audio/webm' };
  const invalidReferences = [
    [storageWith(audio), 'ABCDEFG2/audio.webm', 'audio'],
    [storageWith(null), path, 'audio'],
    [storageWith(audio), path, 'image'],
    [storageWith({ contentType: 'audio/webm' }), path, 'audio'],
    [storageWith({ ...audio, size: 26 * 1024 * 1024 }), path, 'audio'],
  ];
  for (const args of invalidReferences) {
    const result = await verifyMemoryUpload(...args);
    assert.equal(typeof result.error, 'string');
    assert.equal(result.url, undefined);
  }
});
