import Link from 'next/link';
import { AscFrame, SecH } from '@/components/kit';
import ProjectsPreview from '@/components/projects-preview';

export default function Home() {
  return (
    <main className="page-wrap">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-grid">
        <div>
          <p className="sec-h"><span className="hash">#</span>index · /home/tecdev</p>
          <div className="hero-wordmark" aria-label="tecdev">
            <span className="hero-wordmark__text">
              <span className="hero-wordmark__bracket">&lt;</span>tecdev<span className="hero-wordmark__bracket"> /&gt;</span>
            </span>
          </div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)', margin: '0 0 22px' }}>
            <span style={{ color: 'var(--rust)', fontWeight: 700 }}>t</span>ămaș{' '}
            <span style={{ color: 'var(--rust)', fontWeight: 700 }}>e</span>.{' '}
            <span style={{ color: 'var(--rust)', fontWeight: 700 }}>c</span>osmin<br />
            software <span style={{ color: 'var(--rust)', fontWeight: 700 }}>dev</span>eloper.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="https://github.com/CsmnTms" target="_blank" rel="noopener noreferrer" className="btn ghost">
              github
            </a>
            <a href="mailto:csmntamas97@gmail.com" className="btn ghost">
              mail me
            </a>
          </div>
        </div>

        <AscFrame title="whoami" style={{ background: 'var(--bg-1)' }}>
          <div className="whoami-card">
            <div>
              <span style={{ color: 'var(--rust)' }}>user</span>
              @<span style={{ color: 'var(--olive)' }}>tecdev.sh</span>
            </div>
            <div style={{ color: 'var(--rule-2)' }}>────────────────────────</div>
            <div><span className="whoami-key">role  &nbsp;</span>.NET dev · full-stack</div>
            <div><span className="whoami-key">stack &nbsp;</span>C# · TypeScript · Next.js</div>
            <div><span className="whoami-key">env   &nbsp;</span>&lt;placeholder&gt;</div>
            <div style={{ color: 'var(--rule-2)', marginTop: 4 }}>────────────────────────</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.6 }}>
              csmntamas97@gmail.com<br />
              github.com/CsmnTms
            </div>
          </div>
        </AscFrame>
      </section>

      {/* ── Projects ─────────────────────────────────────────── */}
      <section style={{ marginTop: 52 }}>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 16 }}>
          <SecH level={2}>projects</SecH>
          <Link href="/portfolio" className="btn ghost" style={{ fontSize: 11, padding: '3px 9px' }}>
            all →
          </Link>
        </div>
        <ProjectsPreview />
      </section>

      {/* ── Writing ──────────────────────────────────────────── */}
      <section style={{ marginTop: 52 }}>
        <SecH level={2}>writing</SecH>
        <AscFrame title="blog.md">
          <div className="writing-placeholder">
            <span style={{ color: 'var(--ink-4)' }}>$ git log --oneline blog/</span>
            <span style={{ marginTop: 4 }}>
              fatal: your path spec &apos;blog/&apos; did not match any files
            </span>
            <span style={{ marginTop: 4, color: 'var(--ink-4)' }}>
              <span style={{ color: 'var(--olive)' }}>user@tecdev</span>
              :~$&nbsp;
              <span className="blink" style={{ color: 'var(--rust)' }}>▌</span>
            </span>
          </div>
        </AscFrame>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ marginTop: 56, paddingTop: 16, borderTop: '1px dashed var(--rule-2)' }}>
        <div className="footer-row">
          <span>
            — built with next.js ·{' '}
            <a href="https://github.com/CsmnTms/showcase" target="_blank" rel="noopener noreferrer">
              source
            </a>{' '}
            —
          </span>
          <span>no trackers · no cookies · next.js</span>
        </div>
      </footer>
    </main>
  );
}