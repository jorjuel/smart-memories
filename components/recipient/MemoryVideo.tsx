'use client';

import {
  useState,
} from 'react';

export default function MemoryVideo({
  src,
  mediaRef,
  onPlay,
}: {
  src?: string | null;
  mediaRef?: React.Ref<HTMLVideoElement>;
  onPlay?: () => void;
}) {
  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    failed,
    setFailed,
  ] = useState(false);

  if (
    !src ||
    failed
  ) {
    return null;
  }

  return (
    <section className="smRecipientSection smRecipientVideoSection">
      <span className="smRecipientSectionLabel">
        VIDEO
      </span>

      <h2>
        A moment to watch
      </h2>

      {!loaded && (
        <p
          className="smRecipientMediaLoading"
          role="status"
        >
          Preparing this
          moment...
        </p>
      )}

      <video
        ref={mediaRef}
        controls
        playsInline
        preload="metadata"
        src={src}
        onPlay={onPlay}
        onLoadedMetadata={() =>
          setLoaded(true)
        }
        onCanPlay={() =>
          setLoaded(true)
        }
        onError={() =>
          setFailed(true)
        }
      />
    </section>
  );
}
