using InventariosApi.Datos.Repositories;
using InventariosApi.Negocio.Services;
using InventariosApi.Presentacion.Middleware;
// Se añade el using necesario para OpenApiSpecVersion
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// ---------- Inyección de dependencias (contenedor IoC) ----------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Configuración básica para que Swagger muestre un título y versión en la UI
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Inventarios API",
        Version = "v1",
        Description = "API para la gestión de inventarios"
    });
});

// Repositorio en memoria => Singleton (el estado vive toda la aplicación)
builder.Services.AddSingleton<IProductoRepository, ProductoRepository>();
// Servicio sin estado => Scoped (una instancia por petición HTTP)
builder.Services.AddScoped<IProductoService, ProductoService>();

var app = builder.Build();

// ---------- Pipeline HTTP ----------
app.UseMiddleware<ExceptionHandlingMiddleware>(); // 1º: manejo global de excepciones

// 🔑 CORRECCIÓN: Se usa OpenApiSpecVersion para forzar OpenAPI 3.0
app.UseSwagger(options =>
{
    options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0;
});

app.UseSwaggerUI();                                // Swagger UI en /swagger
// app.UseHttpsRedirection();                      // Opcional: descomentar si usas HTTPS
app.MapControllers();                              // expone /api/v1/productos

app.Run();