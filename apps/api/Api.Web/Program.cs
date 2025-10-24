using Api.Core.Abstractions;
using Api.Core.Projects;
using Api.Core.Projects.Specs;
using Api.Infrastructure;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Force Kestrel to bind 8080 and ignore ASPNETCORE_URLS
builder.WebHost.ConfigureKestrel(o => o.ListenAnyIP(8080));

// Logging
builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration).WriteTo.Console());

// CORS (global default)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(
                "https://csmntms.github.io",
                "http://localhost:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            // .AllowCredentials() // only if you use cookie auth
    );
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SQLite in writable path by default (works in ACA)
var sqlite = builder.Configuration.GetConnectionString("db");
if (string.IsNullOrWhiteSpace(sqlite))
{
    var file = Path.Combine(Path.GetTempPath(), "app.db"); // /tmp/app.db
    sqlite = $"Data Source={file}";
}
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite(sqlite));

builder.Services.AddScoped(typeof(IReadRepository<>), typeof(EfReadRepository<>));
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();

var app = builder.Build();

// Add a fingerprint header to every response
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["x-app"] = "showcase-api";
    await next();
});

// Forwarded headers (ACA)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseCors(); // global
app.UseSerilogRequestLogging();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    c.RoutePrefix = "swagger";
});

// Sanity endpoints (must return JSON bodies)
app.MapGet("/", () => Results.Json(new { ok = true, name = "showcase-api" }));
app.MapGet("/health", () => Results.Json(new { status = "ok" }));
app.MapGet("/routes", (EndpointDataSource eds) =>
    Results.Json(eds.Endpoints.Select(e => e.DisplayName)));

// API
app.MapGet("/projects", async (IReadRepository<Project> repo) =>
    Results.Ok(await repo.ListAsync()));
app.MapGet("/projects/{slug}", async (string slug, IReadRepository<Project> repo) =>
{
    var spec = new ProjectBySlugSpec(slug);
    var proj = await repo.FirstOrDefaultAsync(spec);
    return proj is null ? Results.NotFound() : Results.Ok(proj);
});

app.Run();
