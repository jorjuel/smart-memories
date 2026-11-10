import sharp from 'sharp';

export async function boundedBody(request: Request, maxBytes: number) {
  if (Number(request.headers.get('content-length')) > maxBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Response();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Response(new Uint8Array(Buffer.concat(chunks, size)), {
    headers: { 'Content-Type': request.headers.get('content-type') || '' },
  });
}

export async function normaliseCatalogueJpeg(file: Blob) {
  const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 4_000_000 });
  if ((await image.metadata()).format !== 'jpeg') throw new Error('Expected JPEG');
  return image.rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
}
