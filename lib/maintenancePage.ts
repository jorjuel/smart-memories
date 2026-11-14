/**
 * Self-contained page so unpublished site assets, navigation, and layout
 * are not loaded for visitors while maintenance is enabled.
 */
export const maintenancePageHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="theme-color" content="#f7f3ee">
  <title>Under Construction | Smart Memories</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html, body { min-height: 100%; }
    body {
      margin: 0; color: #352b30; background:
      radial-gradient(circle at 82% 10%, #f4e0dd 0, transparent 32%),
      radial-gradient(circle at 12% 89%, #f3e4d1 0, transparent 33%),
      #f7f3ee;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }
    .shell {
      min-height: 100svh; padding: 42px 22px 34px;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center;
    }
    .wordmark {
      display: flex; gap: 12px; align-items: center;
      text-transform: uppercase; letter-spacing: .24em;
      font-size: 13px; font-weight: 700;
    }
    .symbol {
      display: grid; place-items: center; width: 45px; height: 45px;
      border: 1px solid #bb9e92; border-radius: 50%;
      color: #9d685c; font-size: 23px; line-height: 1;
    }
    .panel {
      text-align: center; max-width: 730px; width: 100%;
      padding: clamp(48px, 8vw, 88px) clamp(25px, 6vw, 72px);
      background: rgba(255,255,255,.75);
      border: 1px solid rgba(177,151,142,.33);
      box-shadow: 0 24px 80px rgba(59,42,43,.065);
      border-radius: 26px; margin: 42px 0 30px;
    }
    .eyebrow {
      text-transform: uppercase; letter-spacing: .23em; font-weight: 700;
      font-size: 11px; color: #966858; margin: 0 0 25px;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 400; font-size: clamp(37px, 7vw, 62px);
      line-height: 1.1; letter-spacing: -.035em; margin: 0 0 24px;
    }
    h1 em { font-style: italic; color: #a56965; }
    .lead { font-size: clamp(17px, 3vw, 20px); line-height: 1.65; margin: 0 auto 16px; max-width: 530px; }
    .detail { color: #6a6060; font-size: 15px; line-height: 1.85; margin: 0 auto; max-width: 510px; }
    .line { height: 1px; width: 75px; background: #d2a898; margin: 32px auto; }
    .tagline { text-transform: uppercase; font-size: 11px; letter-spacing: .24em; font-weight: 600; color: #795d58; margin: 0; }
    footer { font-size: 12px; color: #7f7475; text-align: center; line-height: 1.9; }
    footer a { color: #624a49; text-underline-offset: 3px; }
    footer a:focus-visible { outline: 2px solid #a56965; outline-offset: 4px; }
    @media (max-width: 480px) {
      .shell { padding: 27px 14px; }
      .wordmark { font-size: 11px; letter-spacing: .17em; }
      .panel { margin: 28px 0 23px; border-radius: 20px; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="wordmark" aria-label="Smart Memories">
      <span class="symbol" aria-hidden="true">✦</span>
      <span>Smart Memories</span>
    </header>
    <main class="panel">
      <p class="eyebrow">Something special is taking shape</p>
      <h1>Website <em>under construction</em></h1>
      <p class="lead">Our website is currently under development.</p>
      <p class="detail">
        We’re creating a new way to turn meaningful moments into gifts
        you can hold and memories you can relive.
      </p>
      <div class="line" aria-hidden="true"></div>
      <p class="tagline">Tap. Remember. Relive.</p>
    </main>
    <footer>
      <div>Thank you for your patience.</div>
      <a href="/admin/login" rel="nofollow">Owner access</a>
    </footer>
  </div>
</body>
</html>`;
