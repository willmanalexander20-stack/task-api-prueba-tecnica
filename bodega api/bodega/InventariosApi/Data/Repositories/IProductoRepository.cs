using InventariosApi.Domain.Entities;

namespace InventariosApi.Data.Repositories;

public interface IProductoRepository
{
    Task<IReadOnlyList<Producto>> ObtenerTodosAsync();
    Task<Producto?> ObtenerPorIdAsync(int id);
    Task<Producto> CrearAsync(Producto producto);
}