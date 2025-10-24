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
                "https://csmntms.github.io", // GitHub Pages origin (no path)
                "http://localhost:3000"      // local Next.js dev
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
            // .AllowCredentials(); // remove if you use bearer tokens, keep if cookies
    });
});

var app = builder.Build();

// Order: CORS before endpoints
app.UseSerilogRequestLogging();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors(CorsPolicy);

// Map endpoints with explicit RequireCors (ensures policy applies)
var api = app.MapGroup("/").RequireCors(CorsPolicy);

api.MapGet("/health", () => Results.Ok(new { status = "ok" }));
api.MapGet("/projects", async (IReadRepository<Project> repo) =>
    Results.Ok(await repo.ListAsync()));
api.MapGet("/projects/{slug}", async (string slug, IReadRepository<Project> repo) =>
{
    var spec = new ProjectBySlugSpec(slug);
    var proj = await repo.FirstOrDefaultAsync(spec);
    return proj is null ? Results.NotFound() : Results.Ok(proj);
});

// Optional: handle preflight explicitly (defensive)
api.MapMethods("/{**any}", new[] { "OPTIONS" }, () => Results.Ok());

app.Run();
