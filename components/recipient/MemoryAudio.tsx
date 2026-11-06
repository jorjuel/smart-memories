'use client';

import {
  useRef,
  useState,
} from 'react';

type Props = {
  src?: string | null;
  variant?:
    | 'full'
    | 'compact';
  /** Lets the recipient's Open Memory tap start the existing player. */
  mediaRef?: React.Ref<HTMLAudioElement>;
};

function formatTime(
  value: number
) {
  if (
    !Number.isFinite(
      value
    ) ||
    value < 0
  ) {
    return '0:00';
  }

  const minutes =
    Math.floor(
      value / 60
    );

  const seconds =
    Math.floor(
      value % 60
    );

  return `${minutes}:${String(
    seconds
  ).padStart(2, '0')}`;
}

export default function MemoryAudio({
  src,
  variant = 'full',
  mediaRef,
}: Props) {
  const player =
    useRef<HTMLAudioElement>(
      null
    );

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    ready,
    setReady,
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

  if (
    variant ===
    'compact'
  ) {
    return (
      <audio
        ref={mediaRef}
        className="smRecipientAudioCompact"
        controls
        preload="auto"
        playsInline
        src={src}
        onError={() =>
          setFailed(true)
        }
      />
    );
  }

  async function toggle() {
    const audio =
      player.current;

    if (!audio) {
      return;
    }

    try {
      if (
        audio.paused
      ) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setFailed(true);
    }
  }

  function updateDuration() {
    const value =
      player.current
        ?.duration;

    if (
      value &&
      Number.isFinite(
        value
      )
    ) {
      setDuration(
        value
      );
    }

    setReady(true);
  }

  function seek(
    value: number
  ) {
    const audio =
      player.current;

    if (!audio) {
      return;
    }

    audio.currentTime =
      value;

    setCurrentTime(
      value
    );
  }

  return (
    <section className="smRecipientSection smRecipientAudioSection">
      <span className="smRecipientSectionLabel">
        VOICE
      </span>

      <h2>
        A message for you
      </h2>

      <p className="smRecipientSectionIntro">
        Press play when
        you're ready.
      </p>

      <div className="smRecipientAudioPlayer">
        <audio
          ref={player}
          src={src}
          preload="metadata"
          onLoadedMetadata={
            updateDuration
          }
          onCanPlay={() =>
            setReady(true)
          }
          onTimeUpdate={() =>
            setCurrentTime(
              player.current
                ?.currentTime ||
                0
            )
          }
          onPlay={() =>
            setPlaying(true)
          }
          onPause={() =>
            setPlaying(false)
          }
          onEnded={() => {
            setPlaying(
              false
            );

            setCurrentTime(
              0
            );
          }}
          onError={() =>
            setFailed(true)
          }
        />

        <button
          type="button"
          className="smRecipientPlayButton"
          onClick={
            toggle
          }
          aria-label={
            playing
              ? 'Pause voice message'
              : 'Play voice message'
          }
        >
          <span
            aria-hidden="true"
          >
            {playing
              ? '❚❚'
              : '▶'}
          </span>

          <strong>
            {playing
              ? 'Pause message'
              : 'Hear my message'}
          </strong>
        </button>

        <div className="smRecipientAudioProgress">
          <input
            type="range"
            min="0"
            max={
              duration ||
              1
            }
            step="0.1"
            value={Math.min(
              currentTime,
              duration ||
                1
            )}
            disabled={
              !duration
            }
            onChange={(
              event
            ) =>
              seek(
                Number(
                  event
                    .target
                    .value
                )
              )
            }
            aria-label="Voice message progress"
          />

          <div>
            <span>
              {formatTime(
                currentTime
              )}
            </span>

            <span>
              {duration
                ? formatTime(
                    duration
                  )
                : '--:--'}
            </span>
          </div>
        </div>

        {!ready && (
          <small
            role="status"
            aria-live="polite"
          >
            Preparing your
            voice message...
          </small>
        )}
      </div>
    </section>
  );
}