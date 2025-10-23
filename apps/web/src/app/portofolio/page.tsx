'use client';
import { useProjects } from '@/lib/useProjects';
import ProjectCard from '@/components/project-card';

export default function PortfolioPage() {
  const { data, isLoading, error } = useProjects();
  if (isLoading) return <main className="p-6">Loading…</main>;
  if (error) return <main className="p-6">Failed to load projects</main>;

  return (
    <main className="mx-auto max-w-6xl p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data!.map(p => (
        <ProjectCard
          key={p.slug}
          title={p.title}
          summary={p.summary}
          tech={p.tech}
          tags={p.tags}
          href={`/portfolio/${p.slug}`} // we’ll add details page later
        />
      ))}
    </main>
  );
}