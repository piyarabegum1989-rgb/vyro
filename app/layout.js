import './globals.css';
import PwaRegister from '@/components/PwaRegister';

export const metadata = {
  title: 'VIRO — Connect. Share. Be Real.',
  description: 'VIRO is a mobile-first social app for sharing photos, videos, reels, music and messages.',
  manifest: '/manifest.webmanifest',
};

export const viewport = { themeColor: '#050a12' };

export default function RootLayout({ children }) {
  return <html lang="en"><head><link rel="icon" href="/viro-v-mark.png" /><link rel="apple-touch-icon" href="/viro-v-mark.png" /></head><body><PwaRegister />{children}</body></html>;
}
