'use client';

import { useState } from 'react';
import Link from 'next/link';
import MemoryCover from './MemoryCover';
import MemoryAudio from './MemoryAudio';
import MemoryVideo from './MemoryVideo';
import MemoryMessage from './MemoryMessage';
import type { PublicMemory } from './types';

export default function RecipientMemoryExperience({memory}:{memory:PublicMemory}) {
  const [opened,setOpened]=useState(false);

  function openMemory() {
    setOpened(true);
    window.setTimeout(()=>{
      const target=document.getElementById('memory-story');
      if(!target)return;
      const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    },120);
  }

  return (
    <article className="smRecipientExperience">
      <MemoryCover
        recipient={memory.recipient}
        sender={memory.sender}
        imageUrl={memory.photoUrl}
        onOpen={openMemory}
      />

      {opened && (
        <div id="memory-story" className="smRecipientStory smRecipientUnifiedStory">
          <section className="smRecipientUnifiedFrame" aria-label="Your personal Smart Memory">
            <div className="smRecipientUnifiedCard">
              <span className="smRecipientUnifiedEyebrow">A SMART MEMORY JUST FOR YOU</span>
              <span className="smRecipientUnifiedFor">MEMORY FOR</span>
              <h2>{memory.recipient?.trim() || 'Someone special'}</h2>

              {memory.photoUrl && (
                <img
                  className="smRecipientUnifiedPhoto"
                  src={memory.photoUrl}
                  alt={memory.recipient ? `Memory for ${memory.recipient}` : 'Personal memory photograph'}
                  loading="lazy"
                  decoding="async"
                />
              )}

              <div className="smRecipientUnifiedLetter">
                <MemoryMessage
                  message={memory.message}
                  variant="compact"
                />

                {memory.audioUrl && (
                  <div className="smRecipientUnifiedVoice">
                    <span>LISTEN TO YOUR VOICE MESSAGE</span>
                    <MemoryAudio src={memory.audioUrl} variant="compact" />
                  </div>
                )}

                {memory.sender && (
                  <p className="smRecipientUnifiedSignature">
                    With love always, <strong>{memory.sender}</strong> <span aria-hidden="true">♡</span>
                  </p>
                )}
              </div>

              <p className="smRecipientUnifiedRevisit">
                Keep this moment close. Tap your gift or scan its QR code to revisit it anytime.
              </p>
            </div>
          </section>

          {memory.videoUrl && (
            <MemoryVideo src={memory.videoUrl} />
          )}

          <footer className="smRecipientFooter">
            <Link href="/" className="smRecipientFooterBrand">
              SMART MEMORIES <span>♥</span>
            </Link>
            <strong>Tap. Remember. Relive.</strong>
            <div>
              <Link href="/privacy">Privacy</Link>
              <Link href="/contact">Having trouble?</Link>
            </div>
          </footer>
        </div>
      )}
    </article>
  );
}
