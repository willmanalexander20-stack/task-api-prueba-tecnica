namespace InventariosApi.Domain.Dtos;

/// <summary>Contrato de ENTRADA: lo que envía el cliente al crear.</summary>
public sealed record CrearProductoDto(string Nombre, decimal Precio, int Stock);