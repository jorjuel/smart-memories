'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import '../gift-tags.css';

export default function GiftTagActivationPage() {
  const [publicCode, setPublicCode] = useState('');
  const [activationSecret, setActivationSecret] = useState('');
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState('');
  const [complete, setComplete] = useState(false);

  async function claimTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setStatus('');
    try {
      const response = await fetch('/api/gift-tags/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ publicCode, activationSecret }),
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus(typeof result.error === 'string' ? result.error : 'Activation failed.');
        return;
      }
      setComplete(true);
      setStatus('Tag successfully linked to your account. Memory editing will be available when the Gift Tag service launches.');
      setActivationSecret('');
    } catch {
      setStatus('Unable to connect. Please try again later.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="smGiftTagActivate">
      <div className="smGiftTagActivatePanel">
        <Link href="/gift-tags" className="smGiftTagTextLink">← Back to Memory Gift Tags</Link>
        <span className="eyebrow">SMART MEMORIES · SECURE ACTIVATION</span>
        <h1>Make your gift tag yours.</h1>
        <p>
          Sign in to the account used for your purchase and enter the tag code
          and your <strong>separate private activation code</strong>.
          The public NFC/QR link alone cannot activate a gift tag.
        </p>
        {!complete ? (
          <form onSubmit={claimTag} className="smGiftTagActivateForm">
            <label htmlFor="publicCode">Gift tag code</label>
            <input
              id="publicCode"
              name="publicCode"
              required
              maxLength={12}
              autoComplete="off"
              placeholder="12-character tag code"
              value={publicCode}
              onChange={(event) => setPublicCode(event.target.value.toUpperCase())}
            />
            <label htmlFor="activationSecret">Private activation code</label>
            <input
              id="activationSecret"
              name="activationSecret"
              type="password"
              required
              minLength={32}
              maxLength={128}
              autoComplete="off"
              placeholder="Provided separately after purchase"
              value={activationSecret}
              onChange={(event) => setActivationSecret(event.target.value)}
            />
            <button className="btn big" type="submit" disabled={working}>
              {working ? 'Checking your tag…' : 'Activate gift tag'}
            </button>
          </form>
        ) : (
          <Link className="btn big" href="/account">Go to my account</Link>
        )}
        {status && <p role="status" aria-live="polite" className="smGiftTagActivationStatus">{status}</p>}
        <p className="smGiftTagPrelaunch">
          Gift Tags are in development. No tags are being sold or issued yet.
          This form is being prepared for secure activation testing.
        </p>
        <p>Need an account? <Link href="/account/login">Sign in or register</Link>.</p>
      </div>
    </main>
  );
}
