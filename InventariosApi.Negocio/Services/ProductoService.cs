using InventariosApi.Datos.Entities;
using InventariosApi.Datos.Repositories;
using InventariosApi.Negocio.Dtos;

namespace InventariosApi.Negocio.Services;

public sealed class ProductoService : IProductoService
{
    private readonly IProductoRepository _repository;

    public ProductoService(IProductoRepository repository) => _repository = repository;

    public async Task<IReadOnlyList<ProductoResponseDto>> ListarAsync()
    {
        var productos = await _repository.ObtenerTodosAsync();
        return productos
            .Select(p => new ProductoResponseDto(p.Id, p.Nombre, p.Precio, p.Stock))
            .ToList();
    }

    public async Task<ProductoResponseDto> CrearAsync(CrearProductoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre))
            throw new ArgumentException("El campo 'Nombre' es obligatorio.");
        if (dto.Precio <= 0)
            throw new ArgumentException("El campo 'Precio' debe ser mayor que cero.");
        if (dto.Stock < 0)
            throw new ArgumentException("El campo 'Stock' no puede ser negativo.");

        var creado = await _repository.CrearAsync(new Producto
        {
            Nombre = dto.Nombre.Trim(),
            Precio = dto.Precio,
            Stock  = dto.Stock
        });

        return new ProductoResponseDto(creado.Id, creado.Nombre, creado.Precio, creado.Stock);
    }
}