import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const { hostname } = new URL(origin);
      if (hostname !== 'smartmemories.co.uk' &&
          hostname !== 'www.smartmemories.co.uk' &&
          hostname !== 'localhost') {
        return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
    }
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }
  if (typeof input.companyWebsite === 'string' && input.companyWebsite) {
    return NextResponse.json({ ok: true });
  }

  function field(key: string, max = 500) {
    const value = input[key];
    return typeof value === 'string' ? value.trim().slice(0, max) : '';
  }

  const name = field('contactName', 120);
  const email = field('email', 254);
  const companyName = field('companyName', 140);
  const message = field('message', 2000);

  if (!name || !companyName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a company, contact name and valid email.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = (process.env.CONTACT_EMAIL_FROM || process.env.DISPATCH_EMAIL_FROM || '').trim();
  const to = (process.env.CONTACT_EMAIL_TO || '').trim();
  if (!apiKey || !from || !to) {
    return NextResponse.json(
      { error: 'Corporate enquiries are not available online yet. Please try again later.' },
      { status: 503 }
    );
  }

  const lines = [
    'Smart Memories corporate enquiry',
    'Company: ' + companyName,
    'Contact: ' + name,
    'Email: ' + email,
    'Phone: ' + field('phone', 50),
    'Product: ' + field('bundle', 160),
    'Quantity: ' + field('quantity', 30),
    'Budget: ' + field('budget', 80),
    'Required date: ' + field('requiredDate', 30),
    'Branding: ' + field('branding', 1600),
    'Message: ' + message,
  ];
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: 'Smart Memories corporate enquiry',
      text: lines.join('\n'),
    });
    if (error) {
      console.error('CORPORATE CONTACT SEND ERROR:', error);
      return NextResponse.json({ error: 'We could not send the enquiry. Please try again later.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('CORPORATE CONTACT ERROR:', error);
    return NextResponse.json({ error: 'We could not send the enquiry. Please try again later.' }, { status: 502 });
  }
}
