'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import MemoryCover from './MemoryCover';
import MemoryAudio from './MemoryAudio';
import MemoryVideo from './MemoryVideo';
import MemoryMessage from './MemoryMessage';
import type { PublicMemory } from './types';

export default function RecipientMemoryExperience({memory}:{memory:PublicMemory}) {
  const [opened,setOpened]=useState(false);
  const audioPlayer=useRef<HTMLAudioElement>(null);
  const videoPlayer=useRef<HTMLVideoElement>(null);
  const hasWrittenMessage = Boolean(memory.message?.trim());
  const hasLetterContent = hasWrittenMessage || Boolean(memory.audioUrl) || Boolean(memory.sender?.trim());
  const hasStoryBody = Boolean(memory.photoUrl) || hasLetterContent;

  function openMemory() {
    // The recipient deliberately taps Open Memory. Start sound from that
    // user gesture instead of attempting blocked autoplay on page load.
    flushSync(() => setOpened(true));
    if (memory.videoUrl) {
      // A video needs to be in view when Safari begins audible playback.
      // This still runs within the visitor's original button tap.
      document.getElementById('recipient-memory-video')
        ?.scrollIntoView({behavior:'auto',block:'center'});
    }
    const media = memory.videoUrl ? videoPlayer.current : audioPlayer.current;
    if (media) {
      void media.play().catch(() => {
        // Browser restrictions/slow networks: native player remains available.
      });
    }
    if (!memory.videoUrl) {
      window.setTimeout(()=>{
        const target=document.getElementById('memory-story');
        if(!target)return;
        const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
      },120);
    }
  }

  return (
    <article className="smRecipientExperience">
      <MemoryCover
        recipient={memory.recipient}
        sender={memory.sender}
        imageUrl={memory.photoUrl}
        onOpen={openMemory}
        hasPlayableMedia={Boolean(memory.audioUrl || memory.videoUrl)}
      />

      <div id="memory-story" className="smRecipientStory smRecipientUnifiedStory"
        aria-hidden={!opened}
        inert={!opened}
        style={!opened ? {
          position:'absolute',
          left:'-10000px',
          top:0,
          width:1,
          height:1,
          overflow:'hidden',
          opacity:0,
          pointerEvents:'none',
        } : undefined}>
          <section className="smRecipientUnifiedFrame" aria-label="Your personal Smart Memory">
            <div className="smRecipientUnifiedCard">
              <header className="smRecipientUnifiedHeading">
                <span className="smRecipientUnifiedEyebrow">A SMART MEMORY JUST FOR YOU</span>
                <h2>For {memory.recipient?.trim() || 'someone special'}</h2>
              </header>

              {memory.videoUrl && (
                <div id="recipient-memory-video" className="smRecipientUnifiedVideo">
                  <MemoryVideo src={memory.videoUrl} mediaRef={videoPlayer} />
                </div>
              )}

              {hasStoryBody && (
              <div className={
                !memory.photoUrl
                  ? 'smRecipientUnifiedBody smRecipientUnifiedBodyNoPhoto'
                  : !hasLetterContent
                    ? 'smRecipientUnifiedBody smRecipientUnifiedBodyPhotoOnly'
                    : 'smRecipientUnifiedBody'
              }>
                {memory.photoUrl && (
                  <img
                    className="smRecipientUnifiedPhoto"
                    src={memory.photoUrl}
                    alt={memory.recipient ? `Memory for ${memory.recipient}` : 'Personal memory photograph'}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                {hasLetterContent && (
                <div className="smRecipientUnifiedLetter">
                  {hasWrittenMessage && (
                    <MemoryMessage message={memory.message} variant="compact" />
                  )}

                  {memory.audioUrl && (
                    <div className="smRecipientUnifiedVoice">
                      <span>YOUR VOICE MESSAGE</span>
                      <MemoryAudio src={memory.audioUrl} variant="compact" mediaRef={audioPlayer} />
                    </div>
                  )}

                  {memory.sender && (
                    <p className="smRecipientUnifiedSignature">
                      With love always, <strong>{memory.sender}</strong> <span aria-hidden="true">♡</span>
                    </p>
                  )}
                </div>
                )}
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
    </article>
  );
}
