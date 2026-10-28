'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CloudMemory = {
  code: string;
  recipient: string;
  message: string | null;
  sender: string | null;
  createdAt: string;
  photoUrl: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
};

export default function AdminMemories() {
  const [items, setItems] = useState<CloudMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMemories() {
      try {
        const response = await fetch('/api/memories', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Could not load memories');
        }

        const data = await response.json();
        setItems(data);
      } catch {
        setError('Could not load the cloud memory library.');
      } finally {
        setLoading(false);
      }
    }

    loadMemories();
  }, []);

  return (
    <section className="wrap">
      <div className="titleRow">
        <div>
          <h1>Memory Library</h1>
          <p className="lead">
            Smart Memories stored securely in the cloud.
          </p>
        </div>

        <Link className="btn" href="/create">
          + New Memory
        </Link>
      </div>

      {loading && (
        <div className="card">
          <p>Loading cloud memories...</p>
        </div>
      )}

      {error && (
        <div className="card">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="card">
          <p>No cloud memories yet.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="card table">
          {items.map((m) => (
            <div className="tr" key={m.code}>
              <Link href={`/m/${m.code}`}>
                {m.recipient}
              </Link>

              <span>{m.code}</span>

              <span>
                {m.audioUrl ? '🎙 MEDIA READY' : 'NO AUDIO'}
              </span>

              <span>
                {m.photoUrl ? 'PHOTO READY' : 'NO PHOTO'}
              </span>

              <span>NFC TO PROGRAM</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}