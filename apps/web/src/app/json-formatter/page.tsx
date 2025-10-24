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
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">JSON Formatter</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Paste JSON on the left, then format, minify, or validate. Copy the result on the right.
        </p>
      </div>

      <section className="rounded-lg border border-neutral-200/70 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-700 dark:text-neutral-300">
            Indent:
            <select
              className="ml-2 rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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
            <button
              className="inline-flex items-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-[1px]"
              onClick={formatJson}
            >
              Format
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-100 shadow-sm hover:bg-neutral-700 hover:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-[1px]"
              onClick={minifyJson}
            >
              Minify
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-100 shadow-sm hover:bg-neutral-700 hover:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-[1px]"
              onClick={validateJson}
            >
              Validate
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-100 shadow-sm hover:bg-neutral-700 hover:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={copyOutput}
              disabled={!output}
            >
              Copy Output
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-red-800 bg-red-900/50 px-3 py-1.5 text-sm font-medium text-red-200 shadow-sm hover:bg-red-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:translate-y-[1px]"
              onClick={clearAll}
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Input</span>
            <textarea
              className="editor min-h-[340px] w-full resize-y rounded-md border p-3 font-mono text-[13px] leading-6 overflow-auto bg-[#1e1e1e] text-[#d4d4d4] border-[#2a2a2a] caret-[#aeafad] placeholder:text-[#808080] focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-[#264f78] selection:text-white"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              spellCheck={false}
              aria-label="JSON input"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Output</span>
            <textarea
              className="editor min-h-[340px] w-full resize-y rounded-md border p-3 font-mono text-[13px] leading-6 overflow-auto bg-[#1e1e1e] text-[#d4d4d4] border-[#2a2a2a] caret-[#aeafad] placeholder:text-[#808080] focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-[#264f78] selection:text-white"
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