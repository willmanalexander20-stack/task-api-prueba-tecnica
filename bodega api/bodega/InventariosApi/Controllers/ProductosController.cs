using InventariosApi.Domain.Dtos;
using InventariosApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventariosApi.Controllers;

[ApiController]
[Route("api/v1/productos")]            // convención de versionado
[Produces("application/json")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _service;
    public ProductosController(IProductoService service) => _service = service;

    /// <summary>GET /api/v1/productos → lista de DTOs.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductoResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ProductoResponseDto>>> ObtenerTodos()
        => Ok(await _service.ListarAsync());

    /// <summary>POST /api/v1/productos → 201 Created con encabezado Location.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductoResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductoResponseDto>> Crear([FromBody] CrearProductoDto dto)
    {
        var creado = await _service.CrearAsync(dto);
        return Created($"/api/v1/productos/{creado.Id}", creado); // 201 + Location
    }
}