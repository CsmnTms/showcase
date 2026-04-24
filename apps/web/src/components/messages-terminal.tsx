'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AscFrame } from './kit';

type Msg = { text: string; rtl?: boolean };

const MESSAGES: Msg[] = [
  { text: 'dlrow olleh', rtl: true },
  { text: 'i saw a bird today' },
];

function pickRandom(exclude?: string): Msg {
  const pool = MESSAGES.length > 1 ? MESSAGES.filter(m => m.text !== exclude) : MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function MessagesTerminal() {
  const [history, setHistory]   = useState<Msg[]>([]);
  const [current, setCurrent]   = useState<Msg | null>(null);
  const [typed,   setTyped]     = useState('');
  const [typing,  setTyping]    = useState(false);
  const [hint,    setHint]      = useState(false);
  const [ready,   setReady]     = useState(false);
  const lastText = useRef('');

  const startMessage = useCallback((msg: Msg) => {
    setCurrent(msg);
    setTyped(msg.rtl ? ' '.repeat(msg.text.length) : '');
    setTyping(true);
    setHint(false);
    lastText.current = msg.text;
  }, []);

  // boot
  useEffect(() => {
    setReady(true);
    const t = setTimeout(() => startMessage(pickRandom()), 900);
    return () => clearTimeout(t);
  }, [startMessage]);

  // typewriter
  useEffect(() => {
    if (!typing || !current) return;
    let i = 0;
    const { text, rtl } = current;
    const id = setInterval(() => {
      i++;
      setTyped(rtl ? text.slice(text.length - i).padStart(text.length) : text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setTyping(false); setHint(true); }
    }, 55);
    return () => clearInterval(id);
  }, [typing, current]);

  const next = useCallback(() => {
    if (typing || !hint || !current) return;
    setHistory(h => [...h, current]);
    startMessage(pickRandom(lastText.current));
  }, [typing, hint, current, startMessage]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next]);

  return (
    <AscFrame title="stdout">
      <div
        className="messages-terminal"
        onClick={next}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && next()}
        aria-label="Press any key or tap for a new message"
      >
        <span className="messages-boot">booting tecdev.sh...</span>
        <span className="messages-boot">v0.0.7</span>

        {history.map((m, i) => (
          <span key={i} className="messages-prompt-line messages-done">
            <span className="messages-prompt-label">
              <span style={{ color: 'var(--olive)' }}>tecdev</span>
              <span style={{ color: 'var(--ink-4)' }}>:~$&nbsp;</span>
            </span>
            <span style={{ color: 'var(--ink-3)', whiteSpace: 'pre' }}>{m.text}</span>
          </span>
        ))}

        <span className="messages-prompt-line">
          <span className="messages-prompt-label">
            <span style={{ color: 'var(--olive)' }}>tecdev</span>
            <span style={{ color: 'var(--ink-4)' }}>:~$&nbsp;</span>
          </span>
          <span style={{ color: 'var(--ink)', whiteSpace: 'pre' }}>{typed}</span>
          {ready && <span className="blink" style={{ color: 'var(--rust)' }}>▌</span>}
        </span>

        {hint && (
          <span className="messages-hint">press any key · tap for new message</span>
        )}
      </div>
    </AscFrame>
  );
}
