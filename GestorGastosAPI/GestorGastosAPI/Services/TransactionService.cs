using GestorGastosAPI.Data;
using GestorGastosAPI.DTOs;
using GestorGastosAPI.Models;
using GestorGastosAPI.Utils;
using Microsoft.EntityFrameworkCore;

namespace GestorGastosAPI.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly AppDbContext _context; // For Dependency Injection

        public TransactionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Transactions>> GetAllAsync()
        {
            return await _context.Transactions.ToListAsync();
        }

        public async Task<Transactions?> GetByIdAsync(int id) 
        {
            return await _context.Transactions.FindAsync(id);
        }

        public async Task<List<Transactions>> FilterAsync(
            string? description,
            string? type,
            string? category,
            DateTime? fromDate,
            DateTime? toDate,
            string? mimeType
        )
        {
            var query = _context.Transactions.AsQueryable();

            if (!string.IsNullOrWhiteSpace(description))
                query = query.Where(transaction => EF.Functions.Like(transaction.Description, $"%{description}%"));

            if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<TransactionType>(type, true, out var typeEnum))
                query = query.Where(transaction => transaction.Type == typeEnum);

            if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<Category>(category, true, out var categoryEnum))
                query = query.Where(transaction => transaction.Category == categoryEnum);

            if (fromDate.HasValue)
                query = query.Where(transaction => transaction.Date >= fromDate.Value);

            if (toDate.HasValue)
            {
                // Includes the whole day 'toDate'
                var endOfDay = toDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(t => t.Date <= endOfDay);
            }

            if (!string.IsNullOrWhiteSpace(mimeType))
                query = query.Where(transaction => transaction.ReceiptMimeType == mimeType);

            return await query.ToListAsync();
        }

        public async Task<Transactions> AddAsync(TransactionCreateDto dto) 
        {
            byte[]? receiptBytes = null;

            if(dto.Receipt != null) 
            {
                /*Validador.ValidarComprobante(dto.Receipt);*/ // Class and method from ./Utils

                // Debugging the receipt:
                Console.WriteLine($"Receiving receipt: {dto.Receipt.FileName}, Tamaño: {dto.Receipt.Length} bytes.");

                using var memoryStream = new MemoryStream();
                await dto.Receipt.CopyToAsync(memoryStream);
                receiptBytes = memoryStream.ToArray();

                // Check if the receipt was successfully converted to byte[]
                Console.WriteLine($"Receipt converted to bytes: {receiptBytes.Length} bytes.");

            }
            else // In case no receipt was received.
            {
                Console.WriteLine("No receipt was received.");
            }

            var fecha = dto.Date?.ToUniversalTime() ?? DateTime.UtcNow;

            // '?' operator
            // (1) - If dto.Date is not null, then call ToUniversalTime() on that value.
            // (2) - If it is null, return null without throwing an error.

            // '??' operator
            // (1) - If the value on the left is null, use the one on the right.

            var transaction = new Transactions
                {
                    Date = fecha,
                    Description = dto.Description!,
                    Category = dto.Category!.Value,
                    Amount = dto.Amount!.Value,
                    Currency = dto.Currency!,
                    Type = dto.Type!.Value,
                    Receipt = receiptBytes,
                    ReceiptMimeType = dto.Receipt?.ContentType // Guardamos el tipo.
                };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }

        public async Task<bool> UpdateAsync(int id, TransactionUpdateDto dto) 
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null) 
            {
                return false;
            };

            if (dto.Date != null) 
            {
                // Ensure conversion to UTC
                var fecha = dto.Date.Value;

                if (fecha.Kind == DateTimeKind.Unspecified)
                    fecha = DateTime.SpecifyKind(fecha, DateTimeKind.Local);

                transaction.Date = fecha.ToUniversalTime();
            }

            transaction.Description = dto.Description!;
            transaction.Category = dto.Category!.Value;
            transaction.Amount = dto.Amount!.Value;
            transaction.Currency = dto.Currency!;
            transaction.Type = dto.Type!.Value;


            if (dto.UpdateReceipt) // If we want to remove the receipt
            {
                transaction.Receipt = null;
                transaction.ReceiptMimeType = null;

                // If we have a new receipt, replace it.
                if (dto.ReceiptInput != null) // Otherwise, everything remains the same.
                {
                    //Validador.ValidarComprobante(dto.ComprobanteInput); // Needs to be updated (was designed for images).

                    using var memoryStream = new MemoryStream();
                    await dto.ReceiptInput.CopyToAsync(memoryStream);
                    transaction.Receipt = memoryStream.ToArray();

                    // Update the MIME type
                    transaction.ReceiptMimeType = dto.ReceiptInput.ContentType;
                }
            }
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id) 
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return false;
            }
            
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
            
            return true;
            
        }
    }
}
