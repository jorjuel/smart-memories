import { cardDesigns } from '../lib/cardDesigns';

export default function CardFront({
  design, greeting, recipient, colour, photo, artwork, smart, onPhotoError,
}: {
  design: string;
  greeting: string;
  recipient?: string;
  colour?: string;
  photo?: string | null;
  artwork?: string | null;
  smart?: boolean;
  onPhotoError?: () => void;
}) {
  const template = cardDesigns.find((item) => item.name === design);
  return (
    <div className={`cardDesignPreview smCardFace ${template?.style ?? 'smOwnCardDesignPreview'} ${colour ? `smCardTone-${colour.toLowerCase()}` : ''}`}>
      {artwork ? (
        <img className="smCardUploadedArt" src={artwork} alt="Your uploaded card front" />
      ) : (
        <div className="designArtwork">
          {photo ? <img className="smCardPrintedPhoto" src={photo} alt="Printed photograph" onError={onPhotoError} /> : (
            <span className={template ? `${template.style}Mark` : 'smOwnCardUploadIcon'} aria-hidden="true">
              {template?.mark ?? '＋'}
            </span>
          )}
          {recipient && <small>FOR {recipient}</small>}
          <p className="smCardGreeting">{greeting}</p>
        </div>
      )}
      {smart && <span className="smartCorner">♥ SMART MEMORY</span>}
    </div>
  );
}
