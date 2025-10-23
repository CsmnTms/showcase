import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Your Name<span className="opacity-60"> — .NET</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/portfolio" className="hover:opacity-80">Portfolio</Link>
          <Link href="/blog" className="hover:opacity-80">Blog</Link>
          <Link href="/about" className="hover:opacity-80">About</Link>
        </nav>
      </div>
    </header>
  );
}