'use client';

import { getCollageRects, type PhotoLayout } from '@/lib/collageLayouts';
import { useEffect, useState } from 'react';
import { getPhotoCropStyle, type PhotoCrop } from '@/lib/photoCrop';
import { getGiftTemplateTheme } from '@/lib/giftTemplateTheme';

type Props = {
  slug: string;
  photoUrl: string;
  photos?: string[];
  photoLayout?: PhotoLayout;
  coasterCount?: number;
  showCoasterWording?: boolean;
  photoCrops?: PhotoCrop[];
  orientation: string;
  topText: string;
  bottomText: string;
  paragraph: string;
  textLayout: string;
  template?: string | null;
};

function CroppedPrintPhoto({src,index,frameWidth,frameHeight,crop}:{
  src:string;index:number;frameWidth:number;frameHeight:number;crop?:PhotoCrop;
}) {
  const [size,setSize] = useState<{width:number;height:number}|null>(null);
  return (
    <img
      src={src}
      alt={`Collage photo ${index + 1}`}
      onLoad={e=>{
        const image=e.currentTarget;
        setSize({width:image.naturalWidth,height:image.naturalHeight});
      }}
      style={size
        ? getPhotoCropStyle(size.width,size.height,frameWidth,frameHeight,crop)
        : {position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}
    />
  );
}

export default function ConfiguredProductPreview({
  slug,
  photoUrl,
  photos = [],
  photoLayout = 'grid',
  coasterCount = 1,
  showCoasterWording = false,
  photoCrops = [],
  orientation,
  topText,
  bottomText,
  paragraph,
  textLayout,
  template,
}: Props) {
  const [frameUrl,setFrameUrl] = useState('');
  useEffect(()=>{
    if(!template?.startsWith('sm:')) {setFrameUrl('');return;}
    let active=true;setFrameUrl('');
    fetch('/api/admin-frame-templates',{cache:'no-store'})
      .then(async r=>r.ok?r.json():{templates:[]})
      .then(result=>{
        const entry=(result.templates||[]).find((f:{id:string;productSlugs:string[];orientation:string})=>
          f.id===template.slice(3) && f.productSlugs.includes(slug)
        );
        if(active)setFrameUrl(entry?.url||'');
      }).catch(()=>{if(active)setFrameUrl('');});
    return()=>{active=false;};
  },[template,slug,orientation]);
  const templateTheme = template ? getGiftTemplateTheme(template) : null;
  const activePhotos = photos.length ? photos : (photoUrl ? [photoUrl] : []);
  const printAspect = slug === 'mouse-mat' || slug === 'photo-mug' ? 1.5 : 1;
  const wording = (
    <>
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
  const imageContent = (
    <>
      {activePhotos.length > 1 && slug !== 'coaster-set' ? (
        <div className="smPrintCollage" style={{aspectRatio:String(printAspect)}}>
          {getCollageRects(activePhotos.length, photoLayout).map((cell, index) => {
            const gap = 0.65; // Percentage of the outer artwork dimensions.
            const left = cell.x === 0 ? 0 : gap / 2;
            const top = cell.y === 0 ? 0 : gap / 2;
            const right = cell.x + cell.w >= 0.999 ? 0 : gap / 2;
            const bottom = cell.y + cell.h >= 0.999 ? 0 : gap / 2;
            return (
              <div
                key={activePhotos[index] + index}
                style={{
                  position: 'absolute',
                  left: `${cell.x*100 + left}%`,
                  top: `${cell.y*100 + top}%`,
                  width: `${cell.w*100 - left - right}%`,
                  height: `${cell.h*100 - top - bottom}%`,
                  overflow: 'hidden',
                }}
              >
                <CroppedPrintPhoto
                  src={activePhotos[index]}
                  index={index}
                  frameWidth={cell.w * printAspect}
                  frameHeight={cell.h}
                  crop={photoCrops[index]}
                />
              </div>
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

      {frameUrl && <img src={frameUrl} alt="" aria-hidden="true"
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',pointerEvents:'none',zIndex:2}} />}

      {wording}
    </>
  );

  switch (slug) {
    /* =========================
       SLATE
       ========================= */

    case 'smart-photo-slate':
      return (
        <div
          data-template-theme={templateTheme || undefined}
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
          data-template-theme={templateTheme || undefined}
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
        <div data-template-theme={templateTheme || undefined}
          className="configuredPreview mugConfigured">
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
        <div data-template-theme={templateTheme || undefined}
          className="configuredPreview coasterConfigured smCoasterSetPreview">
          <div className="smCoasterPhotoGrid">
            {Array.from({length: Math.max(1, Math.min(6, coasterCount))}, (_, index) => (
              <div className="smCoasterPhoto" key={index}>
                {activePhotos.length ? (
                  <img src={activePhotos[index % activePhotos.length]} alt={`Coaster ${index + 1} design`} />
                ) : (
                  <span>♥</span>
                )}
                {showCoasterWording && wording}
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
        <div data-template-theme={templateTheme || undefined}
          className="configuredPreview keyringConfigured">
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
        <div data-template-theme={templateTheme || undefined}
          className="configuredPreview mouseConfigured">
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
        <div data-template-theme={templateTheme || undefined}
          className="configuredPreview shirtConfigured">
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
        <div data-template-theme={templateTheme || undefined}
          className="configuredPreview genericConfigured">
          <div className="configuredSurface">
            {imageContent}
          </div>
        </div>
      );
  }
}
