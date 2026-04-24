'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const TOOLS = [
  { label: 'json-formatter', href: '/json-formatter' },
  { label: 'tetris',         href: '/tetris' },
];

export default function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toolsRef  = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      const hh  = now.getHours().toString().padStart(2, '0');
      const mm  = now.getMinutes().toString().padStart(2, '0');
      const mon = now.toLocaleString('en', { month: 'short' }).toLowerCase();
      setTime(`${hh}:${mm} · ${mon} ${now.getDate()}`);
    };
    fmt();
    const id = setInterval(fmt, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (toolsRef.current  && !toolsRef.current.contains(e.target as Node))  setToolsOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setToolsOpen(false); setMobileOpen(false); }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown',   onKey);
    };
  }, []);

  return (
    <header className="site-nav">
      {/* Left: brand + links */}
      <div className="site-nav-left">
        <Link href="/" className="site-nav-brand">
          <span style={{ color: 'var(--rust)' }}>●</span>&nbsp;tecdev.sh
        </Link>
        <span className="site-nav-sep">│</span>

        {/* Desktop nav */}
        <nav className="site-nav-links hidden md:flex">
          <Link href="/" className="nav-item">[~/home]</Link>
          <Link href="/portfolio" className="nav-item">[projects]</Link>

          {/* Tools dropdown */}
          <div ref={toolsRef} className="nav-item-wrap">
            <button
              className="nav-item"
              aria-haspopup="menu"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen(o => !o)}
            >
              [tools&nbsp;{toolsOpen ? '▴' : '▾'}]
            </button>
            {toolsOpen && (
              <div className="nav-dropdown" role="menu">
                {TOOLS.map(t => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="nav-dropdown-item"
                    onClick={() => setToolsOpen(false)}
                  >
                    ▸&nbsp;{t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about" className="nav-item">[about]</Link>
        </nav>
      </div>

      {/* Right: clock (desktop) + mobile hamburger */}
      <div className="flex items-center gap-3">
        {time && (
          <span
            className="hidden md:block"
            style={{ color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: 11 }}
          >
            {time}
          </span>
        )}

        {/* Mobile hamburger */}
        <div ref={mobileRef} className="relative md:hidden">
          <button
            className="nav-item"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? '[×]' : '[≡]'}
          </button>

          {mobileOpen && (
            <div className="nav-mobile-menu" role="menu">
              <Link href="/"          className="nav-mobile-item" onClick={() => setMobileOpen(false)}>▸ ~/home</Link>
              <Link href="/portfolio" className="nav-mobile-item" onClick={() => setMobileOpen(false)}>▸ projects</Link>
              <div className="nav-mobile-sep" />
              <span className="nav-mobile-label">tools</span>
              {TOOLS.map(t => (
                <Link key={t.href} href={t.href} className="nav-mobile-item" onClick={() => setMobileOpen(false)}>
                  ▸&nbsp;{t.label}
                </Link>
              ))}
              <div className="nav-mobile-sep" />
              <Link href="/about" className="nav-mobile-item" onClick={() => setMobileOpen(false)}>▸ about</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
