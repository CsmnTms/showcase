import type { CSSProperties, ReactNode } from 'react';

/* ── AscFrame ────────────────────────────────────────────────── */
type AscFrameProps = {
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function AscFrame({ title, children, style, className }: AscFrameProps) {
  return (
    <div className={`asc${className ? ` ${className}` : ''}`} style={style}>
      <span className="asc__corner--tl" aria-hidden="true" />
      <span className="asc__corner--tr" aria-hidden="true" />
      <span className="asc__corner--bl" aria-hidden="true" />
      <span className="asc__corner--br" aria-hidden="true" />
      {title && (
        <span className="asc-title">
          <span className="hash">#</span>&nbsp;{title}
        </span>
      )}
      {children}
    </div>
  );
}

/* ── WinBar ──────────────────────────────────────────────────── */
type WinBarProps = {
  title: ReactNode;
  right?: ReactNode;
};

export function WinBar({ title, right }: WinBarProps) {
  return (
    <div className="win-bar">
      <div className="win-bar-left">
        <span style={{ color: 'var(--rust)' }}>●</span>
        <span style={{ color: 'var(--mustard)' }}>●</span>
        <span style={{ color: 'var(--olive)' }}>●</span>
        <span className="win-bar-title">{title}</span>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

/* ── SecH ────────────────────────────────────────────────────── */
type SecHProps = {
  level?: 1 | 2 | 3;
  children: ReactNode;
  style?: CSSProperties;
};

export function SecH({ level = 2, children, style }: SecHProps) {
  return (
    <p className="sec-h" style={style}>
      <span className="hash">{'#'.repeat(level)}</span>
      {children}
    </p>
  );
}

/* ── Pill ────────────────────────────────────────────────────── */
type PillProps = {
  tone?: 'rust' | 'olive' | 'teal' | 'mustard';
  children: ReactNode;
};

export function Pill({ tone, children }: PillProps) {
  return (
    <span className={`pill${tone ? ` ${tone}` : ''}`}>{children}</span>
  );
}

/* ── Tag ─────────────────────────────────────────────────────── */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}
