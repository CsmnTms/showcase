'use client';

import { useCallback, useMemo, useState } from 'react';

// Safe error-to-message without using `any`
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
  const [input, setInput] = useState<string>('{\n  "name":"John", "age":30, "isAdmin": false,\n  "courses": ["html", "css", "js"], "wife": null\n}');
  const [output, setOutput] = useState<string>('');
  const [spaces, setSpaces] = useState<number>(4);
  const [error, setError] = useState<string>('');

  const formatJson = useCallback(() => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, spaces));
    } catch (err: unknown) {
      setOutput('');
      setError(getErrorMessage(err));
    }
  }, [input, spaces]);

  const minifyJson = useCallback(() => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (err: unknown) {
      setOutput('');
      setError(getErrorMessage(err));
    }
  }, [input]);

  const validateJson = useCallback(() => {
    setError('');
    try {
      JSON.parse(input);
      setOutput('Valid JSON');
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
    try {
      return JSON.stringify(JSON.parse(input), null, spaces);
    } catch {
      return '';
    }
  }, [input, spaces]);

  return (  
    <main className="container">
      <div className="mb-5">
        <h1 className="heading">JSON Formatter</h1>
        <p className="mt-2 muted">
          Paste JSON on the left, then format, minify, or validate. Copy the result on the right.
        </p>
      </div>
      <section className="card">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-700 dark:text-neutral-300">
            Indent:
            <select
              className="select"
              value={spaces}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSpaces(parseInt(e.target.value, 10))}
              aria-label="Indentation spaces"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </label>

          <div className="ml-auto flex flex-wrap items-center gap-2" role="toolbar" aria-label="JSON actions">
            <button className="btn btn-primary" onClick={formatJson}>Format</button>
            <button className="btn btn-neutral" onClick={minifyJson}>Minify</button>
            <button className="btn btn-neutral" onClick={validateJson}>Validate</button>
            <button className="btn btn-neutral btn-disabled" onClick={copyOutput} disabled={!output}>Copy Output</button>
            <button className="btn btn-danger" onClick={clearAll}>Clear</button>
          </div>
        </div>

        {error && (
          <div className="alert-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="label">Input</span>
            <textarea
              className="editor"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              spellCheck={false}
              aria-label="JSON input"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label">Output</span>
            <textarea
              className="editor"
              value={output || examplePretty}
              readOnly
              placeholder="Formatted or minified JSON will appear here..."
              spellCheck={false}
              aria-label="JSON output"
            />
          </label>
        </div>
      </section>
    </main>
  );
}