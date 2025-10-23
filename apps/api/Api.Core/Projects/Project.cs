namespace Api.Core.Projects;

public sealed class Project
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public required string Title { get; set; }
    public string Summary { get; set; } = "";
    public string[] Tags { get; set; } = [];
    public string[] Tech { get; set; } = [];
    public string? RepoUrl { get; set; }
    public string? DemoUrl { get; set; }
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
