'use client';

import { useRef, useState } from 'react';
import { getCollageRects, type PhotoLayout } from '@/lib/collageLayouts';
import {
  getPhotoCropStyle, normalisePhotoCrop, type PhotoCrop,
} from '@/lib/photoCrop';
import styles from './PhotoCollageEditor.module.css';

type Props = {
  photos: string[];
  layout: PhotoLayout;
  aspectRatio: number;
  crops: PhotoCrop[];
  onCropChange: (index: number, crop: PhotoCrop) => void;
  onSwap: (first: number, second: number) => void;
};
type ImageSize = { width: number; height: number };

export default function PhotoCollageEditor({
  photos, layout, aspectRatio, crops, onCropChange, onSwap,
}: Props) {
  const [selected, setSelected] = useState(0);
  const [dimensions, setDimensions] = useState<Record<string,ImageSize>>({});
  const [dragFrom, setDragFrom] = useState<number|null>(null);
  const pan = useRef<{
    index:number; x:number; y:number; startX:number; startY:number; width:number; height:number;
  }|null>(null);
  const selectedIndex = Math.min(selected, photos.length-1);
  const selectedCrop = normalisePhotoCrop(crops[selectedIndex]);
  const rects = getCollageRects(photos.length,layout);

  function swap(first: number, second: number) {
    if (first === second || first < 0 || second < 0 || second >= photos.length) return;
    onSwap(first,second);
    setSelected(second);
  }

  return (
    <section className={styles.editor} aria-label="Edit your photo collage">
      <div className={styles.intro}>
        <strong>Arrange your photographs</strong>
        <p>Select a photo to zoom or reposition it. Drag the photo inside its frame to move the crop; drag a thumbnail onto another to swap their positions.</p>
      </div>

      <div className={styles.artwork} style={{aspectRatio: String(aspectRatio)}}>
        {rects.map((rect,index) => {
          const url = photos[index];
          const dim = dimensions[url];
          const crop = normalisePhotoCrop(crops[index]);
          const gutter = .4;
          const left = rect.x ? gutter : 0;
          const top = rect.y ? gutter : 0;
          const right = rect.x+rect.w<.999 ? gutter : 0;
          const bottom = rect.y+rect.h<.999 ? gutter : 0;
          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              aria-label={`Select collage photo ${index+1}`}
              aria-pressed={index===selectedIndex}
              className={index===selectedIndex ? styles.cellActive : styles.cell}
              style={{
                left:`${rect.x*100+left}%`, top:`${rect.y*100+top}%`,
                width:`${rect.w*100-left-right}%`,height:`${rect.h*100-top-bottom}%`,
              }}
              onClick={() => setSelected(index)}
              onKeyDown={e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(index);} }}
              onPointerDown={e => {
                if(e.pointerType==='mouse' && e.button!==0) return;
                setSelected(index);
                pan.current = {
                  index, x:crop.x,y:crop.y,startX:e.clientX,startY:e.clientY,
                  width:e.currentTarget.clientWidth,height:e.currentTarget.clientHeight,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={e => {
                if (!pan.current || pan.current.index!==index) return;
                const p=pan.current;
                onCropChange(index, normalisePhotoCrop({
                  ...crop, x:p.x - (e.clientX-p.startX)/Math.max(1,p.width)*200,
                  y:p.y - (e.clientY-p.startY)/Math.max(1,p.height)*200,
                }));
              }}
              onPointerUp={() => {pan.current=null;}}
              onPointerCancel={() => {pan.current=null;}}
            >
              <img
                src={url}
                alt=""
                draggable={false}
                onLoad={e => {
                  const img=e.currentTarget;
                  const next={width:img.naturalWidth,height:img.naturalHeight};
                  setDimensions(prev => prev[url]?.width===next.width && prev[url]?.height===next.height ? prev : {...prev,[url]:next});
                }}
                style={dim ? getPhotoCropStyle(dim.width,dim.height,rect.w*aspectRatio,rect.h,crop) : {
                  position:'absolute',width:'100%',height:'100%',objectFit:'cover',
                }}
              />
              <span className={styles.cellNumber}>{index+1}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.thumbnails} aria-label="Reorder collage photographs">
        {photos.map((url,index) => (
          <button
            type="button"
            key={url}
            draggable
            className={selectedIndex===index ? styles.thumbActive : styles.thumb}
            onClick={() => setSelected(index)}
            onDragStart={e => {setDragFrom(index);e.dataTransfer.setData('text/plain',String(index));e.dataTransfer.effectAllowed='move';}}
            onDragOver={e => {e.preventDefault();e.dataTransfer.dropEffect='move';}}
            onDrop={e => {
              e.preventDefault();
              const first=Number(e.dataTransfer.getData('text/plain'));
              if(Number.isInteger(first)) swap(first,index);
              setDragFrom(null);
            }}
            onDragEnd={() => setDragFrom(null)}
            aria-label={`Select photo ${index+1}; drag to reorder`}
            aria-pressed={selectedIndex===index}
            style={dragFrom===index ? {opacity:.5}:undefined}
          >
            <img src={url} alt="" draggable={false}/>
            <span>{index+1}</span>
          </button>
        ))}
      </div>

      <div className={styles.controls}>
        <strong>Photo {selectedIndex+1} adjustments</strong>
        <label>
          Zoom: {Math.round(selectedCrop.zoom*100)}%
          <input type="range" min="1" max="3" step=".05" value={selectedCrop.zoom}
            onChange={e=>onCropChange(selectedIndex,{...selectedCrop,zoom:Number(e.target.value)})}/>
        </label>
        <label>
          Position left / right
          <input type="range" min="-100" max="100" step="1" value={selectedCrop.x}
            onChange={e=>onCropChange(selectedIndex,{...selectedCrop,x:Number(e.target.value)})}/>
        </label>
        <label>
          Position up / down
          <input type="range" min="-100" max="100" step="1" value={selectedCrop.y}
            onChange={e=>onCropChange(selectedIndex,{...selectedCrop,y:Number(e.target.value)})}/>
        </label>
        <div className={styles.actions}>
          <button type="button" onClick={()=>onCropChange(selectedIndex,{zoom:1,x:0,y:0})}>Reset photo</button>
          <button type="button" disabled={selectedIndex===0} onClick={()=>swap(selectedIndex,selectedIndex-1)}>Move left</button>
          <button type="button" disabled={selectedIndex===photos.length-1} onClick={()=>swap(selectedIndex,selectedIndex+1)}>Move right</button>
        </div>
      </div>
    </section>
  );
}
