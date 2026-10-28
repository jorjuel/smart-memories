'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type CloudMemory = {
  code: string;
  recipient: string;
  message: string;
  sender: string;
  photoUrl?: string | null;
  audioUrl?: string | null;
};

export default function Memory({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [m, setM] = useState<CloudMemory | null | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const player = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    params.then(async ({ code }) => {
      try {
        const r = await fetch(
          '/api/memories/' + encodeURIComponent(code),
          { cache: 'no-store' }
        );

        if (!r.ok) {
          setM(null);
          return;
        }

        setM(await r.json());
      } catch {
        setM(null);
      }
    });
  }, [params]);

  async function play() {
    const audio = player.current;

    if (!audio || !audioReady) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setAudioError(true);
    }
  }

  if (m === undefined) {
    return (
      <section className="wrap">
        <p>Loading memory...</p>
      </section>
    );
  }

  if (!m) {
    return (
      <section className="wrap">
        <div className="card">
          <h1>Memory not found</h1>
          <p>This memory could not be found online.</p>
          <Link className="btn" href="/">
            Smart Memories
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="memory">
      <span className="pill">MEMORY FOR</span>

      <h1>{m.recipient}</h1>

      {m.photoUrl && (
        <img
          className="memoryphoto"
          src={m.photoUrl}
          alt={m.recipient}
        />
      )}

      <div className="card">
        <p className="quote">
          {m.message || 'A memory made especially for you.'}
        </p>

        {m.audioUrl ? (
          <>
            <audio
              ref={player}
              src={m.audioUrl}
              preload="auto"
              onCanPlay={() => setAudioReady(true)}
              onCanPlayThrough={() => setAudioReady(true)}
              onLoadedData={() => setAudioReady(true)}
              onWaiting={() => setAudioReady(false)}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              onPlay={() => {
                setPlaying(true);
                setAudioReady(true);
              }}
              onError={() => {
                setAudioError(true);
                setAudioReady(false);
              }}
            />

            {!audioReady && !audioError && (
              <p className="success">
                Preparing your voice message...
              </p>
            )}

            <button
              className="btn big play"
              onClick={play}
              disabled={!audioReady || audioError}
            >
              {audioError
                ? 'VOICE MESSAGE UNAVAILABLE'
                : !audioReady
                  ? 'LOADING VOICE MESSAGE...'
                  : playing
                    ? '⏸ PAUSE MY MESSAGE'
                    : '▶ PLAY MY MESSAGE'}
            </button>

            {!audioError && audioReady && (
              <p className="success">
                🎙 Voice message ready
              </p>
            )}
          </>
        ) : (
          <p>No voice message was added to this memory.</p>
        )}

        {m.sender && (
          <p>
            With love always, <b>{m.sender}</b> ♡
          </p>
        )}

        <small>Memory code: {m.code}</small>
      </div>
    </section>
  );
}