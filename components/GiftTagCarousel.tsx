'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export default function GiftTagCarousel({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    function update() {
      if (!element) return;
      setEdges({
        previous: element.scrollLeft > 1,
        next: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      });
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, []);

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const visibleCards = Math.max(1, Math.floor((element.clientWidth + gap) / step));
    element.scrollBy({
      left: direction * visibleCards * step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  return (
    <>
      <div className="smTagCarouselHeading">
        <h3 id={`${id}-heading`}>{title}</h3>
        {(edges.previous || edges.next) && (
          <div className="smTagCarouselControls">
            <button type="button" aria-label={`Previous ${title} designs`} aria-controls={id}
              disabled={!edges.previous} onClick={() => move(-1)}>←</button>
            <button type="button" aria-label={`Next ${title} designs`} aria-controls={id}
              disabled={!edges.next} onClick={() => move(1)}>→</button>
          </div>
        )}
      </div>
      <div className="smTagCatalogue" id={id} ref={track} role="group" aria-labelledby={`${id}-heading`}>
        {children}
      </div>
    </>
  );
}
