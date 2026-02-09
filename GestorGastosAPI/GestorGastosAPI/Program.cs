using GestorGastosAPI.Data;
using GestorGastosAPI.Services;
using GestorGastosAPI.Utils;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System.Text.Json.Serialization;

// Creates a WebApplicationBuilder object
var builder = WebApplication.CreateBuilder(args);
/* 
   - Loads configuration (from appsettings.json, environment variables, 
     command line arguments, etc).

   - Configures logging (by default uses Microsoft.Extensions.Logging).

   - Exposes builder.Services, which is a dependency container (DI container).
 
 */

//////////////////////////////////////////////////////
//  1) SERVICE REGISTRATION IN THE DI CONTAINER    //
//////////////////////////////////////////////////////

// AddControllers(): Enables the use of controllers and API endpoints.
builder.Services.AddControllers();

// AddJsonOptions(): (1) - display enums as strings instead of int.
//                   (2) - convert dates to UTC when sending them to the frontend.  
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
});

/* -> So that when displaying enums, the field name is shown
 instead of the associated int. Both in Swagger when making a post, and when
receiving the response body in a get. */

// Configurations to allow large uploads (e.g., images).
// So that the Transaction entity can receive real images.
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = int.MaxValue;
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = int.MaxValue;
    options.ValueLengthLimit = int.MaxValue;
});

// Swagger (API documentation and testing).
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Modular Productivity Dashboard API",
            Version = "v1",
            Description = "API for productivity management including finances, habits, and personal tracking modules"
        });


        options.EnableAnnotations();
    });

// Database: connection to SQL Server using EF Core.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


//////////////////////////////////////////////////////
///////// Interface and service registration  ////////
//////////////////////////////////////////////////////

// Using dependency injection for custom services.
builder.Services.AddScoped<ITransactionService, TransactionService>();

/////////////////////////
///// Configure CORS ////
/////////////////////////

// Allow Angular (localhost:4200) to consume the API.
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
//// 2) BUILD AND CONFIGURE THE APP //////
//////////////////////////////////////////


// Important to do this AFTER adding all services (the builder.services)
var app = builder.Build();


// Middleware pipeline

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins); // CORS must go before MapControllers

app.UseAuthorization();

app.MapControllers();

app.Run();
