import './globals.css';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata = {
  title:
    'Smart Memories | Tap. Remember. Relive.',

  description:
    'Create a personalised Smart Memory with photographs, words, voice and meaningful moments — connected to a gift they can tap and relive.',
};

export default function Layout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />

        <main>
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}