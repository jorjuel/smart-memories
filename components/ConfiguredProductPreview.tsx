'use client';

type Props = {
  slug: string;
  photoUrl: string;
  orientation: string;
  topText: string;
  bottomText: string;
  paragraph: string;
  textLayout: string;
};

export default function ConfiguredProductPreview({
  slug,
  photoUrl,
  orientation,
  topText,
  bottomText,
  paragraph,
  textLayout,
}: Props) {
  const imageContent = (
    <>
      {photoUrl ? (
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
       COASTER - ONE PREVIEW ONLY
       ========================= */

    case 'coaster-set':
      return (
        <div className="configuredPreview coasterConfigured">
          <div className="configuredCoaster single">
            {imageContent}
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