/**
 * Shared layout geometry for the customer preview and the printable JPG.
 * Normalised rectangles (0..1) prevent the preview/print mismatches.
 */
export type PhotoLayout = 'grid' | 'strip' | 'feature-left' | 'feature-top' | 'mosaic';
export type PhotoRect = { x: number; y: number; w: number; h: number };

const r = (x: number, y: number, w: number, h: number): PhotoRect => ({x,y,w,h});

function classicGrid(count: number): PhotoRect[] {
  const cols = count === 2 ? 2 : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  const rects: PhotoRect[] = [];
  for (let i=0;i<count;i++) {
    const row = Math.floor(i / cols);
    const rowCount = Math.min(cols, count - row * cols);
    const col = i - row * cols;
    rects.push(r(col/rowCount, row/rows, 1/rowCount, 1/rows));
  }
  return rects;
}

/** Four curated formats plus the simple horizontal strip. */
export function getCollageRects(count: number, layout: PhotoLayout): PhotoRect[] {
  if (!Number.isInteger(count) || count < 1 || count > 6) throw new Error('Collages support 1 to 6 photos.');
  if (count === 1) return [r(0,0,1,1)];
  if (layout === 'strip') return Array.from({length:count},(_,i)=>r(i/count,0,1/count,1));
  if (layout === 'grid') return classicGrid(count);
  if (layout === 'feature-left') {
    const side = count - 1;
    return [r(0,0,.57,1),...Array.from({length:side},(_,i)=>r(.57,i/side,.43,1/side))];
  }
  if (layout === 'feature-top') {
    const bottom = count - 1;
    return [r(0,0,1,.57),...Array.from({length:bottom},(_,i)=>r(i/bottom,.57,1/bottom,.43))];
  }
  // Asymmetrical mosaics inspired by multi-size picture frames.
  switch (count) {
    case 2: return [r(0,0,.58,1),r(.58,0,.42,1)];
    case 3: return [r(0,0,.55,1),r(.55,0,.45,.45),r(.55,.45,.45,.55)];
    case 4: return [
      r(0,0,.48,.6), r(0,.6,.48,.4),
      r(.48,0,.52,.36), r(.48,.36,.52,.64),
    ];
    case 5: return [
      r(0,0,.43,.56), r(.43,0,.57,.32),
      r(.43,.32,.57,.24), r(0,.56,.57,.44),
      r(.57,.56,.43,.44),
    ];
    default: return [
      r(0,0,.34,.58), r(.34,0,.34,.27), r(.68,0,.32,.27),
      r(.34,.27,.66,.31), r(0,.58,.52,.42), r(.52,.58,.48,.42),
    ];
  }
}

export const collageLayoutOptions: {value:PhotoLayout;label:string}[] = [
  {value:'mosaic',label:'Creative mosaic'},
  {value:'feature-left',label:'Featured left'},
  {value:'feature-top',label:'Featured top'},
  {value:'grid',label:'Classic grid'},
  {value:'strip',label:'Photo strip'},
];
