'use client';

import { getCollageRects, type PhotoLayout } from '@/lib/collageLayouts';

type Props = {
  slug: string;
  photoUrl: string;
  photos?: string[];
  photoLayout?: PhotoLayout;
  coasterCount?: number;
  orientation: string;
  topText: string;
  bottomText: string;
  paragraph: string;
  textLayout: string;
};

export default function ConfiguredProductPreview({
  slug,
  photoUrl,
  photos = [],
  photoLayout = 'grid',
  coasterCount = 1,
  orientation,
  topText,
  bottomText,
  paragraph,
  textLayout,
}: Props) {
  const activePhotos = photos.length ? photos : (photoUrl ? [photoUrl] : []);
  const imageContent = (
    <>
      {activePhotos.length > 1 && slug !== 'coaster-set' ? (
        <div className="smPrintCollage">
          {getCollageRects(activePhotos.length, photoLayout).map((cell, index) => {
            const gap = 0.65; // Percentage of the outer artwork dimensions.
            const left = cell.x === 0 ? 0 : gap / 2;
            const top = cell.y === 0 ? 0 : gap / 2;
            const right = cell.x + cell.w >= 0.999 ? 0 : gap / 2;
            const bottom = cell.y + cell.h >= 0.999 ? 0 : gap / 2;
            return (
              <img
                key={activePhotos[index] + index}
                src={activePhotos[index]}
                alt={`Collage photo ${index + 1}`}
                style={{
                  position: 'absolute',
                  left: `${cell.x*100 + left}%`,
                  top: `${cell.y*100 + top}%`,
                  width: `${cell.w*100 - left - right}%`,
                  height: `${cell.h*100 - top - bottom}%`,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            );
          })}
        </div>
      ) : photoUrl ? (
        <img
          src={photoUrl}
          alt="Product preview"
          className={`configuredPreviewImage ${slug}`}
        />
      ) : (
        <div className="configuredPreviewPlaceholder">
          <span>♥</span>
          <small>YOUR PHOTO</small>
        </div>
      )}

      {topText &&
        (textLayout === 'top' ||
          textLayout === 'top-bottom') && (
          <div className="previewTopText">
            {topText}
          </div>
        )}

      {paragraph &&
        textLayout === 'paragraph' && (
          <div className="previewParagraph">
            {paragraph}
          </div>
        )}

      {bottomText &&
        (textLayout === 'bottom' ||
          textLayout === 'top-bottom') && (
          <div className="previewBottomText">
            {bottomText}
          </div>
        )}
    </>
  );

  switch (slug) {
    /* =========================
       SLATE
       ========================= */

    case 'smart-photo-slate':
      return (
        <div
          className={`configuredPreview slateConfigured ${
            orientation === 'landscape'
              ? 'configuredLandscape'
              : 'configuredPortrait'
          }`}
        >
          <div className="configuredSurface">
            {imageContent}
          </div>
        </div>
      );

    /* =========================
       ALUMINIUM PLAQUE
       ========================= */

    case 'smart-memory-plaque':
      return (
        <div
          className={`configuredPreview plaqueConfigured ${
            orientation === 'landscape'
              ? 'configuredLandscape'
              : 'configuredPortrait'
          }`}
        >
          <div className="configuredSurface">
            {imageContent}
          </div>
        </div>
      );

    /* =========================
       MUG
       ========================= */

    case 'photo-mug':
      return (
        <div className="configuredPreview mugConfigured">
          <div className="configuredMug">
            <div className="configuredMugPrint">
              {imageContent}
            </div>
          </div>

          <div className="configuredMugHandle" />
        </div>
      );

    /* =========================
       COASTERS - each original image gets its own coaster.
       Repeat selected images if the set has more coasters than photos.
       ========================= */

    case 'coaster-set':
      return (
        <div className="configuredPreview coasterConfigured smCoasterSetPreview">
          <div className="smCoasterPhotoGrid">
            {Array.from({length: Math.max(1, Math.min(6, coasterCount))}, (_, index) => (
              <div className="smCoasterPhoto" key={index}>
                {activePhotos.length ? (
                  <img src={activePhotos[index % activePhotos.length]} alt={`Coaster ${index + 1} design`} />
                ) : (
                  <span>♥</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    /* =========================
       KEYRING
       ========================= */

    case 'keyring':
      return (
        <div className="configuredPreview keyringConfigured">
          <div className="keyringRing" />

          <div className="configuredKeyring">
            {imageContent}
          </div>
        </div>
      );

    /* =========================
       MOUSE MAT
       ========================= */

    case 'mouse-mat':
      return (
        <div className="configuredPreview mouseConfigured">
          <div className="configuredSurface">
            {imageContent}
          </div>
        </div>
      );

    /* =========================
       WHITE T-SHIRT
       ========================= */

    case 'white-t-shirt':
      return (
        <div className="configuredPreview shirtConfigured">
          <div className="configuredShirt">
            <div className="configuredShirtPrint">
              {imageContent}
            </div>
          </div>
        </div>
      );

    /* =========================
       FALLBACK
       ========================= */

    default:
      return (
        <div className="configuredPreview genericConfigured">
          <div className="configuredSurface">
            {imageContent}
          </div>
        </div>
      );
  }
}