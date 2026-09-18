import './globals.css';

export const metadata = {
  title: 'VYRO — Connect. Create. Share.',
  description: 'VYRO — বাংলাদেশের নিজস্ব social app. Photo & video posts, reels, messaging, explore আর privacy-first profile.',
  manifest: '/manifest.webmanifest',
};

export const viewport = { themeColor: '#7c3aed' };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
