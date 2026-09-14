using InventariosApi.Domain.Entities;

namespace InventariosApi.Data.Repositories;

public sealed class ProductoRepository : IProductoRepository
{
    // "Base de datos" en memoria (Singleton => vive durante toda la aplicación)
    private readonly List<Producto> _productos = new()
    {
        new() { Id = 1, Nombre = "Bolsa de Agua 500 ml", Precio = 1_000m,  Stock = 120 },
        new() { Id = 2, Nombre = "Gaseosa 400 ml",     Precio = 2_500m,  Stock = 80  },
        new() { Id = 3, Nombre = "Canasta Familiar",   Precio = 85_000m, Stock = 15  }
    };

    private int _siguienteId = 4;
    private readonly SemaphoreSlim _mutex = new(1, 1); // protege la concurrencia

    public async Task<IReadOnlyList<Producto>> ObtenerTodosAsync()
    {
        await _mutex.WaitAsync();
        try { return _productos.ToList(); }
        finally { _mutex.Release(); }
    }

    public async Task<Producto?> ObtenerPorIdAsync(int id)
    {
        await _mutex.WaitAsync();
        try { return _productos.FirstOrDefault(p => p.Id == id); }
        finally { _mutex.Release(); }
    }

    public async Task<Producto> CrearAsync(Producto producto)
    {
        await _mutex.WaitAsync();
        try
        {
            producto.Id = _siguienteId++;
            _productos.Add(producto);
            return producto;
        }
        finally { _mutex.Release(); }
    }
}