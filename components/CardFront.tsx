import { cardDesigns } from '../lib/cardDesigns';

export default function CardFront({
  design, photoSlug, greeting, recipient, colour, photo, artwork, smart, onPhotoError,
}: {
  design: string;
  photoSlug?: string;
  greeting: string;
  recipient?: string;
  colour?: string;
  photo?: string | null;
  artwork?: string | null;
  smart?: boolean;
  onPhotoError?: () => void;
}) {
  const template = cardDesigns.find((item) => photoSlug ? item.photoSlug === photoSlug : item.name === design);
  const style = template?.style ?? (photoSlug ? 'classic' : undefined);
  return (
    <div className={`cardDesignPreview smCardFace ${style ?? 'smOwnCardDesignPreview'} ${colour ? `smCardTone-${colour.toLowerCase()}` : ''}`}>
      {artwork ? (
        <img className="smCardUploadedArt" src={artwork} alt="Your uploaded card front" />
      ) : (
        <div className="designArtwork">
          {photo ? <img className="smCardPrintedPhoto" src={photo} alt="Printed photograph" onError={onPhotoError} /> : (
            <span className={style ? `${style}Mark` : 'smOwnCardUploadIcon'} aria-hidden="true">
              {template?.mark ?? (photoSlug ? '♥' : '＋')}
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
