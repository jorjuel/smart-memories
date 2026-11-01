'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  MemoryImage,
} from './types';

export default function MemoryGallery({
  images,
}: {
  images: MemoryImage[];
}) {
  const [
    failedSources,
    setFailedSources,
  ] = useState<
    Set<string>
  >(new Set());

  const [
    openIndex,
    setOpenIndex,
  ] = useState<
    number | null
  >(null);

  const touchStart =
    useRef<
      number | null
    >(null);

  const visibleImages =
    useMemo(
      () =>
        images.filter(
          (image) =>
            !failedSources.has(
              image.src
            )
        ),
      [
        images,
        failedSources,
      ]
    );

  function markFailed(
    src: string
  ) {
    setFailedSources(
      (current) => {
        const next =
          new Set(
            current
          );

        next.add(
          src
        );

        return next;
      }
    );
  }

  function previous() {
    setOpenIndex(
      (current) => {
        if (
          current === null
        ) {
          return null;
        }

        return (
          current -
            1 +
          visibleImages.length
        ) %
          visibleImages.length;
      }
    );
  }

  function next() {
    setOpenIndex(
      (current) => {
        if (
          current === null
        ) {
          return null;
        }

        return (
          current + 1
        ) %
          visibleImages.length;
      }
    );
  }

  useEffect(() => {
    if (
      openIndex ===
      null
    ) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    function onKeyDown(
      event:
        KeyboardEvent
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        setOpenIndex(
          null
        );
      }

      if (
        visibleImages.length >
          1 &&
        event.key ===
          'ArrowLeft'
      ) {
        previous();
      }

      if (
        visibleImages.length >
          1 &&
        event.key ===
          'ArrowRight'
      ) {
        next();
      }
    }

    window.addEventListener(
      'keydown',
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        onKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    openIndex,
    visibleImages.length,
  ]);

  if (
    visibleImages.length ===
    0
  ) {
    return null;
  }

  const heading =
    visibleImages.length >
    1
      ? 'Our Memories'
      : 'A moment to keep';

  return (
    <>
      <section className="smRecipientSection smRecipientGallerySection">
        <span className="smRecipientSectionLabel">
          PHOTOS
        </span>

        <h2>
          {heading}
        </h2>

        <div
          className={
            visibleImages.length ===
            1
              ? 'smRecipientGallery single'
              : 'smRecipientGallery'
          }
        >
          {visibleImages.map(
            (
              image,
              index
            ) => (
              <button
                type="button"
                key={
                  image.src
                }
                className="smRecipientGalleryItem"
                onClick={() =>
                  setOpenIndex(
                    index
                  )
                }
                aria-label={`Open photo ${
                  index + 1
                }`}
              >
                <img
                  src={
                    image.src
                  }
                  alt={
                    image.alt
                  }
                  loading="lazy"
                  decoding="async"
                  onError={() =>
                    markFailed(
                      image.src
                    )
                  }
                />

                {image.caption && (
                  <span>
                    {
                      image.caption
                    }
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </section>

      {openIndex !==
        null &&
        visibleImages[
          openIndex
        ] && (
          <div
            className="smRecipientLightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Memory photo viewer"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setOpenIndex(
                  null
                );
              }
            }}
            onTouchStart={(
              event
            ) => {
              touchStart.current =
                event.touches[0]
                  ?.clientX ??
                null;
            }}
            onTouchEnd={(
              event
            ) => {
              if (
                touchStart.current ===
                null
              ) {
                return;
              }

              const end =
                event
                  .changedTouches[0]
                  ?.clientX;

              if (
                typeof end !==
                'number'
              ) {
                return;
              }

              const difference =
                end -
                touchStart.current;

              touchStart.current =
                null;

              if (
                Math.abs(
                  difference
                ) < 50 ||
                visibleImages.length <=
                  1
              ) {
                return;
              }

              if (
                difference >
                0
              ) {
                previous();
              } else {
                next();
              }
            }}
          >
            <button
              type="button"
              className="smRecipientLightboxClose"
              onClick={() =>
                setOpenIndex(
                  null
                )
              }
              aria-label="Close photo"
            >
              ×
            </button>

            {visibleImages.length >
              1 && (
              <button
                type="button"
                className="smRecipientLightboxPrevious"
                onClick={
                  previous
                }
                aria-label="Previous photo"
              >
                ‹
              </button>
            )}

            <figure>
              <img
                src={
                  visibleImages[
                    openIndex
                  ].src
                }
                alt={
                  visibleImages[
                    openIndex
                  ].alt
                }
                onError={() => {
                  markFailed(
                    visibleImages[
                      openIndex
                    ].src
                  );

                  setOpenIndex(
                    null
                  );
                }}
              />

              {visibleImages[
                openIndex
              ].caption && (
                <figcaption>
                  {
                    visibleImages[
                      openIndex
                    ].caption
                  }
                </figcaption>
              )}
            </figure>

            {visibleImages.length >
              1 && (
              <button
                type="button"
                className="smRecipientLightboxNext"
                onClick={
                  next
                }
                aria-label="Next photo"
              >
                ›
              </button>
            )}
          </div>
        )}
    </>
  );
}
