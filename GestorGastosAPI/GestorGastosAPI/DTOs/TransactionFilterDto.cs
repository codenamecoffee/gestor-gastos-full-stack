using Microsoft.AspNetCore.Mvc;
using GestorGastosAPI.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace GestorGastosAPI.DTOs
{
    public class TransactionFilterDto
    {   
        public string? Description { get; set; }
        public TransactionType? Type {  get; set; }
        public Category? Category {  get; set; }
        public string? FromDate {  get; set; }
        public string? ToDate {  get; set; }

        [SwaggerSchema(Description = "MIME type of the receipt file. Example: application/pdf, image/jpeg, image/png.")]
        public string? MimeType {  get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }
}
