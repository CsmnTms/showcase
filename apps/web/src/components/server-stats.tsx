'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { AscFrame } from './kit';

/* Types */
interface StatusData {
  uptime:        { seconds: number; human: string };
  cpu:           { totalPercent: number; corePercents: number[] };
  memory:        { totalMb: number; usedMb: number; percentUsed: number };
  disks:         Array<{ mount?: string; totalGb: number; usedGb: number; percentUsed: number }>;
  load:          { one: number; five: number; fifteen: number };
  temperatures?: { available: boolean; sensors: Array<{ label: string; celsius: number }> };
  containers?:   { available: boolean; running: number };
}

/* Helpers */
function ascBar(pct: number, width = 10): string {
  const filled = Math.round(Math.min(100, Math.max(0, pct)) / 100 * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

function n(val: unknown, decimals = 0): string {
  return typeof val === 'number' && Number.isFinite(val) ? val.toFixed(decimals) : '--';
}

function validate(d: unknown): StatusData {
  const s = d as StatusData;
  if (typeof s?.cpu?.totalPercent !== 'number') throw new Error('bad shape');
  if (typeof s?.memory?.percentUsed !== 'number') throw new Error('bad shape');
  return s;
}

function nudge(val: number, spread: number): number {
  return Math.min(100, Math.max(0, val + (Math.random() - 0.5) * 2 * spread));
}

function flicker(base: StatusData): StatusData {
  return {
    ...base,
    cpu: {
      ...base.cpu,
      totalPercent: nudge(base.cpu.totalPercent, 3),
      corePercents: base.cpu.corePercents?.map(p => nudge(p, 4)),
    },
    memory:  { ...base.memory, percentUsed: nudge(base.memory.percentUsed, 0.3) },
    temperatures: base.temperatures ? {
      ...base.temperatures,
      sensors: base.temperatures.sensors.map(s => ({ ...s, celsius: nudge(s.celsius, 1) })),
    } : undefined,
  };
}

const GLITCH_CHARS = '#@!?*^%<>|~░▒▓';

function GlitchText({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoreRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef  = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!active) { setDisplay(text); return; }

    const eligible = text.split('').reduce<number[]>((a, c, i) => {
      if (c !== ' ') a.push(i);
      return a;
    }, []);

    const schedule = () => {
      timerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        const count = Math.random() < 0.35 ? 2 : 1;
        const chosen = new Set<number>();
        while (chosen.size < Math.min(count, eligible.length)) {
          chosen.add(eligible[Math.floor(Math.random() * eligible.length)]);
        }
        const chars = text.split('');
        chosen.forEach(i => { chars[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]; });
        setDisplay(chars.join(''));
        restoreRef.current = setTimeout(() => {
          if (activeRef.current) setDisplay(text);
          schedule();
        }, 80 + Math.random() * 80);
      }, 600 + Math.random() * 1200);
    };

    schedule();
    return () => {
      if (timerRef.current)   clearTimeout(timerRef.current);
      if (restoreRef.current) clearTimeout(restoreRef.current);
    };
  }, [text, active]);

  return <>{display}</>;
}

function buildLines(d: StatusData, showCores: boolean, onToggle: () => void, isDone: boolean): ReactNode[] {
  const temp = d.temperatures?.sensors?.[0]?.celsius;
  const lines: ReactNode[] = [
    <span key="hello"><span style={{ color: 'var(--ink-4)' }}>&gt;&nbsp;</span><GlitchText text="hello.." active={isDone} /></span>,
    <span key="struggle"><span style={{ color: 'var(--ink-4)' }}>&gt;&nbsp;</span><GlitchText text="struggling as a home server :( stats:" active={isDone} /></span>,
    <span key="s0" className="server-stats__sep">---</span>,
    <span key="uptime" style={{ whiteSpace: 'pre' }}>uptime   {d.uptime.human}</span>,
    <span key="s1" className="server-stats__sep">---</span>,
    <span key="cpu" className="server-stats__row">
      <span style={{ whiteSpace: 'pre' }}>cpu      </span>
      <span style={{ color: 'var(--rust)' }}>{ascBar(d.cpu.totalPercent)}</span>
      <span> {n(d.cpu.totalPercent)}%</span>
      {temp !== undefined && <span className="server-stats__dim">&ensp;{n(temp)}°C</span>}
      <button className="server-stats__toggle" onClick={onToggle} aria-label="toggle cores">
        {showCores ? '[-cores]' : '[+cores]'}
      </button>
    </span>,
  ];

  if (showCores) {
    d.cpu.corePercents?.forEach((pct, i) => {
      lines.push(
        <span key={`c${i}`} className="server-stats__row">
          <span className="server-stats__dim" style={{ whiteSpace: 'pre' }}>  ·c{i}     </span>
          <span style={{ color: 'var(--rust)' }}>{ascBar(pct, 8)}</span>
          <span className="server-stats__dim"> {n(pct)}%</span>
        </span>
      );
    });
  }

  lines.push(<span key="s2" className="server-stats__sep">---</span>);
  lines.push(
    <span key="ram" className="server-stats__row">
      <span style={{ whiteSpace: 'pre' }}>ram      </span>
      <span style={{ color: 'var(--rust)' }}>{ascBar(d.memory.percentUsed)}</span>
      <span> {n(d.memory.percentUsed)}%</span>
      <span className="server-stats__dim">
        &ensp;{n(d.memory.usedMb / 1024, 1)} / {n(d.memory.totalMb / 1024, 1)} GB
      </span>
    </span>
  );

  if (d.disks?.length > 0) {
    lines.push(<span key="s3" className="server-stats__sep">---</span>);
    d.disks.forEach((disk, i) => {
      lines.push(
        <span key={`disk${i}`} className="server-stats__row">
          <span style={{ whiteSpace: 'pre' }}>{i === 0 ? 'disk     ' : '         '}</span>
          <span style={{ color: 'var(--rust)' }}>{ascBar(disk.percentUsed)}</span>
          <span> {n(disk.percentUsed)}%</span>
          <span className="server-stats__dim">
            &ensp;{n(disk.usedGb)} / {n(disk.totalGb)} GB
            {disk.mount && ` (${disk.mount})`}
          </span>
        </span>
      );
    });
  }

  if (d.load) {
    lines.push(<span key="s4" className="server-stats__sep">---</span>);
    lines.push(
      <span key="load" className="server-stats__dim">
        load&ensp;{n(d.load.one, 2)}&nbsp;·&nbsp;{n(d.load.five, 2)}&nbsp;·&nbsp;{n(d.load.fifteen, 2)}
        &ensp;<span style={{ fontSize: 10 }}>(1m 5m 15m)</span>
        {isDone && <>&nbsp;<span className="blink" style={{ color: 'var(--rust)' }}>▌</span></>}
      </span>
    );
  }

  return lines;
}

