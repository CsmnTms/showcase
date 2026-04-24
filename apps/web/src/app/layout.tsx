import './globals.css';
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/navbar';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'tecdev · showcase',
  description: 'Tămaș Cosmin — software developer. C# · TypeScript · Next.js.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dusk"
      className={`${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="kit">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
