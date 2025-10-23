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
      className="block rounded-2xl border p-6 transition-shadow hover:shadow-md"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{summary}</p>

      {(tech.length > 0 || tags.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tech.map((t) => (
            <span key={t} className="rounded bg-neutral-100 px-2 py-1 text-xs">
              {t}
            </span>
          ))}
          {tags.map((t) => (
            <span key={t} className="rounded bg-neutral-50 px-2 py-1 text-xs ring-1 ring-neutral-200">
              {t}
            </span>
          ))}
        </div>
      )}
    </Wrapper>
  );
}
