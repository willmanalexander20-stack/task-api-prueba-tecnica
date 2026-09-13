namespace InventariosApi.Domain.Dtos;

/// <summary>Contrato de SALIDA: lo que ve el cliente.</summary>
public sealed record ProductoResponseDto(int Id, string Nombre, decimal Precio, int Stock);