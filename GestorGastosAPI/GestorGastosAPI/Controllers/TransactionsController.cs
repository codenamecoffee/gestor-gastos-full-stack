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
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<Transactions>>> GetAllAsync()
        {
            try
            {
                //throw new Exception("Error simulation to test the 500 status code.");

                var transactions = await _transactionService.GetAllAsync();
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error retrieving transactions.",
                    detail = ex.Message
                });
            }    
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Transactions>> GetByIdAsync(int id)
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "No transaction found.",
                    Status = 404,
                    Detail = "The transaction with the specified ID does not exist."
                });
            }

            return Ok(transaction);
        }

        [HttpGet("filter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid request.",
                    Status = 400,
                    Detail = "The start date cannot be later than the end date."
                });
            }


            // Prevents the API from accepting invalid transaction types or categories in query parameters.
            if (!string.IsNullOrWhiteSpace(type) && !Enum.TryParse<TransactionType>(type, out _))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid transaction type.",
                    Status = 400,
                    Detail = $"Invalid transaction type: {type}"
                });
            }

            if (!string.IsNullOrWhiteSpace(category) && !Enum.TryParse<Category>(category, out _))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid category.",
                    Status = 400,
                    Detail = $"Invalid category: {category}"
                });
            }

            try
            {
                //throw new Exception("Error simulation to test the 500 status code.");
                var resultado = await _transactionService.FilterAsync(description, type, category, parsedFromDate, parsedToDate, mimeType);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    message = "Error filtering transactions.", 
                    detalle = ex.Message 
                });
            }

        }

        [HttpGet("{id}/receipt")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetReceiptAsync(int id) 
        {
            var transaction = await _transactionService.GetByIdAsync(id);

            if (transaction == null || transaction.Receipt == null) 
            {
                return NotFound( new
                {
                    message = "No receipt was found for this transaction."
                });
            }

            var mimeType = transaction.ReceiptMimeType ?? "application/octet-stream"; // Generic file type(generic binary).
            var fileName = $"receipt_{id}";

            return File(transaction.Receipt, mimeType, fileName);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                    .Where(x => x.Value != null && x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value!.Errors.Select(e => e.ErrorMessage) });

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

            try
            {
                //throw new Exception("Error simulation to test the 500 status code.");
                var transaction = await _transactionService.AddAsync(dto);
                //return Ok(transaction);

                return Created($"/api/transactions/{transaction.Id}", transaction); // A more "RESTful" practice, rather than 200 status code.
            }
            catch (Exception ex) 
            {
                return StatusCode(500, new 
                { 
                    message = "Error creating transaction.", 
                    detalle = ex.Message 
                });
            }
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateAsync(int id, [FromForm] TransactionUpdateDto dto)
        {
            // Additional logs for debugging:
            Console.WriteLine("Request Content-Type: " + Request.ContentType);
            Console.WriteLine("Form Files Count: " + Request.Form.Files.Count);

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value != null && x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value!.Errors.Select(e => e.ErrorMessage) });

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

            try
            {
                //throw new Exception("Error simulation to test the 500 status code.");
                var result = await _transactionService.UpdateAsync(id, dto);

                if (!result)
                {
                    return NotFound(new ProblemDetails
                    {
                        Title = "No transaction found.",
                        Status = 404,
                        Detail = "The transaction with the specified ID does not exist."
                    });
                }

                return NoContent(); // Update successful ~ no response returned.
            }
            catch (Exception ex) 
            {
                return StatusCode(500, new
                {
                    message = "Error updating transaction.",
                    detail = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var result = await _transactionService.DeleteAsync(id);

            if (!result) 
            {
                return NotFound(new ProblemDetails
                {
                    Title = "No transaction found.",
                    Status = 404,
                    Detail = "The transaction with the specified ID does not exist."
                });
            }

            return NoContent();
        }
    }
}
