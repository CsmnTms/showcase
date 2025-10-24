import './globals.css';
import Navbar from '@/components/navbar';
import Providers from './providers';

export const metadata = {
  title: '^showcase',
  description: 'Clean architecture backends & thoughtful frontends.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
