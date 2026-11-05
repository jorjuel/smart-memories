'use client';

type Props = {
  slug: string;
  photoUrl: string;
  photos?: string[];
  photoLayout?: 'single' | 'grid' | 'strip';
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
  const renderPhoto = (src: string, index: number) => (
    <img key={src + index} src={src} alt={`Photo ${index + 1}`} />
  );

  const imageContent = (
    <>
      {activePhotos.length > 1 && slug !== 'coaster-set' ? (
        <div
          className={`smPrintCollage ${photoLayout === 'strip' ? 'smPrintCollageStrip' : ''}`}
          style={{'--sm-photo-count': activePhotos.length} as React.CSSProperties}
        >
          {activePhotos.map(renderPhoto)}
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