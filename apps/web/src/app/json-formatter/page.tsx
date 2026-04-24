'use client';

import { useCallback, useMemo, useState } from 'react';
import { WinBar, SecH } from '@/components/kit';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return 'Invalid JSON';
}

export default function JsonFormatterPage() {
  const [input,  setInput]  = useState<string>('{\n  "name": "John",\n  "age": 30,\n  "isAdmin": false,\n  "courses": ["html", "css", "js"],\n  "wife": null\n}');
  const [output, setOutput] = useState<string>('');
  const [spaces, setSpaces] = useState<number>(4);
  const [error,  setError]  = useState<string>('');

  const formatJson = useCallback(() => {
    setError('');
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, spaces));
    } catch (err: unknown) {
      setOutput('');
      setError(getErrorMessage(err));
    }
  }, [input, spaces]);

  const minifyJson = useCallback(() => {
    setError('');
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
    } catch (err: unknown) {
      setOutput('');
      setError(getErrorMessage(err));
    }
  }, [input]);

  const validateJson = useCallback(() => {
    setError('');
    try {
      JSON.parse(input);
      setOutput('✓ valid JSON');
    } catch (err: unknown) {
      setOutput('');
      setError(getErrorMessage(err));
    }
  }, [input]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }, [output]);

  const clearAll = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
  }, []);

  const examplePretty = useMemo(() => {
    try { return JSON.stringify(JSON.parse(input), null, spaces); }
    catch { return ''; }
  }, [input, spaces]);

  return (
    <main className="page-wrap">
      <div style={{ marginBottom: 24 }}>
        <SecH level={1} style={{ marginBottom: 8 }}>json-formatter</SecH>
        <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
          paste JSON on the left · format, minify, or validate · copy on the right
        </p>
      </div>

      <div style={{ border: '1px solid var(--rule-2)' }}>
        <WinBar
          title="json.exe"
          right={
            <span style={{ color: 'var(--ink-4)' }}>
              indent:&nbsp;
              <select
                className="kit-select"
                value={spaces}
                onChange={(e) => setSpaces(parseInt(e.target.value, 10))}
                aria-label="Indentation spaces"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </span>
          }
        />

        <div style={{ padding: '14px 16px' }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="JSON actions" style={{ marginBottom: 14 }}>
            <button className="btn primary" onClick={formatJson}>format</button>
            <button className="btn ghost"   onClick={minifyJson}>minify</button>
            <button className="btn ghost"   onClick={validateJson}>validate</button>
            <button className="btn ghost"   onClick={copyOutput} disabled={!output}>copy output</button>
            <button className="btn danger"  onClick={clearAll}>clear</button>
          </div>

          {error && (
            <div className="alert-error" role="alert" aria-live="polite" style={{ marginBottom: 14 }}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                input
              </span>
              <textarea
                className="editor"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="paste JSON here…"
                spellCheck={false}
                aria-label="JSON input"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                output
              </span>
              <textarea
                className="editor"
                value={output || examplePretty}
                readOnly
                placeholder="formatted or minified JSON will appear here…"
                spellCheck={false}
                aria-label="JSON output"
              />
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}
