'use client';

import { useId, useRef, useState, type ReactNode } from 'react';

export default function GiftTagPreview({ name, image, children }: {
  name: string;
  image: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="smTagPreviewButton" aria-label={`Enlarge ${name}`}
        aria-haspopup="dialog" onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}>
        {children}
        <span>Enlarge</span>
      </button>
      <dialog ref={dialog} className="smTagPreviewDialog" aria-labelledby={titleId}
        onClose={() => setOpen(false)}>
        <div className="smTagPreviewHeader">
          <h2 id={titleId}>{name}</h2>
          <button type="button" autoFocus onClick={() => dialog.current?.close()}>Close</button>
        </div>
        {open && <img src={image} alt={`${name} gift tag artwork`} />}
      </dialog>
    </>
  );
}
