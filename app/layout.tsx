import './globals.css';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { StorefrontProvider } from '../components/StorefrontContext';
import { showGiftTagsOnly } from '../lib/storefrontView';

export const metadata = {
  title:
    'Smart Memories | Tap. Remember. Relive.',

  description:
    'Create a personalised Smart Memory with photographs, words, voice and meaningful moments — connected to a gift they can tap and relive.',
};

export default async function Layout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  const giftTagsOnly = await showGiftTagsOnly();
  return (
    <html lang="en">
      <body>
        <SiteHeader giftTagsOnly={giftTagsOnly} />

        <main>
          <StorefrontProvider giftTagsOnly={giftTagsOnly}>{children}</StorefrontProvider>
        </main>

        <SiteFooter giftTagsOnly={giftTagsOnly} />
      </body>
    </html>
  );
}
