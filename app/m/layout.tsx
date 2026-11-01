import type {
  Metadata,
} from 'next';

export const metadata:
  Metadata = {
  title:
    'A Smart Memory has been shared with you',

  description:
    'Tap to open this personal Smart Memory.',

  robots: {
    index: false,
    follow: false,

    googleBot: {
      index: false,
      follow: false,
    },
  },

  openGraph: {
    title:
      'A Smart Memory has been shared with you',

    description:
      'Tap to open this personal Smart Memory.',

    type:
      'website',
  },

  twitter: {
    card:
      'summary',

    title:
      'A Smart Memory has been shared with you',

    description:
      'Tap to open this personal Smart Memory.',
  },
};

export default function PublicMemoryLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}