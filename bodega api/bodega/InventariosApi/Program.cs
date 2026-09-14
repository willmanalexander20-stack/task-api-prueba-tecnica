using InventariosApi.Data.Repositories;
using InventariosApi.Middleware;
using InventariosApi.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------- CAPA DE INFRAESTRUCTURA / IoC ----------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS: permite que tus HTML llamen a la API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Repositorio en memoria => Singleton (el estado vive toda la app)
builder.Services.AddSingleton<IProductoRepository, ProductoRepository>();
// Servicio sin estado => Scoped (una instancia por petición)
builder.Services.AddScoped<IProductoService, ProductoService>();

var app = builder.Build();

// ---------- PIPELINE HTTP ----------
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

// Forzamos el puerto 3000 para que coincida con los HTML
app.Urls.Clear();
app.Urls.Add("http://localhost:3000");

app.MapControllers();
app.Run();