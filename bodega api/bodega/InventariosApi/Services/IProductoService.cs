using InventariosApi.Domain.Dtos;

namespace InventariosApi.Services;

public interface IProductoService
{
    Task<IReadOnlyList<ProductoResponseDto>> ListarAsync();
    Task<ProductoResponseDto> CrearAsync(CrearProductoDto dto);
}