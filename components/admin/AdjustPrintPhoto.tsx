'use client';

import { useEffect, useRef, useState } from 'react';
import { paint } from '../SlateSinglePageCustomiser';

type Props = {
  photoUrl: string;
  artworkUrl: string;
  productName: string;
  isKeyring: boolean;
  details: Record<string, unknown>;
};

type Orientation = 'original' | 'portrait' | 'landscape';

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Couldn’t load the original photo or print file.'));
    image.src = url;
  });
}

export default function AdjustPrintPhoto({ photoUrl, artworkUrl, productName, isKeyring, details }: Props) {
  const number = (value: unknown, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const wording = (value: unknown) => typeof value === 'string' ? value : '';
  const originalX = number(details.photoOffsetX, 0);
  const originalY = number(details.photoOffsetY, 0);
  const originalZoom = number(details.photoZoom, 1);
  const [x, setX] = useState(originalX);
  const [y, setY] = useState(originalY);
  const [zoom, setZoom] = useState(originalZoom);
  const [orientation, setOrientation] = useState<Orientation>('original');
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<{ photo: HTMLImageElement; artwork: HTMLImageElement }>();
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const layout = details.wording;
  const way = !isKeyring && (layout === 'top' || layout === 'bottom' || layout === 'both' || layout === 'paragraph')
    ? layout : 'none';
  const rotation = number(details.photoRotation, 0);
  const fit = isKeyring || details.photoFit === 'cover' ? 'cover' : 'contain';
  const round = isKeyring && details.keyringShape === 'Round';
  const top = wording(details.topText);
  const bottom = wording(details.bottomText);
  const dedication = wording(details.paragraph);

  useEffect(() => {
    if (!open || assets) return;
    let active = true;
    setError('');
    Promise.all([loadImage(photoUrl), loadImage(artworkUrl)]).then(([photo, artwork]) => {
      if (active) setAssets({ photo, artwork });
    }).catch(() => {
      if (active) setError('Couldn’t load the original photo or print file. Close this section and try again.');
    });
    return () => { active = false; };
  }, [open, assets, photoUrl, artworkUrl]);

  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!open || !assets || !context) return;
    const { naturalWidth, naturalHeight } = assets.artwork;
    const swapDimensions = (orientation === 'portrait' && naturalWidth > naturalHeight) ||
      (orientation === 'landscape' && naturalHeight > naturalWidth);
    const width = swapDimensions ? naturalHeight : naturalWidth;
    const height = swapDimensions ? naturalWidth : naturalHeight;
    paint(context, assets.photo, { label: productName, width, height }, { zoom, dx: x, dy: y },
      way, top, bottom, dedication, width, fit, rotation, round, isKeyring, true);
  }, [open, assets, productName, orientation, zoom, x, y, way, top, bottom, dedication, fit, rotation, round, isKeyring]);

  async function download() {
    const artwork = canvas.current;
    if (!artwork || downloading) return;
    setDownloading(true);
    setError('');
    try {
      const file = await new Promise<Blob>((resolve, reject) => {
        artwork.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Artwork export failed')), 'image/png');
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'adjusted-print-artwork.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Couldn’t export the adjusted file. Try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <details className="smAdminAdjustArtwork" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Adjust photo position</summary>
      {open && <>
        <p>Move or resize the photo within the printable area and download an adjusted PNG.</p>
        {error && <p role="alert">{error}</p>}
        {assets ? (
          <>
            <canvas ref={canvas} role="img" aria-label="Adjusted print artwork preview" />
            {!round && assets.artwork.naturalWidth !== assets.artwork.naturalHeight && (
              <label>Print orientation
                <select value={orientation} onChange={(event) => setOrientation(event.target.value as Orientation)}>
                  <option value="original">Original orientation</option>
                  <option value="portrait">Portrait (vertical)</option>
                  <option value="landscape">Landscape (horizontal)</option>
                </select>
              </label>
            )}
            <label>Zoom ({Math.round(zoom * 100)}%)
              <input type="range" min="0.5" max="3" step="0.01"
                value={zoom} onChange={(event) => setZoom(event.target.valueAsNumber)} />
            </label>
            <label>Horizontal position <input type="range" min="-2" max="2" step="0.01"
              value={x} onChange={(event) => setX(event.target.valueAsNumber)} /></label>
            <label>Vertical position <input type="range" min="-2" max="2" step="0.01"
              value={y} onChange={(event) => setY(event.target.valueAsNumber)} /></label>
            <div className="smAdminPrintActions">
              <button type="button" className="smAdminArtworkDownload" onClick={() => {
                setX(originalX);
                setY(originalY);
                setZoom(originalZoom);
                setOrientation('original');
              }}>Reset adjustments</button>
              <button type="button" className="smAdminArtworkDownload" disabled={downloading} onClick={download}>Download adjusted PNG</button>
            </div>
          </>
        ) : !error && <p role="status">Loading print artwork…</p>}
      </>}
    </details>
  );
}
