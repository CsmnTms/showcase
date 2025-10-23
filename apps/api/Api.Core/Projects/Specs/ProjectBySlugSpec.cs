using Ardalis.Specification;

namespace Api.Core.Projects.Specs;

public sealed class ProjectBySlugSpec : Specification<Project>, ISingleResultSpecification
{
    public ProjectBySlugSpec(string slug) => Query.Where(p => p.Slug == slug);
}
