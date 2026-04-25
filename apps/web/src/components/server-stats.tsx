'use client';

import { useEffect, useRef, useState } from 'react';
import { AscFrame } from './kit';

/* ── Types ──────────────────────────────────────────────────── */
interface StatusData {
  uptime:        { seconds: number; human: string };
  cpu:           { totalPercent: number; corePercents: number[] };
  memory:        { totalMb: number; usedMb: number; percentUsed: number };
  disks:         Array<{ mount?: string; totalGb: number; usedGb: number; percentUsed: number }>;
  load:          { one: number; five: number; fifteen: number };
  temperatures?: { available: boolean; sensors: Array<{ label: string; celsius: number }> };
  containers?:   { available: boolean; running: number };
}

/* ── Helpers ────────────────────────────────────────────────── */
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

// Apply small realistic noise between polls so the widget feels live
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
    memory:  { ...base.memory,  percentUsed: nudge(base.memory.percentUsed, 0.3) },
    temperatures: base.temperatures ? {
      ...base.temperatures,
      sensors: base.temperatures.sensors.map(s => ({ ...s, celsius: nudge(s.celsius, 1) })),
    } : undefined,
  };
}

const STATUS_URL  = process.env.NEXT_PUBLIC_STATUS_URL;
const POLL_MS     = 10_000;
const FLICKER_MS  = 1_200;

/* ── Component ──────────────────────────────────────────────── */
export default function ServerStats() {
  const real                        = useRef<StatusData | null>(null);
  const [display,    setDisplay]    = useState<StatusData | null>(null);
  const [offline,    setOffline]    = useState(false);
  const [showCores,  setShowCores]  = useState(false);

  useEffect(() => {
    if (!STATUS_URL) return;
    const poll = () =>
      fetch(`${STATUS_URL}/status`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(d => { const v = validate(d); real.current = v; setDisplay(v); setOffline(false); })
        .catch(() => setOffline(true));

    poll();
    const pollId    = setInterval(poll, POLL_MS);
    const flickerId = setInterval(() => {
      if (real.current) setDisplay(flicker(real.current));
    }, FLICKER_MS);

    return () => { clearInterval(pollId); clearInterval(flickerId); };
  }, []);

  if (!STATUS_URL) return null;

  const temp = display?.temperatures?.sensors?.[0]?.celsius;

  return (
    <AscFrame title="tecdevsrvr" style={{ background: 'var(--bg-1)' }}>
      <div className="messages-terminal">

        {/* prompt */}
        <span className="messages-prompt-line">
          <span className="messages-prompt-label">
            <span style={{ color: 'var(--olive)' }}>tecdev</span>
            <span style={{ color: 'var(--ink-4)' }}>@tecdevsrvr:~$&nbsp;</span>
          </span>
          <span style={{ color: 'var(--ink)', whiteSpace: 'pre' }}>what&apos;s my 10yo laptop doing</span>
          {!display && !offline && <span className="blink" style={{ color: 'var(--rust)' }}>▌</span>}
        </span>

        {offline ? (
          <span style={{ color: 'var(--ink-4)' }}>node offline · retrying…</span>
        ) : !display ? (
          <span style={{ color: 'var(--ink-4)' }}>connecting…</span>
        ) : (
          <>
            <span>Hello!</span>
            <span>Struggling as a home server :( stats:</span>

            <span className="server-stats__sep">---</span>
            <span style={{ whiteSpace: 'pre' }}>uptime   {display.uptime.human}</span>

            <span className="server-stats__sep">---</span>
            <span className="server-stats__row">
              <span style={{ whiteSpace: 'pre' }}>cpu      </span>
              <span style={{ color: 'var(--rust)' }}>{ascBar(display.cpu.totalPercent)}</span>
              <span> {n(display.cpu.totalPercent)}%</span>
              {temp !== undefined && (
                <span className="server-stats__dim">&ensp;{n(temp)}°C</span>
              )}
              <button
                className="server-stats__toggle"
                onClick={() => setShowCores(c => !c)}
                aria-label="toggle per-core breakdown"
              >
                {showCores ? '[-cores]' : '[+cores]'}
              </button>
            </span>

            {showCores && display.cpu.corePercents?.map((pct, i) => (
              <span key={i} className="server-stats__row">
                <span className="server-stats__dim" style={{ whiteSpace: 'pre' }}>  ·c{i}     </span>
                <span style={{ color: 'var(--rust)' }}>{ascBar(pct, 8)}</span>
                <span className="server-stats__dim"> {n(pct)}%</span>
              </span>
            ))}

            <span className="server-stats__sep">---</span>
            <span className="server-stats__row">
              <span style={{ whiteSpace: 'pre' }}>ram      </span>
              <span style={{ color: 'var(--rust)' }}>{ascBar(display.memory.percentUsed)}</span>
              <span> {n(display.memory.percentUsed)}%</span>
              <span className="server-stats__dim">
                &ensp;{n(display.memory.usedMb / 1024, 1)} / {n(display.memory.totalMb / 1024, 1)} GB
              </span>
            </span>

            {display.disks?.length > 0 && (
              <>
                <span className="server-stats__sep">---</span>
                {display.disks.map((d, i) => (
                  <span key={i} className="server-stats__row">
                    <span style={{ whiteSpace: 'pre' }}>{i === 0 ? 'disk     ' : '         '}</span>
                    <span style={{ color: 'var(--rust)' }}>{ascBar(d.percentUsed)}</span>
                    <span> {n(d.percentUsed)}%</span>
                    <span className="server-stats__dim">
                      &ensp;{n(d.usedGb)} / {n(d.totalGb)} GB
                      {d.mount && <>&nbsp;({d.mount})</>}
                    </span>
                  </span>
                ))}
              </>
            )}

            {display.load && (
              <>
                <span className="server-stats__sep">---</span>
                <span className="server-stats__dim">
                  load&ensp;{n(display.load.one, 2)}&nbsp;·&nbsp;
                  {n(display.load.five, 2)}&nbsp;·&nbsp;
                  {n(display.load.fifteen, 2)}
                  &ensp;<span style={{ fontSize: 10 }}>(1m 5m 15m)</span>
                </span>
              </>
            )}

            <span><span className="blink" style={{ color: 'var(--rust)' }}>▌</span></span>
          </>
        )}

      </div>
    </AscFrame>
  );
}
