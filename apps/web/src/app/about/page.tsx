import { AscFrame, SecH } from '@/components/kit';

export default function AboutPage() {
  return (
    <main className="page-wrap-sm">
      <SecH level={1} style={{ marginBottom: 28 }}>about</SecH>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Intro */}
        <AscFrame title="readme.md">
          <div style={{ fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--ink)', fontFamily: 'var(--mono)' }}>Tămaș Cosmin</strong>
              &nbsp;— Tom if that&apos;s easier. Backend developer. This site is a playground and portfolio.
            </p>
          </div>
        </AscFrame>

        {/* Stack */}
        <AscFrame title="stack.sh">
          <table style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 2, borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {[
                ['backend',  'C# · ASP.NET Core · .NET 9+'],
                ['frontend', 'TypeScript · Next.js · React'],
                ['data',     'SQL Server · SQLite'],
                ['env',      '<placeholder>'],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: 'var(--ink-3)', paddingRight: 24, width: 80 }}>{k}</td>
                  <td style={{ color: 'var(--ink-2)' }}>· {v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AscFrame>

        {/* Currently */}
        <AscFrame title="currently.log">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 2 }}>
            {[
              ['build', '<placeholder>'],
              ['site',  'this site · making it not embarrassing'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: 'var(--rust)' }}>→&nbsp;</span>
                <span style={{ color: 'var(--ink-3)' }}>{k}&nbsp;</span>
                <span style={{ color: 'var(--ink-2)' }}>· {v}</span>
              </div>
            ))}
          </div>
        </AscFrame>

        {/* Contact */}
        <AscFrame title="contact">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 2 }}>
            <div>
              <span style={{ color: 'var(--ink-3)' }}>mail&nbsp;&nbsp;&nbsp;</span>
              · <a href="mailto:csmntamas97@gmail.com">csmntamas97@gmail.com</a>
            </div>
            <div>
              <span style={{ color: 'var(--ink-3)' }}>github&nbsp;</span>
              · <a href="https://github.com/CsmnTms" target="_blank" rel="noopener noreferrer">CsmnTms</a>
            </div>
          </div>
        </AscFrame>

      </div>
    </main>
  );
}