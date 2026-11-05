/** Crop parameters follow each photo when customers swap collage cells. */
export type PhotoCrop = { zoom: number; x: number; y: number };
export const defaultPhotoCrop = (): PhotoCrop => ({zoom:1,x:0,y:0});
export const normalisePhotoCrop = (crop?: Partial<PhotoCrop>): PhotoCrop => ({
  zoom: Math.min(3, Math.max(1, Number(crop?.zoom) || 1)),
  x: Math.min(100, Math.max(-100, Number(crop?.x) || 0)),
  y: Math.min(100, Math.max(-100, Number(crop?.y) || 0)),
});

/**
 * Cover crop with a pan factor from -100 (left/top) to +100 (right/bottom).
 * Returns pixel-space source rectangle for Canvas drawImage.
 * Dimensions are intentionally shared with DOM preview geometry.
 */
export function calculatePhotoCrop(
  imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number,
  crop?: Partial<PhotoCrop>,
) {
  const {zoom,x,y} = normalisePhotoCrop(crop);
  const sourceWidth = Math.min(imageWidth, imageHeight * frameWidth / frameHeight) / zoom;
  const sourceHeight = sourceWidth * frameHeight / frameWidth;
  const remainingX = Math.max(0, imageWidth - sourceWidth);
  const remainingY = Math.max(0, imageHeight - sourceHeight);
  return {
    sx: remainingX * (x + 100) / 200,
    sy: remainingY * (y + 100) / 200,
    sw: sourceWidth,
    sh: sourceHeight,
  };
}

/**
 * CSS image geometry that exactly mirrors calculatePhotoCrop, even when zoomed.
 * frameAspect = actual preview/print canvas width divided by height.
 */
export function getPhotoCropStyle(
  imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number,
  crop?: Partial<PhotoCrop>,
) {
  const {sx,sy,sw,sh} = calculatePhotoCrop(imageWidth,imageHeight,frameWidth,frameHeight,crop);
  return {
    position: 'absolute' as const,
    left: `${-sx / sw * 100}%`,
    top: `${-sy / sh * 100}%`,
    width: `${imageWidth / sw * 100}%`,
    height: `${imageHeight / sh * 100}%`,
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'fill' as const,
    userSelect: 'none' as const,
    pointerEvents: 'none' as const,
  };
}
