using Api.Core.Abstractions;
using Api.Core.Projects;
using Api.Core.Projects.Specs;
using Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Serilog;

var b = WebApplication.CreateBuilder(args);

// Serilog
b.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration).WriteTo.Console());

// Services
b.Services.AddEndpointsApiExplorer();
b.Services.AddSwaggerGen();

b.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite(b.Configuration.GetConnectionString("db") ?? "Data Source=app.db"));

b.Services.AddScoped(typeof(IReadRepository<>), typeof(EfReadRepository<>));
b.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
b.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();

b.Services.AddCors(o => o.AddPolicy("site", p =>
    p.WithOrigins(b.Configuration["AllowedOrigin"] ?? "http://localhost:3000")
     .AllowAnyHeader().AllowAnyMethod()));

var app = b.Build();

app.UseSerilogRequestLogging();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("site");

// Ensure DB + seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    if (!await db.Projects.AnyAsync())
    {
        db.Projects.Add(new Project
        {
            Slug = "clean-architecture-blueprint",
            Title = ".NET 10 Clean Architecture",
            Summary = "Pragmatic, mapper-free, MediatR-free blueprint.",
            Tags = [".NET", "Clean Architecture"],
            Tech = ["EF Core 10", "Docker"]
        });
        await db.SaveChangesAsync();
    }
}

// Endpoints
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/projects", async (IReadRepository<Project> repo) =>
    Results.Ok(await repo.ListAsync()));

app.MapGet("/projects/{slug}", async (string slug, IReadRepository<Project> repo) =>
{
    var spec = new ProjectBySlugSpec(slug);
    var proj = await repo.FirstOrDefaultAsync(spec);
    return proj is null ? Results.NotFound() : Results.Ok(proj);
});

app.Run();
