'use client';

import {
  useState,
} from 'react';

export default function MemoryVideo({
  src,
}: {
  src?: string | null;
}) {
  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    failed,
    setFailed,
  ] = useState(false);

  if (!src) return null;

  return (
    <section className="smRecipientSection smRecipientVideoSection">
      <span className="smRecipientSectionLabel">
        VIDEO
      </span>

      <h2>
        A moment to watch
      </h2>

      {failed ? (
        <p className="smRecipientMediaError" role="alert">
          This video cannot play in your browser. Ask the sender to upload an MP4 video for best compatibility.
        </p>
      ) : (
        <>
          {!loaded && (
            <p className="smRecipientMediaLoading" role="status">
              Loading your video...
            </p>
          )}
          <video
            controls
            playsInline
            preload="auto"
            src={src}
            onLoadedMetadata={() => setLoaded(true)}
            onCanPlay={() => setLoaded(true)}
            onError={() => setFailed(true)}
            aria-label="Play your personal Smart Memory video with sound"
          >
            Your browser does not support inline video playback.
          </video>
          <small className="smRecipientPlaybackNote">
            Tap play to hear the sound. Videos play on this page without a separate download.
          </small>
        </>
      )>
    </section>
  );
}