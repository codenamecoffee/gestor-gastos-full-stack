using GestorGastosAPI.Data;
using GestorGastosAPI.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using GestorGastosAPI.Utils;
using Microsoft.AspNetCore.Http.Features;

// Crea un objeto WebApplicationBuilder
var builder = WebApplication.CreateBuilder(args);
/* 
   - Carga configuración (de appsettings.json, variables de entorno, 
     argumentos de línea de comando, etc).

   - Configura logging (por defecto usa Microsoft.Extensions.Logging).

   - Expone builder.Services, que es un contenedor de dependencias (DI container).
 
 */

//////////////////////////////////////////////////////
// 1) REGISTRO DE SERVICIOS EN EL CONTENEDOR DE DI //
//////////////////////////////////////////////////////

// Habilita el uso de controladores y API endpoints.
builder.Services.AddControllers();

// Configuraciones para permitir uploads grandes (ej: imágenes).
// Para que la entidad Transacción pueda recibir imagenes reales.
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = int.MaxValue;
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = int.MaxValue;
    options.ValueLengthLimit = int.MaxValue;
});

// Swagger (documentación y pruebas de la API).
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Base de datos: conexión a SQL Server usando EF Core.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


//////////////////////////////////////////////////////
// Registramos nuestra primer interfaz y servicio. ///
//////////////////////////////////////////////////////

// Usando inyección de dependencias de servicios personalizados.
builder.Services.AddScoped<ITransactionService, TransactionService>();


/////////////////////////////////////
// Formato para los JSON en HTTP ////
/////////////////////////////////////

// JSON: (1) - mostrar enums como strings en lugar de int.
//       (2) - convertir fechas a UTC al enviarlas al front. 
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
});

/* -> Para que a la hora de mostrar enums, se muestre el nombre del campo
 y no el int asociado. Tanto en Swagger a la hora de hacer un post, como a la hora
de recibir el body de la response en un get. */


/////////////////////////
//// Configurar CORS ////
/////////////////////////

// Permitir que Angular (localhost:4200) consuma la API.
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});



//////////////////////////////////////////
// 2) CONSTRUIR Y CONFIGURAR LA APP    //
//////////////////////////////////////////


// Importante hacer esto LUEGO de haber agregado todos los servicios (Los builder.services)
var app = builder.Build();


// Middleware pipeline

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins); // CORS debe ir antes de MapControllers

app.UseAuthorization();

app.MapControllers();

app.Run();
