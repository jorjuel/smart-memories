/** Assemble printable collage artwork from the customer's actual photos. */
export type PhotoLayout = 'single' | 'grid' | 'strip';

function loadPhoto(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('One photo could not be opened. Please use JPG, PNG or WebP.')); };
    img.src = url;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / ratio;
  const sh = h / ratio;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

/** Make one full-resolution print image, avoiding storing data: URLs in the basket. */
export async function composePrintArtwork(files: File[], layout: PhotoLayout, width = 2400, height = 2400): Promise<File> {
  if (files.length < 1 || files.length > 6) throw new Error('Choose between 1 and 6 photos.');
  const images = await Promise.all(files.map(loadPhoto));
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser cannot prepare collage artwork.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  const count = images.length;
  const gap = count > 1 ? 12 : 0;
  const cells: {x:number;y:number;w:number;h:number}[] = [];
  if (layout === 'strip' && count > 1) {
    for (let i = 0; i < count; i++) {
      const w = (width - gap * (count - 1)) / count;
      cells.push({x:i*(w+gap),y:0,w,h:height});
    }
  } else {
    const cols = count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);
    const w = (width - gap * (cols - 1)) / cols;
    const h = (height - gap * (rows - 1)) / rows;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Stretch the last cell when a row has just one photo.
      const lastRowCount = count - row * cols;
      const cellWidth = row === rows - 1 && lastRowCount < cols
        ? (width - gap * (lastRowCount - 1)) / lastRowCount : w;
      const cellCol = row === rows - 1 && lastRowCount < cols ? i - row * cols : col;
      cells.push({x:cellCol*(cellWidth+gap),y:row*(h+gap),w:cellWidth,h});
    }
  }
  images.forEach((img,i) => {
    const cell=cells[i];
    drawCover(ctx,img,cell.x,cell.y,cell.w,cell.h);
  });
  const blob = await new Promise<Blob>((resolve,reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not create print artwork.')), 'image/jpeg', 0.9);
  });
  return new File([blob], 'smart-memories-print-collage.jpg', {type:'image/jpeg'});
}
