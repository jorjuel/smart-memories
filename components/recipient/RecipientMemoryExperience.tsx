'use client';

import {
  useState,
} from 'react';

import Link from 'next/link';

import MemoryCover from './MemoryCover';
import MemoryAudio from './MemoryAudio';
import MemoryGallery from './MemoryGallery';
import MemoryVideo from './MemoryVideo';
import MemoryMessage from './MemoryMessage';

import type {
  MemoryImage,
  PublicMemory,
} from './types';

export default function RecipientMemoryExperience({
  memory,
}: {
  memory: PublicMemory;
}) {
  const [
    opened,
    setOpened,
  ] = useState(false);

  const images:
    MemoryImage[] =
    memory.photoUrl
      ? [
          {
            src:
              memory.photoUrl,

            alt:
              memory.recipient
                ? `A memory for ${memory.recipient}`
                : 'Smart Memory photograph',
          },
        ]
      : [];

  function openMemory() {
    setOpened(true);

    window.setTimeout(
      () => {
        const target =
          document.getElementById(
            'memory-story'
          );

        if (!target) {
          return;
        }

        const reduceMotion =
          window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches;

        target.scrollIntoView({
          behavior:
            reduceMotion
              ? 'auto'
              : 'smooth',
          block:
            'start',
        });
      },
      120
    );
  }

  return (
    <article className="smRecipientExperience">
      <MemoryCover
        recipient={
          memory.recipient
        }
        sender={
          memory.sender
        }
        imageUrl={
          memory.photoUrl
        }
        onOpen={
          openMemory
        }
      />

      {opened && (
        <div
          id="memory-story"
          className="smRecipientStory"
        >
          <div className="smRecipientStoryIntro">
            <span>
              TAP. REMEMBER.
              RELIVE.
            </span>

            <h2>
              A memory made
              especially for you.
            </h2>
          </div>

          {memory.audioUrl && (
            <MemoryAudio
              src={
                memory.audioUrl
              }
            />
          )}

          {images.length >
            0 && (
            <MemoryGallery
              images={
                images
              }
            />
          )}

          {memory.videoUrl && (
            <MemoryVideo
              src={
                memory.videoUrl
              }
            />
          )}

          <MemoryMessage
            message={
              memory.message
            }
            sender={
              memory.sender
            }
          />

          <section className="smRecipientClosing">
            <span
              aria-hidden="true"
            >
              ♡
            </span>

            <h2>
              Keep this memory
              close.
            </h2>

            <p>
              You can return
              anytime by tapping
              your Smart Memory
              gift or scanning
              its QR code again.
            </p>
          </section>

          <footer className="smRecipientFooter">
            <Link
              href="/"
              className="smRecipientFooterBrand"
            >
              SMART MEMORIES
              <span>♥</span>
            </Link>

            <strong>
              Tap. Remember.
              Relive.
            </strong>

            <div>
              <Link href="/privacy">
                Privacy
              </Link>

              <Link href="/contact">
                Having trouble?
              </Link>
            </div>
          </footer>
        </div>
      )}
    </article>
  );
}