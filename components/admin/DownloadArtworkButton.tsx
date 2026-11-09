'use client';

import { useState, type ReactNode } from 'react';

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

export default function DownloadArtworkButton({
  url,
  name,
  children,
}: {
  url: string;
  name: string;
  children: ReactNode;
}) {
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download() {
    setDownloading(true);
    setFailed(false);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Artwork could not be downloaded');
      const file = await response.blob();
      if (!file.size || file.type === 'text/html') throw new Error('Artwork file unavailable');

      const sourceExtension = new URL(url).pathname.match(/\.([a-z0-9]{1,8})$/i)?.[1];
      const extension = extensions[file.type] ?? sourceExtension;
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = extension ? `${name}.${extension}` : name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button type="button" className="smAdminArtworkDownload" onClick={download} disabled={downloading}>
        {downloading ? 'Downloading…' : children}
      </button>
      {failed && <small role="alert">Couldn’t download this file. Try again.</small>}
    </>
  );
}
