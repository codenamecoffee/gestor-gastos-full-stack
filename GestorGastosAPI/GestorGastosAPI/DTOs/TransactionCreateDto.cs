using System.ComponentModel.DataAnnotations;
using GestorGastosAPI.Models;
//using GestorGastosAPI.Utils;  For the custom validation attribute that I ultimately didn't use.
namespace GestorGastosAPI.DTOs
{
    public class TransactionCreateDto
    {
        public DateTime? Date { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [MinLength(2, ErrorMessage = "Please provide at least a brief reason for the transaction.")]
        [MaxLength(200, ErrorMessage = "Description cannot exceed 200 characters.")]

        public string? Description { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        public Category? Category { get; set; }

        [Required(ErrorMessage = "Amount is required.")]
        [Range(0, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        // Remember to use '0,1' instead of '0.1' for entering decimal values close to 0.
        public decimal? Amount { get; set; }

        [Required(ErrorMessage = "Currency is required (e.g., UYU or USD).")]
        [MinLength(2, ErrorMessage = "Please enter a valid currency.")]
        public string? Currency { get; set; }

        [Required(ErrorMessage = "Transaction type is required (Income or Expense).")]
        public TransactionType? Type { get; set; }

        public IFormFile? Receipt { get; set; }
    }
}
