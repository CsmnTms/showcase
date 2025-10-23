using Api.Core.Abstractions;
using Api.Core.Projects;
using Api.Core.Projects.Specs;
using Api.Infrastructure;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration).WriteTo.Console());

// Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("db") ?? "Data Source=app.db"));

builder.Services.AddScoped(typeof(IReadRepository<>), typeof(EfReadRepository<>));
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();

// CORS
const string CorsPolicy = "AllowWeb";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: CorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "https://csmntms.github.io", // GitHub Pages origin
                "http://localhost:3000"      // local Next.js dev
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            // If you authenticate with cookies across origins, keep this:
            .AllowCredentials();
            // If you use bearer tokens instead of cookies, remove .AllowCredentials()
    });
});

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors(CorsPolicy);

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
