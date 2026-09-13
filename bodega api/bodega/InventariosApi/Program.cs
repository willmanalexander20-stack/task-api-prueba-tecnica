using InventariosApi.Data.Repositories;
using InventariosApi.Middleware;
using InventariosApi.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------- Inyección de dependencias (contenedor IoC) ----------
builder.Services.AddControllers();          // controladores [ApiController]
builder.Services.AddEndpointsApiExplorer(); // metadatos para Swagger
builder.Services.AddSwaggerGen();           // documentación Swagger

// Repositorio en memoria => Singleton (el estado vive toda la aplicación)
builder.Services.AddSingleton<IProductoRepository, ProductoRepository>();
// Servicio sin estado => Scoped (una instancia por petición HTTP)
builder.Services.AddScoped<IProductoService, ProductoService>();

var app = builder.Build();

// ---------- Pipeline HTTP ----------
app.UseMiddleware<ExceptionHandlingMiddleware>(); // 1º: manejo global de excepciones
app.UseSwagger();                                  // Swagger UI en /swagger
app.UseSwaggerUI();
app.UseHttpsRedirection();                         // opcional: quitar si corres solo HTTP
app.MapControllers();                              // expone /api/v1/productos

app.Run();