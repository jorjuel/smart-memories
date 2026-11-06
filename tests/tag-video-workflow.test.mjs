import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const file = (path) => readFileSync(new URL(path, root), 'utf8');

test('tag-only memory form offers photo+voice and video with sound', () => {
  const create = file('app/create/page.tsx');
  assert.match(create, /memoryOnly && \(/);
  assert.match(create, /Photo \+ voice message/);
  assert.match(create, /Video with sound/);
  assert.match(create, /uploadMemoryMedia\(video, 'video'\)/);
  assert.match(create, /formData\.set\('videoPath', videoPath\)/);
});

test('upload pipeline accepts video and persists linked video URL', () => {
  const signer = file('app/api/memory-upload/route.ts');
  const upload = file('lib/memoryMediaUpload.ts');
  const api = file('app/api/memories/route.ts');
  for (const mime of ['video/mp4','video/quicktime','video/webm']) {
    assert.ok(signer.includes(mime), `Signed upload must allow ${mime}`);
    assert.ok(upload.includes(mime), `Client must allow ${mime}`);
  }
  assert.match(api, /field: 'videoPath', kind: 'video'/);
  assert.match(api, /video_url:\s*videoUrl/);
  assert.match(api, /if \(entry\.kind === 'video'\) videoUrl/);
});

test('recipient renders native inline video and a tap-to-play audio control', () => {
  const video = file('components/recipient/MemoryVideo.tsx');
  const audio = file('components/recipient/MemoryAudio.tsx');
  assert.match(video, /playsInline/);
  assert.match(video, /preload="auto"/);
  assert.match(audio, /smRecipientInlinePlayButton/);
  assert.match(audio, /preload="auto"/);
});
