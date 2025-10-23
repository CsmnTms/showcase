using Api.Core.Abstractions;
using Ardalis.Specification.EntityFrameworkCore;

namespace Api.Infrastructure;

public sealed class EfReadRepository<T> : RepositoryBase<T>, IReadRepository<T> where T : class
{
    public EfReadRepository(AppDbContext db) : base(db) { }
}

public sealed class EfRepository<T> : RepositoryBase<T>, IRepository<T> where T : class
{
    private readonly AppDbContext _db;
    public EfRepository(AppDbContext db) : base(db) { _db = db; }
}

public sealed class EfUnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _db;
    public EfUnitOfWork(AppDbContext db) => _db = db;
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
