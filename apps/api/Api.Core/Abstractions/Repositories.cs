using Ardalis.Specification;

namespace Api.Core.Abstractions;

public interface IReadRepository<T> : IReadRepositoryBase<T> where T : class { }
public interface IRepository<T> : IRepositoryBase<T> where T : class { }

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
