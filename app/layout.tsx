import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'UB Entertainment — Stories that move you',
  description: 'UB Entertainment is an independent production house in Kochi, Kerala, established in 2026. Movies, short films, and music videos.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
