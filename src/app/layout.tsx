import type { Metadata } from 'next';
import { Caveat, Bungee, Quicksand } from 'next/font/google';
import './globals.css';

const hand = Caveat({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-hand' });
const display = Bungee({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const body = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });

export const metadata: Metadata = {
  title: "Viv's Nail Diary",
  description: 'Kennesaw-based nail tech - book your next set in the diary.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hand.variable} ${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
