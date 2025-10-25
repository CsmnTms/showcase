// this too?

'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useProjects } from '@/lib/useProjects';
import ProjectCard from '@/components/project-card';
import fallbackProjects from '@/data/projects.fallback.json';

type Project = {
  slug: string;
  title: string;
  summary: string;
  tech?: string[];
  tags?: string[];
};

function useOnline() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb);
      window.addEventListener('offline', cb);
      return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
      };
    },
    () => navigator.onLine,
    () => true // server snapshot
  );
}

export default function PortfolioPage() {
  const { data, isLoading, error } = useProjects();
  const isOnline = useOnline();

  // Read cache once (lazy init, no extra render)
  const [cached] = useState<Project[] | null>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('projects-cache') : null;
      return raw ? (JSON.parse(raw) as Project[]) : null;
    } catch {
      return null;
    }
  });

  // Persist successful fetches to localStorage (side-effect only)
  useEffect(() => {
    if (data && Array.isArray(data)) {
      try {
        localStorage.setItem('projects-cache', JSON.stringify(data));
      } catch {}
    }
  }, [data]);

  // Derived data and banner flag (no setState needed)
  const viewData: Project[] =
    (data as Project[] | undefined) ??
    cached ??
    ((fallbackProjects as unknown) as Project[]);

  const showFallbackBanner = (!isOnline || !!error) && !data;

  if (isLoading && !viewData.length) {
    return <main className="p-6">Loading…</main>;
  }

  return (
    <>
      {showFallbackBanner && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <div className="alert-warn">
            Showing cached/fallback data.
            <button
              onClick={() => location.reload()}
              className="btn btn-amber ml-3 px-2 py-1 text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <main className="grid-cards">
        {viewData.map((p) => (
          <ProjectCard
            key={p.slug}
            title={p.title}
            summary={p.summary}
            tech={p.tech}
            tags={p.tags}
            href={`/portfolio/${p.slug}`}
          />
        ))}
      </main>
    </>
  );
}