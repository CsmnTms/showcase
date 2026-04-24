import ProjectCard from '@/components/project-card';
import fallbackProjects from '@/data/projects.fallback.json';
import type { Project } from '@/lib/types';

export default function ProjectsPreview() {
  const projects = (fallbackProjects as Project[]).slice(0, 3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map(p => (
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
  );
}
