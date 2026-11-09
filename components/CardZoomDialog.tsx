'use client';

import { useId, type ReactNode, type RefObject } from 'react';

export default function CardZoomDialog({
  dialog, title, children,
}: {
  dialog: RefObject<HTMLDialogElement | null>;
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <dialog ref={dialog} className="smCardZoomDialog" aria-labelledby={titleId}>
      <div className="smCardZoomHeader">
        <h2 id={titleId}>{title}</h2>
        <button type="button" onClick={() => dialog.current?.close()}>Close</button>
      </div>
      {children}
    </dialog>
  );
}
