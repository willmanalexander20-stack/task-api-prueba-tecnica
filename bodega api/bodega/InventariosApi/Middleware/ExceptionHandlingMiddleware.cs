namespace InventariosApi.Middleware;

/// <summary>Captura excepciones no controladas y responde con ProblemDetails (RFC 7807).</summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Excepción no controlada en {Path}", context.Request.Path);
            await EscribirProblemDetailsAsync(context, ex);
        }
    }

    private static async Task EscribirProblemDetailsAsync(HttpContext context, Exception ex)
    {
        var (estado, titulo) = ex switch
        {
            ArgumentException      => (StatusCodes.Status400BadRequest, "Solicitud inválida"),
            KeyNotFoundException   => (StatusCodes.Status404NotFound, "Recurso no encontrado"),
            _                      => (StatusCodes.Status500InternalServerError, "Error interno del servidor")
        };

        context.Response.StatusCode = estado;
        await Results.Problem(
            title: titulo,
            detail: ex.Message,
            statusCode: estado,
            type: "https://tools.ietf.org/html/rfc7807").ExecuteAsync(context);
    }
}