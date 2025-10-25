type Props = {
  title: string;
  summary: string;
  tech?: string[];
  tags?: string[];
  href?: string;
};

export default function ProjectCard({ title, summary, tech = [], tags = [], href }: Props) {
  // The wrapper is either an anchor (<a>) or a div, so we can narrow its type
  const Wrapper: React.ElementType = href ? 'a' : 'div';

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="block card-lg card-hover"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm muted">{summary}</p>

      {(tech.length > 0 || tags.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tech.map((t) => (
            <span key={t} className="badge">
              {t}
            </span>
          ))}
          {tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}
    </Wrapper>
  );
}
