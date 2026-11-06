/** Assemble printable collage artwork from the customer's actual photos. */
import { getCollageRects, type PhotoLayout } from './collageLayouts';
import { calculatePhotoCrop, type PhotoCrop } from './photoCrop';
export type { PhotoLayout } from './collageLayouts';

function loadPhoto(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('One photo could not be opened. Please use JPG, PNG or WebP.')); };
    img.src = url;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, crop?: PhotoCrop) {
  const {sx,sy,sw,sh} = calculatePhotoCrop(img.naturalWidth,img.naturalHeight,w,h,crop);
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}

async function loadOverlay(url:string): Promise<HTMLImageElement> {
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.crossOrigin='anonymous';
    image.onload=()=>resolve(image);
    image.onerror=()=>reject(new Error('Could not prepare the selected frame for printing. Please choose another design.'));
    image.src=url;
  });
}
/** Make one full-resolution print image, avoiding storing data: URLs in the basket. */
export async function composePrintArtwork(files: File[], layout: PhotoLayout, width = 2400, height = 2400, crops: PhotoCrop[] = [], overlayUrl?: string): Promise<File> {
  if (files.length < 1 || files.length > 6) throw new Error('Choose between 1 and 6 photos.');
  const images = await Promise.all(files.map(loadPhoto));
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser cannot prepare collage artwork.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  const gap = images.length > 1 ? Math.max(6, Math.round(Math.min(width,height)*.006)) : 0;
  const cells = getCollageRects(images.length,layout);
  images.forEach((img,i) => {
    const cell = cells[i];
    // Half a gutter on shared edges; preserve the full outer edges.
    const left = cell.x === 0 ? 0 : gap/2;
    const top = cell.y === 0 ? 0 : gap/2;
    const right = cell.x + cell.w >= 1 ? 0 : gap/2;
    const bottom = cell.y + cell.h >= 1 ? 0 : gap/2;
    drawCover(ctx,img,cell.x*width+left,cell.y*height+top,
      cell.w*width-left-right,cell.h*height-top-bottom,crops[i]);
  });
  if (overlayUrl) {
    const frame=await loadOverlay(overlayUrl);
    const scale=Math.min(width/frame.naturalWidth,height/frame.naturalHeight);
    const fw=frame.naturalWidth*scale,fh=frame.naturalHeight*scale;
    ctx.drawImage(frame,(width-fw)/2,(height-fh)/2,fw,fh);
  }
  const blob = await new Promise<Blob>((resolve,reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not create print artwork.')), 'image/jpeg', 0.9);
  });
  return new File([blob], 'smart-memories-print-collage.jpg', {type:'image/jpeg'});
}
