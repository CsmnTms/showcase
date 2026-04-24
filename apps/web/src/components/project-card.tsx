import { WinBar } from './kit';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  summary: string;
  tech?: string[];
  tags?: string[];
  href?: string;
};

export default function ProjectCard({ title, summary, tech = [], tags = [], href }: Props) {
  const Wrapper: React.ElementType = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  const barTitle: ReactNode = (
    <>
      <span style={{ color: 'var(--ink-4)' }}>~/projects/</span>
      <span style={{ color: 'var(--ink-2)' }}>{title}</span>
    </>
  );

  return (
    <Wrapper {...wrapperProps} className="project-card">
      <WinBar title={barTitle} />
      <div className="project-card-body">
        <p className="project-card-summary">{summary}</p>
        {(tech.length > 0 || tags.length > 0) && (
          <div className="project-card-tags">
            {tech.map(t => (
              <span key={t} className="tag">#{t}</span>
            ))}
            {tags.map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