const STATUS_URL = process.env.NEXT_PUBLIC_STATUS_URL;
const POLL_MS    = 10_000;
const FLICKER_MS = 1_200;
const CMD        = "hmm i wonder what's my 10yo laptop doing";
const SPINNER    = ['|', '/', '-', '\\'];
const REVEAL_MS  = 90;

type Phase = 'typing' | 'loading' | 'revealing' | 'done' | 'error';

/* Component */
export default function ServerStats() {
  const real           = useRef<StatusData | null>(null);
  const [display,    setDisplay]    = useState<StatusData | null>(null);
  const [phase,      setPhase]      = useState<Phase>('typing');
  const [cmdTyped,   setCmdTyped]   = useState('');
  const [spinnerIdx, setSpinnerIdx] = useState(0);
  const [revealed,   setRevealed]   = useState(0);
  const [showCores,  setShowCores]  = useState(false);
  const toggleCores = () => setShowCores(c => !c);

  // Phase: type command letter by letter
  useEffect(() => {
    if (phase !== 'typing') return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setCmdTyped(CMD.slice(0, i));
      if (i >= CMD.length) { clearInterval(id); setPhase('loading'); }
    }, 45);
    return () => clearInterval(id);
  }, [phase]);

  // Phase: spinner + fetch
  useEffect(() => {
    if (phase !== 'loading' || !STATUS_URL) {
      if (phase === 'loading') setPhase('error');
      return;
    }
    const spinnerId = setInterval(() => setSpinnerIdx(i => (i + 1) % 4), 100);
    fetch(`${STATUS_URL}/status`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        clearInterval(spinnerId);
        const v = validate(d);
        real.current = v;
        setDisplay(v);
        setRevealed(0);
        setPhase('revealing');
      })
      .catch(() => { clearInterval(spinnerId); setPhase('error'); });
    return () => clearInterval(spinnerId);
  }, [phase]);

  // Phase: reveal output lines one by one
  const lineCount = display ? buildLines(display, false, () => {}, false).length : 0;
  useEffect(() => {
    if (phase !== 'revealing') return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= lineCount) { clearInterval(id); setPhase('done'); }
    }, REVEAL_MS);
    return () => clearInterval(id);
  }, [phase, lineCount]);

  // Phase: done — poll + flicker in background
  useEffect(() => {
    if (phase !== 'done' || !STATUS_URL) return;
    const pollId = setInterval(() =>
      fetch(`${STATUS_URL}/status`)
        .then(r => r.json())
        .then(d => { const v = validate(d); real.current = v; setDisplay(v); })
        .catch(() => {}),
      POLL_MS
    );
    const flickerId = setInterval(() => {
      if (real.current) setDisplay(flicker(real.current));
    }, FLICKER_MS);
    return () => { clearInterval(pollId); clearInterval(flickerId); };
  }, [phase]);

  if (!STATUS_URL) return null;

  const lines    = display ? buildLines(display, phase === 'done' ? showCores : false, toggleCores, phase === 'done') : [];
  const visible  = phase === 'done' ? lines : lines.slice(0, revealed);

  const frameTitle = (
    <>
      tecdevsrvr
      {phase === 'done' && (
        <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400 }}>&ensp;(live™ data)</span>
      )}
    </>
  );

  return (
    <AscFrame title={frameTitle} style={{ background: 'var(--bg-1)' }}>
      <div className="messages-terminal" style={{ resize: 'none' }}>

        {/* command prompt */}
        <span className="messages-prompt-line">
          <span className="messages-prompt-label">
            <span style={{ color: 'var(--olive)' }}>tecdev</span>
            <span style={{ color: 'var(--ink-4)' }}>@tecdevsrvr:~$&nbsp;</span>
          </span>
          <span style={{ color: 'var(--ink)', whiteSpace: 'pre' }}>{cmdTyped}</span>
          {phase === 'typing' && <span className="blink" style={{ color: 'var(--rust)' }}>▌</span>}
        </span>

        {/* loading spinner */}
        {phase === 'loading' && (
          <span style={{ color: 'var(--ink-4)' }}>
            connecting to tecdevsrvr... {SPINNER[spinnerIdx]}
          </span>
        )}

        {/* error state */}
        {phase === 'error' && (
          <>
            <span style={{ color: 'var(--ink-4)' }}>connecting to tecdevsrvr... failed.</span>
            <span>connection timed out. dead. ☠</span>
          </>
        )}

        {/* output lines (revealed progressively, then live) */}
        {visible}

      </div>
    </AscFrame>
  );
}

