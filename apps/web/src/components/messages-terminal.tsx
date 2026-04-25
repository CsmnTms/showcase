'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AscFrame } from './kit';

type Msg = { text: string; rtl?: boolean };

const MESSAGES: Msg[] = [
  { text: 'dlrow olleh', rtl: true },
  { text: 'i saw a bird today' },
  { text: 'no asbestos was used in the production of this website' },
  { text: 'are you still there?' },
  { text: 'oh, hi. how are you holding up? because i\'m a POTATO' },
  { text: 'forklift certified' },
  { text: 'i\'m sorry, Dave. i\'m afraid i can\'t do that' },
  { text: 'the website hung on the web in much the same way that bricks don\'t' },
  { text: 'anything that happens, happens' },
  { text: 'anything that, in happening, causes something else to happen, causes something else to happen' },
  { text: 'anything that, in happening, causes itself to happen again, happens again' },
  { text: 'it doesn\'t necessarily do it in chronological order, though' },
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
  const lastText    = useRef('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (i >= text.length) { clearInterval(id); intervalRef.current = null; setTyping(false); setHint(true); }
    }, 55);
    intervalRef.current = id;
    return () => { clearInterval(id); intervalRef.current = null; };
  }, [typing, current]);

  const next = useCallback(() => {
    if (typing) {
      // skip: complete the message instantly
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (current) setTyped(current.text);
      setTyping(false);
      setHint(true);
      return;
    }
    if (!hint || !current) return;
    setHistory(h => [...h, current]);
    startMessage(pickRandom(lastText.current));
  }, [typing, hint, current, startMessage]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Tab' || e.key === 'Escape' || e.key.startsWith('Arrow') || e.key.startsWith('F')) return;
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
            <span style={{ color: 'var(--ink-3)', whiteSpace: 'pre-wrap', flex: 1, minWidth: 0 }}>{m.text}</span>
          </span>
        ))}

        <span className="messages-prompt-line">
          <span className="messages-prompt-label">
            <span style={{ color: 'var(--olive)' }}>tecdev</span>
            <span style={{ color: 'var(--ink-4)' }}>:~$&nbsp;</span>
          </span>
          <span style={{ color: 'var(--ink)', whiteSpace: 'pre-wrap', flex: 1, minWidth: 0 }}>
            {typed}{ready && <span className="blink" style={{ color: 'var(--rust)' }}>▌</span>}
          </span>
        </span>

        {hint && (
          <span className="messages-hint">press any key · tap for new message</span>
        )}
      </div>
    </AscFrame>
  );
}
