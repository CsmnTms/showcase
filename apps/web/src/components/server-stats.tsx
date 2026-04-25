'use client';

import { useEffect, useState } from 'react';
import { AscFrame } from './kit';

/* ── Types ──────────────────────────────────────────────────── */
// Mirrors the shape of GET /status from tecdevsrvr-status-api.
// All optional fields degrade gracefully if the API version differs.
interface StatusData {
  uptime: string;
  cpu: {
    overallPercent: number;
    corePercents?: number[];
    temperaturesCelsius?: number[];
  };
  memory: {
    usedMb: number;
    totalMb: number;
    usedPercent: number;
  };
  disks?: Array<{
    path?: string;
    label?: string;
    usedGb: number;
    totalGb: number;
    usedPercent: number;
  }>;
  loadAverage?: {
    oneMinute: number;
    fiveMinute: number;
    fifteenMinute: number;
  };
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
  if (typeof s?.cpu?.overallPercent !== 'number') throw new Error('bad shape');
  if (typeof s?.memory?.usedPercent !== 'number') throw new Error('bad shape');
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

  const temp = data?.cpu.temperaturesCelsius?.[0];

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
              <span>{data.uptime}</span>
            </div>

            <div className="server-stats__divider" />

            {/* cpu overall */}
            <div className="server-stats__row">
              <span className="server-stats__label">cpu</span>
              <span className="server-stats__bar">{ascBar(data.cpu.overallPercent)}</span>
              <span>&nbsp;{n(data.cpu.overallPercent)}%</span>
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
              <span className="server-stats__bar">{ascBar(data.memory.usedPercent)}</span>
              <span>&nbsp;{n(data.memory.usedPercent)}%</span>
              <span className="server-stats__dim">
                &ensp;{n(data.memory.usedMb / 1024, 1)} / {n(data.memory.totalMb / 1024, 1)} GB
              </span>
            </div>

            {/* disks */}
            {(data.disks?.length ?? 0) > 0 && (
              <>
                <div className="server-stats__divider" />
                {data.disks!.map((d, i) => (
                  <div key={i} className="server-stats__row">
                    <span className="server-stats__label">{i === 0 ? 'disk' : ''}</span>
                    <span className="server-stats__bar">{ascBar(d.usedPercent)}</span>
                    <span>&nbsp;{n(d.usedPercent)}%</span>
                    <span className="server-stats__dim">
                      &ensp;{n(d.usedGb)} / {n(d.totalGb)} GB
                      {d.path && <>&nbsp;({d.path})</>}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* load average */}
            {data.loadAverage && (
              <>
                <div className="server-stats__divider" />
                <div className="server-stats__row">
                  <span className="server-stats__label">load</span>
                  <span className="server-stats__dim">
                    {n(data.loadAverage.oneMinute, 2)}&nbsp;·&nbsp;
                    {n(data.loadAverage.fiveMinute, 2)}&nbsp;·&nbsp;
                    {n(data.loadAverage.fifteenMinute, 2)}
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
