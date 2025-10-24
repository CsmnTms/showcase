using Api.Core.Abstractions;
using Api.Core.Projects;
using Api.Core.Projects.Specs;
using Api.Infrastructure;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration).WriteTo.Console());

// Global CORS (default policy)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(
                "https://csmntms.github.io", // GitHub Pages origin
                "http://localhost:3000"      // local dev
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            // .AllowCredentials() // only if you use cookies
    );
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("db") ?? "Data Source=app.db"));

builder.Services.AddScoped(typeof(IReadRepository<>), typeof(EfReadRepository<>));
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();

var app = builder.Build();

// Forwarded headers (ACA)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// TEMP: emit CORS even on 404 to diagnose in-browser
app.Use(async (ctx, next) =>
{
    var origin = ctx.Request.Headers.Origin.ToString();
    if (!string.IsNullOrEmpty(origin) &&
        (origin == "https://csmntms.github.io" || origin == "http://localhost:3000"))
    {
        ctx.Response.Headers["Access-Control-Allow-Origin"] = origin;
        ctx.Response.Headers["Vary"] = "Origin";
        ctx.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
        ctx.Response.Headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
        // ctx.Response.Headers["Access-Control-Allow-Credentials"] = "true"; // if cookies
    }
    if (ctx.Request.Method == "OPTIONS")
    {
        ctx.Response.StatusCode = 200;
        await ctx.Response.CompleteAsync();
        return;
    }
    await next();
});

// Global CORS
app.UseCors();

app.UseSerilogRequestLogging();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    c.RoutePrefix = "swagger";
});

// Sanity endpoints (verify you’re hitting your app)
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
