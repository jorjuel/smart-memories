'use client';

import {
  useState,
} from 'react';

export default function CopyMemoryLink({
  code,
}: {
  code: string;
}) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function copy() {
    const url =
      `${window.location.origin}/m/${code}`;

    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopied(true);

      window.setTimeout(
        () =>
          setCopied(
            false
          ),
        2200
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="btn secondary"
      onClick={
        copy
      }
    >
      {copied
        ? 'Memory Link Copied ✓'
        : 'Copy Memory Link'}
    </button>
  );
}