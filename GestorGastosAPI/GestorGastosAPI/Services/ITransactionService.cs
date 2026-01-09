using GestorGastosAPI.DTOs;
using GestorGastosAPI.Models;

namespace GestorGastosAPI.Services
{
    public interface ITransactionService
    {
        Task<List<Transactions>> GetAllAsync();

        Task<Transactions?> GetByIdAsync(int id);

        Task<List<Transactions>> FilterAsync(
            string? description,
            string? type,
            string? category,
            DateTime? fromDate,
            DateTime? toDate,
            string? mimeType
        );

        Task<Transactions> AddAsync(TransactionCreateDto dto);

        public Task<bool> UpdateAsync(int id, TransactionUpdateDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
