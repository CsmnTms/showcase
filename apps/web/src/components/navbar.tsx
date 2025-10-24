'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const clickedOutsideMobile = menuRef.current && !menuRef.current.contains(target);
      const clickedOutsideTools = toolsRef.current && !toolsRef.current.contains(target);
      // If clicking outside either menu, close them.
      if (clickedOutsideMobile) setMenuOpen(false);
      if (clickedOutsideTools) setToolsOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setToolsOpen(false);
      }
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
          {/* Replaced Blog with Tools dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              type="button"
              className="nav-link inline-flex items-center gap-1"
              aria-haspopup="menu"
              aria-expanded={toolsOpen}
              aria-controls="desktop-tools-menu"
              onClick={() => setToolsOpen(o => !o)}
            >
              Tools
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeWidth="2" strokeLinecap="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {toolsOpen && (
              <div id="desktop-tools-menu" className="menu">
                <div className="flex flex-col py-1">
                  {/* JSON Formatter routes to /json-formatter as requested */}
                  <Link href="/json-formatter" className="menu-item" onClick={() => setToolsOpen(false)}>
                    JSON Formatter
                  </Link>
                  {/* Future tools can be added here */}
                </div>
              </div>
            )}
          </div>
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
                  {/* Show tools directly as items on mobile */}
                  <span className="px-3 py-1 text-xs font-medium text-neutral-500">Tools</span>
                  <Link href="/json-formatter" className="menu-item" onClick={() => setMenuOpen(false)}>JSON Formatter</Link>
                  <div className="h-px bg-neutral-200 my-1" />
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