using InventariosApi.Negocio.Dtos;

namespace InventariosApi.Negocio.Services;

public interface IProductoService
{
    Task<IReadOnlyList<ProductoResponseDto>> ListarAsync();
    Task<ProductoResponseDto> CrearAsync(CrearProductoDto dto);
}