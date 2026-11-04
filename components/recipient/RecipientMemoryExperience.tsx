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
              <header className="smRecipientUnifiedHeading">
                <span className="smRecipientUnifiedEyebrow">A SMART MEMORY JUST FOR YOU</span>
                <h2>For {memory.recipient?.trim() || 'someone special'}</h2>
              </header>

              <div className={memory.photoUrl ? 'smRecipientUnifiedBody' : 'smRecipientUnifiedBody smRecipientUnifiedBodyNoPhoto'}>
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
                  <MemoryMessage message={memory.message} variant="compact" />

                  {memory.audioUrl && (
                    <div className="smRecipientUnifiedVoice">
                      <span>YOUR VOICE MESSAGE</span>
                      <MemoryAudio src={memory.audioUrl} variant="compact" />
                    </div>
                  )}

                  {memory.sender && (
                    <p className="smRecipientUnifiedSignature">
                      With love always, <strong>{memory.sender}</strong> <span aria-hidden="true">♡</span>
                    </p>
                  )}
                </div>
              </div>

              {memory.videoUrl && (
                <div className="smRecipientUnifiedVideo">
                  <MemoryVideo src={memory.videoUrl} />
                </div>
              )}

              <footer className="smRecipientUnifiedFooter">
                <span>Tap your gift anytime to revisit this memory ♡</span>
                <div>
                  <Link href="/privacy">Privacy</Link>
                  <Link href="/contact">Help</Link>
                </div>
              </footer>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
