import { Resend } from 'resend';

import {
  getCanonicalSiteUrl,
} from '@/lib/memoryUrl';

type DispatchEmailInput = {
  customerEmail: string;
  customerName: string | null;
  orderNumber: string;
  carrier?: string | null;
  trackingNumber?: string | null;
};

type DispatchEmailResult =
  | {
      sent: true;
      messageId: string | null;
    }
  | {
      sent: false;
      reason: string;
    };

export async function sendDispatchEmail({
  customerEmail,
  customerName,
  orderNumber,
  carrier,
  trackingNumber,
}: DispatchEmailInput): Promise<DispatchEmailResult> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const from =
    process.env.DISPATCH_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return {
      sent: false,
      reason:
        'Dispatch email is not configured.',
    };
  }

  const resend =
    new Resend(apiKey);

  const siteUrl =
    getCanonicalSiteUrl();

  const ordersUrl =
    `${siteUrl}/account/orders`;

  const name =
    customerName?.trim() ||
    'there';

  const carrierText =
    carrier?.trim()
      ? `Carrier: ${carrier.trim()}`
      : null;

  const trackingText =
    trackingNumber?.trim()
      ? `Tracking number: ${trackingNumber.trim()}`
      : null;

  const textLines = [
    `Hi ${name},`,
    '',
    `Your Smart Memories order ${orderNumber} has been dispatched.`,
    '',
    carrierText,
    trackingText,
    '',
    'You can view your order status here:',
    ordersUrl,
    '',
    'Thank you for choosing Smart Memories.',
    '',
    'Tap. Remember. Relive.',
  ].filter(
    (
      line
    ): line is string =>
      Boolean(line)
  );

  try {
    const {
      data,
      error,
    } =
      await resend.emails.send({
        from,
        to: customerEmail,
        subject:
          `Your Smart Memories order ${orderNumber} has been dispatched`,
        text:
          textLines.join('\n'),

        html: `
          <div style="
            font-family: Arial, Helvetica, sans-serif;
            max-width: 620px;
            margin: 0 auto;
            padding: 32px 20px;
            color: #33252b;
            background: #fffaf7;
          ">
            <div style="
              background: #ffffff;
              border: 1px solid #ead8cf;
              border-radius: 18px;
              padding: 30px;
            ">
              <div style="
                font-size: 12px;
                letter-spacing: 0.14em;
                font-weight: 700;
                color: #9c6d79;
                margin-bottom: 12px;
              ">
                SMART MEMORIES
              </div>

              <h1 style="
                margin: 0 0 18px;
                font-size: 28px;
                line-height: 1.2;
              ">
                Your order is on its way
              </h1>

              <p>
                Hi ${escapeHtml(name)},
              </p>

              <p>
                Your Smart Memories order
                <strong>${escapeHtml(orderNumber)}</strong>
                has now been dispatched.
              </p>

              ${
                carrierText
                  ? `
                    <p>
                      <strong>Carrier:</strong>
                      ${escapeHtml(carrier!.trim())}
                    </p>
                  `
                  : ''
              }

              ${
                trackingText
                  ? `
                    <p>
                      <strong>Tracking number:</strong>
                      ${escapeHtml(trackingNumber!.trim())}
                    </p>
                  `
                  : ''
              }

              <div style="margin: 28px 0;">
                <a
                  href="${escapeHtml(ordersUrl)}"
                  style="
                    display: inline-block;
                    padding: 13px 20px;
                    border-radius: 999px;
                    background: #432c35;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 700;
                  "
                >
                  View My Orders
                </a>
              </div>

              <p>
                Thank you for choosing Smart Memories.
              </p>

              <p style="
                margin-top: 24px;
                color: #8a6974;
                font-size: 14px;
              ">
                Tap. Remember. Relive.
              </p>
            </div>
          </div>
        `,
      });

    if (error) {
      console.error(
        'DISPATCH EMAIL ERROR:',
        error
      );

      return {
        sent: false,
        reason:
          error.message ||
          'Email provider returned an error.',
      };
    }

    return {
      sent: true,
      messageId:
        data?.id || null,
    };
  } catch (error) {
    console.error(
      'DISPATCH EMAIL EXCEPTION:',
      error
    );

    return {
      sent: false,
      reason:
        error instanceof Error
          ? error.message
          : 'Unknown email error',
    };
  }
}

function escapeHtml(
  value: string
) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}