import ProjectCard from '@/components/project-card';
import { SecH } from '@/components/kit';
import type { Project } from '@/lib/types';
import fallbackProjects from '@/data/projects.fallback.json';

export default function PortfolioPage() {
  const projects = fallbackProjects as Project[];

  return (
    <main className="page-wrap">
      <div style={{ marginBottom: 20 }}>
        <SecH level={1}>projects</SecH>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => (
          <ProjectCard
            key={p.slug}
            title={p.title}
            summary={p.summary}
            tech={p.tech}
            tags={p.tags}
            href={p.repoUrl}
          />
        ))}
      </div>
    </main>
  );
}