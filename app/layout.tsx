import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'UB Entertainments — Stories that move you',
  description: 'UB Entertainments is an independent production house in Kochi, Keralam, established in 2026. Movies, short films, and music videos.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
