'use client';

import { useEffect, useState } from 'react';
import { AscFrame } from './kit';

/* ── Types ──────────────────────────────────────────────────── */
// Matches the actual GET /status response from tecdevsrvr-status-api.
interface StatusData {
  uptime:       { seconds: number; human: string };
  cpu:          { totalPercent: number; corePercents: number[] };
  memory:       { totalMb: number; usedMb: number; percentUsed: number };
  disks:        Array<{ mount?: string; totalGb: number; usedGb: number; percentUsed: number }>;
  load:         { one: number; five: number; fifteen: number };
  temperatures?: { available: boolean; sensors: Array<{ label: string; celsius: number }> };
  containers?:  { available: boolean; running: number };
}

/* ── Helpers ────────────────────────────────────────────────── */
function ascBar(pct: number, width = 10): string {
  const filled = Math.round(Math.min(100, Math.max(0, pct)) / 100 * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

// Safe number formatter — returns '--' for any non-finite/missing value
function n(val: unknown, decimals = 0): string {
  return typeof val === 'number' && Number.isFinite(val) ? val.toFixed(decimals) : '--';
}

// Minimal shape validation — throws if required numeric fields are absent
function validate(d: unknown): StatusData {
  const s = d as StatusData;
  if (typeof s?.cpu?.totalPercent !== 'number') throw new Error('bad shape');
  if (typeof s?.memory?.percentUsed !== 'number') throw new Error('bad shape');
  return s;
}

const STATUS_URL = process.env.NEXT_PUBLIC_STATUS_URL;

/* ── Component ──────────────────────────────────────────────── */
export default function ServerStats() {
  const [data,    setData]    = useState<StatusData | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!STATUS_URL) return;
    const poll = () =>
      fetch(`${STATUS_URL}/status`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(d => { setData(validate(d)); setOffline(false); })
        .catch(() => setOffline(true));
    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, []);

  if (!STATUS_URL) return null;

  const temp = data?.temperatures?.sensors?.[0]?.celsius;

  return (
    <AscFrame title="tecdevsrvr" style={{ background: 'var(--bg-1)' }}>
      <div className="server-stats">

        {offline ? (
          <span className="server-stats__offline">● node offline</span>
        ) : !data ? (
          <span className="server-stats__offline">● connecting…</span>
        ) : (
          <>
            {/* uptime */}
            <div className="server-stats__row">
              <span className="server-stats__label">uptime</span>
              <span>{data.uptime.human}</span>
            </div>

            <div className="server-stats__divider" />

            {/* cpu overall */}
            <div className="server-stats__row">
              <span className="server-stats__label">cpu</span>
              <span className="server-stats__bar">{ascBar(data.cpu.totalPercent)}</span>
              <span>&nbsp;{n(data.cpu.totalPercent)}%</span>
              {temp !== undefined && (
                <span className="server-stats__dim">&ensp;{n(temp)}°C</span>
              )}
            </div>

            {/* per-core */}
            {data.cpu.corePercents?.map((pct, i) => (
              <div key={i} className="server-stats__row">
                <span className="server-stats__label server-stats__dim">&nbsp;&nbsp;·c{i}</span>
                <span className="server-stats__bar">{ascBar(pct, 8)}</span>
                <span className="server-stats__dim">&nbsp;{n(pct)}%</span>
              </div>
            ))}

            <div className="server-stats__divider" />

            {/* ram */}
            <div className="server-stats__row">
              <span className="server-stats__label">ram</span>
              <span className="server-stats__bar">{ascBar(data.memory.percentUsed)}</span>
              <span>&nbsp;{n(data.memory.percentUsed)}%</span>
              <span className="server-stats__dim">
                &ensp;{n(data.memory.usedMb / 1024, 1)} / {n(data.memory.totalMb / 1024, 1)} GB
              </span>
            </div>

            {/* disks */}
            {(data.disks?.length ?? 0) > 0 && (
              <>
                <div className="server-stats__divider" />
                {data.disks.map((d, i) => (
                  <div key={i} className="server-stats__row">
                    <span className="server-stats__label">{i === 0 ? 'disk' : ''}</span>
                    <span className="server-stats__bar">{ascBar(d.percentUsed)}</span>
                    <span>&nbsp;{n(d.percentUsed)}%</span>
                    <span className="server-stats__dim">
                      &ensp;{n(d.usedGb)} / {n(d.totalGb)} GB
                      {d.mount && <>&nbsp;({d.mount})</>}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* load average */}
            {data.load && (
              <>
                <div className="server-stats__divider" />
                <div className="server-stats__row">
                  <span className="server-stats__label">load</span>
                  <span className="server-stats__dim">
                    {n(data.load.one, 2)}&nbsp;·&nbsp;
                    {n(data.load.five, 2)}&nbsp;·&nbsp;
                    {n(data.load.fifteen, 2)}
                    &ensp;<span style={{ fontSize: 10 }}>(1m 5m 15m)</span>
                  </span>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </AscFrame>
  );
}
