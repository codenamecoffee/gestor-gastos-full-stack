using GestorGastosAPI.DTOs;
using GestorGastosAPI.Models;
using GestorGastosAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestorGastosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transactions>>> GetAllAsync()
        {
            var transactions = await _transactionService.GetAllAsync();
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transactions>> GetByIdAsync(int id)
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        [HttpGet("filter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<Transactions>>> Filter(
            [FromQuery] string? description,
            [FromQuery] string? type,
            [FromQuery] string? category,
            [FromQuery] string? fromDate,
            [FromQuery] string? toDate,
            [FromQuery] string? mimeType
        )
        {
            DateTime? parsedFromDate = null;
            DateTime? parsedToDate = null;

            if (!string.IsNullOrWhiteSpace(fromDate) && DateTime.TryParse(fromDate, out var d))
                parsedFromDate = d;

            if (!string.IsNullOrWhiteSpace(toDate) && DateTime.TryParse(toDate, out var h))
                parsedToDate = h;

            // --- Date range validation ---
            if (parsedFromDate.HasValue && parsedToDate.HasValue && parsedFromDate > parsedToDate)
            {
                return BadRequest(new { message = "The start date cannot be later than the end date." });
            }

            try
            {
                var resultado = await _transactionService.FilterAsync(description, type, category, parsedFromDate, parsedToDate, mimeType);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error filtering transactions", detalle = ex.Message });
            }

        }

        [HttpGet("{id}/receipt")]
        public async Task<IActionResult> GetReceiptAsync(int id) 
        {
            var transaction = await _transactionService.GetByIdAsync(id);

            if (transaction == null || transaction.Receipt == null) 
            {
                return NotFound("No receipt was found for this transaction.");
            }

            var mimeType = transaction.ReceiptMimeType ?? "application/octet-stream"; // Generic file type(generic binary).
            var fileName = $"receipt_{id}";

            return File(transaction.Receipt, mimeType, fileName);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> CreateAsync([FromForm] TransactionCreateDto dto)
        {
            // More logs to debug the image issue:
            Console.WriteLine("Request Content-Type: " + Request.ContentType);
            Console.WriteLine("Form Files Count: " + Request.Form.Files.Count);

            if (Request.Form.Files.Count > 0) 
            {
                Console.WriteLine("First file: " + Request.Form.Files[0].FileName);
            }

            // Copilot's suggestion: Check if the model is valid.
            if (!ModelState.IsValid) 
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) });

                Console.WriteLine("Validation errors: ");
                foreach (var error in errors) 
                {
                    Console.WriteLine($"Field: {error.Field}");
                    foreach (var msg in error.Errors) 
                    {
                        Console.WriteLine($"  - {msg}");
                    }
                }
                return BadRequest(ModelState);
            }

            var transaction = await _transactionService.AddAsync(dto);
            return Ok(transaction);

            //return CreatedAtAction(nameof(GetByIdAsync), new { id = transaction.Id }, transaction); // A more "RESTful" practice.

        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateAsync(int id, [FromForm] TransactionUpdateDto dto)
        {
            // Additional logs for debugging:
            Console.WriteLine("Request Content-Type: " + Request.ContentType);
            Console.WriteLine("Form Files Count: " + Request.Form.Files.Count);

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) });

                Console.WriteLine("Validation errors: ");
                foreach (var error in errors)
                {
                    Console.WriteLine($"Field: {error.Field}");
                    foreach (var msg in error.Errors)
                    {
                        Console.WriteLine($"  - {msg}");
                    }
                }
                return BadRequest(ModelState);
            }

            var result = await _transactionService.UpdateAsync(id, dto);

            if (!result) 
            {
                return NotFound(); // Transaction not found.
            }

            return NoContent(); // Update successful.
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var result = await _transactionService.DeleteAsync(id);

            if (!result) 
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
