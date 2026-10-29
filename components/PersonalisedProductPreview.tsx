'use client';

type Props = {
  productType: string;
  productSlug?: string;
  imageUrl?: string | null;
  name: string;
  recipient?: string;
};

export default function PersonalisedProductPreview({
  productType,
  productSlug,
  imageUrl,
  name,
  recipient,
}: Props) {
  if (productType === 'smart-card' || productType === 'traditional-card') {
    return (
      <div className="finalPreview finalCardPreview">
        <div className="finalCardFace">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div className="finalPreviewPlaceholder">♥</div>
          )}

          <div className="finalCardText">
            <small>SMART MEMORIES</small>
            <strong>{recipient ? `For ${recipient}` : name}</strong>
          </div>
        </div>
      </div>
    );
  }

  switch (productSlug) {
    case 'smart-photo-slate':
      return (
        <div className="finalPreview finalSlate">
          <div className="finalSlateSurface">
            {imageUrl ? (
              <img src={imageUrl} alt={name} />
            ) : (
              <div className="finalPreviewPlaceholder">PHOTO</div>
            )}
          </div>
        </div>
      );

    case 'smart-memory-plaque':
      return (
        <div className="finalPreview finalPlaque">
          <div className="finalPlaqueSurface">
            {imageUrl ? (
              <img src={imageUrl} alt={name} />
            ) : (
              <div className="finalPreviewPlaceholder">PHOTO</div>
            )}

            <div className="finalPlaqueCaption">
              <small>SMART MEMORY</small>
              <strong>{recipient || 'Your memory'}</strong>
            </div>
          </div>
        </div>
      );

    case 'smart-pet-memory':
      return (
        <div className="finalPreview finalPet">
          <div className="finalPetCircle">
            {imageUrl ? (
              <img src={imageUrl} alt={name} />
            ) : (
              <div className="finalPreviewPlaceholder">🐾</div>
            )}
          </div>

          <small>Forever remembered</small>
        </div>
      );

    case 'smart-baby-keepsake':
      return (
        <div className="finalPreview finalBaby">
          <div className="finalBabyFrame">
            {imageUrl ? (
              <img src={imageUrl} alt={name} />
            ) : (
              <div className="finalPreviewPlaceholder">♥</div>
            )}

            <strong>{recipient || 'Little memories'}</strong>
          </div>
        </div>
      );

    case 'smart-wedding-memory':
      return (
        <div className="finalPreview finalWedding">
          <div className="finalWeddingFrame">
            {imageUrl ? (
              <img src={imageUrl} alt={name} />
            ) : (
              <div className="finalPreviewPlaceholder">♥</div>
            )}

            <div>
              <small>OUR MEMORY</small>
              <strong>{recipient || 'Together forever'}</strong>
            </div>
          </div>
        </div>
      );

    case 'smart-video-memory':
      return (
        <div className="finalPreview finalVideo">
          <div className="finalVideoSurface">
            {imageUrl ? (
              <img src={imageUrl} alt={name} />
            ) : (
              <div className="finalPreviewPlaceholder">▶</div>
            )}

            <span className="finalPlayMark">▶</span>
          </div>
        </div>
      );

    /* Future catalogue products */

    case 'photo-mug':
    case 'smart-photo-mug':
      return (
        <div className="finalPreview finalMug">
          <div className="finalMugBody">
            {imageUrl && <img src={imageUrl} alt={name} />}
          </div>
          <div className="finalMugHandle"></div>
        </div>
      );

    case 'mouse-mat':
    case 'smart-mouse-mat':
      return (
        <div className="finalPreview finalMouseMat">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div className="finalPreviewPlaceholder">PHOTO</div>
          )}
        </div>
      );

    case 'coaster':
    case 'coaster-set':
    case 'smart-coaster':
      return (
        <div className="finalPreview finalCoaster">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div className="finalPreviewPlaceholder">PHOTO</div>
          )}
        </div>
      );

    case 't-shirt':
    case 'smart-t-shirt':
      return (
        <div className="finalPreview finalShirt">
          <div className="finalShirtBody">
            {imageUrl && <img src={imageUrl} alt={name} />}
          </div>
        </div>
      );

    default:
      return (
        <div className="finalPreview finalGenericProduct">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div className="finalPreviewPlaceholder">♥</div>
          )}

          <small>{name}</small>
        </div>
      );
  }
}