namespace GestorGastosAPI.Models
{
    public enum TransactionType 
    { 
        Income = 1, 
        Expense = 2
    }

    public enum Category 
    {
        Rent = 0,
        BusTickets = 1,
        Hairdresser = 2,
        Gym = 3,
        Streaming = 4,
        MobileCredit = 5,
        Consumables = 6,
        Partner = 7,
        Unexpected = 8
    }

    public class Transactions
    {
        public int Id { get; set; } // Primary key

        public DateTime Date { get; set; }

        public string Description { get; set; } = "";
        // To avoid the fear of being NULL, but it never will be. It also can't remain an empty string.

        // Auto-property for the (hidden) field generated automatically
        public Category Category { get; set; }

        // Auto-property for the (hidden) field generated automatically.
        public decimal Amount { get; set; }

        // Auto-property for the (hidden) field generated automatically.
        public string Currency { get; set; } = "";
        // To avoid the fear of being NULL, but it never will be. It also can't remain an empty string.

        // Auto-property for the (hidden) field generated automatically
        // that uses the enum declared above the class to store the transaction type.
        public TransactionType Type { get; set; }

        // Auto-property (same as above) that will contain
        // a jpeg/png image, .txt file, or pdf as the transaction receipt
        public byte[]? Receipt { get; set; }

        public string? ReceiptMimeType { get; set; }

    }
}
