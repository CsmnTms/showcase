'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="header-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20">
        <Link href="/" aria-label="Home" className="group inline-flex items-center gap-2 shrink-0">
          {/* Name + subtitle bottom-aligned */}
          <span className="brand">
            <span className="brand-title">
              ^showcase
            </span>
            <span className="subtitle">by Tămaș Cosmin</span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/portfolio" className="nav-link">Portfolio</Link>
          <Link href="/blog" className="nav-link">Blog</Link>
          <Link href="/about" className="nav-link">About</Link>
        </nav>

        {/* Mobile */}
        <nav className="flex md:hidden items-center gap-2">
          <Link href="/portfolio" className="nav-link py-2">Portfolio</Link>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="icon-btn"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>

            {menuOpen && (
              <div id="mobile-menu" className="menu">
                <div className="flex flex-col py-1">
                  <Link href="/blog" className="menu-item" onClick={() => setMenuOpen(false)}>Blog</Link>
                  <Link href="/about" className="menu-item" onClick={() => setMenuOpen(false)}>About</Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}