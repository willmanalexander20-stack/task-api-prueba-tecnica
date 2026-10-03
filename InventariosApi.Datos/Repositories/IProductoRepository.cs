using InventariosApi.Datos.Entities;

namespace InventariosApi.Datos.Repositories;

public interface IProductoRepository
{
    Task<IReadOnlyList<Producto>> ObtenerTodosAsync();
    Task<Producto?> ObtenerPorIdAsync(int id);
    Task<Producto> CrearAsync(Producto producto);
}