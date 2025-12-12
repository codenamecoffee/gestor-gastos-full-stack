using GestorGastosAPI.DTOs;
using GestorGastosAPI.Models;
using GestorGastosAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestorGastosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransaccionesController : ControllerBase
    {
        private readonly ITransaccionService _transaccionService;

        public TransaccionesController(ITransaccionService transaccionService)
        {
            _transaccionService = transaccionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaccion>>> ObtenerTodas()
        {
            var transacciones = await _transaccionService.ObtenerTodas();
            return Ok(transacciones);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaccion>> ObtenerPorId(int id)
        {
            var transaccion = await _transaccionService.ObtenerPorId(id);
            if (transaccion == null)
            {
                return NotFound();
            }

            return Ok(transaccion);
        }

        [HttpGet("filtrar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<Transaccion>>> Filtrar(
            [FromQuery] string? descripcion,
            [FromQuery] string? tipo,
            [FromQuery] string? categoria,
            [FromQuery] string? desde,
            [FromQuery] string? hasta,
            [FromQuery] string? mimeType
        )
        {
            DateTime? fechaDesde = null;
            DateTime? fechaHasta = null;

            if (!string.IsNullOrWhiteSpace(desde) && DateTime.TryParse(desde, out var d))
                fechaDesde = d;

            if (!string.IsNullOrWhiteSpace(hasta) && DateTime.TryParse(hasta, out var h))
                fechaHasta = h;

            // --- Date range validation ---
            if (fechaDesde.HasValue && fechaHasta.HasValue && fechaDesde > fechaHasta)
            {
                return BadRequest(new { message = "The start date cannot be later than the end date." });
            }

            try
            {
                var resultado = await _transaccionService.Filtrar(descripcion, tipo, categoria, fechaDesde, fechaHasta, mimeType);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al filtrar transacciones", detalle = ex.Message });
            }

        }

        [HttpGet("{id}/comprobante")]
        public async Task<IActionResult> ObtenerComprobante(int id) 
        {
            var transaccion = await _transaccionService.ObtenerPorId(id);

            if (transaccion == null || transaccion.Comprobante == null) 
            {
                return NotFound("No se encontró ningún comprobante para esta transacción.");
            }

            //var mimeType = transaccion.ImagenMimeType ?? "image/jpeg";
            var mimeType = transaccion.ComprobanteMimeType ?? "application/octet-stream"; // Tipo genérico de archivo (binario genérico).
            var nombreArchivo = $"comprobante_{id}";

            return File(transaccion.Comprobante, mimeType, nombreArchivo);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> Crear([FromForm] TransaccionCreateDto dto)
        {
            // Más logs para depurar el tema de la imagen:
            Console.WriteLine("Request Content-Type: " + Request.ContentType);
            Console.WriteLine("Form Files Count: " + Request.Form.Files.Count);

            if (Request.Form.Files.Count > 0) 
            {
                Console.WriteLine("Primer archivo: " + Request.Form.Files[0].FileName);
            }

            // Sugerencia de Copilot: Verificar si el modelo es válido.
            if (!ModelState.IsValid) 
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) });

                Console.WriteLine("Errores de validación: ");
                foreach (var error in errors) 
                {
                    Console.WriteLine($"Campo: {error.Field}");
                    foreach (var msg in error.Errors) 
                    {
                        Console.WriteLine($"  - {msg}");
                    }
                }
                return BadRequest(ModelState);
            }

            var transaccion = await _transaccionService.Agregar(dto);
            return Ok(transaccion);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Actualizar(int id, [FromForm] TransaccionUpdateDto dto)
        {
            // Agregamos logs similares a los del POST para depurar:
            Console.WriteLine("Request Content-Type: " + Request.ContentType);
            Console.WriteLine("Form Files Count: " + Request.Form.Files.Count);

            var resultado = await _transaccionService.Actualizar(id, dto);

            if (!resultado) 
            {
                return NotFound(); // No se encontró la transacción.
            }

            return NoContent(); // Actualización exitosa.
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var resultado = await _transaccionService.Eliminar(id);

            if (!resultado) 
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
