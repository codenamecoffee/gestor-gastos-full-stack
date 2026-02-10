using Microsoft.EntityFrameworkCore;
using GestorGastosAPI.Models;

namespace GestorGastosAPI.Data
{
    public class AppDbContext : DbContext // ':' indica herencia de clase 
    {
        // Constructor
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbContextOptions is a class
        // <AppDbContext> is a generic type, which in this case is our class.
        // options is the instance of the DbContextOptions class.
        // options is passed as a parameter to the AppDbContext constructor.
        // ':' indicates an explicit call to the base class constructor, that is, DbContext.
        // In this exclusive call to the base class method, we pass the 'options' parameter.


        public DbSet<Transactions> Transactions { get; set; }

        // 'DbSet' is a class from EntityFramework Core that represents a database table.
        // 'Transactions' is therefore an instance of the DbSet class that uses the generic type 'Transactions'.
        // The class Transactions is known thanks to the using GestorGastosAPI.Models.

        // LINQ seems to be the syntax that EntityFrameworkCore uses to do what SQL does, but in C#.


        protected override void OnModelCreating(ModelBuilder modelBuilder) 
        {
            base.OnModelCreating(modelBuilder);
            // We call the OnModelCreating method of the inherited 'DbContext' class so it performs its default configuration.

            // - However - you can add rules to complement:

            modelBuilder.Entity<Transactions>().Property(t => t.Description).HasMaxLength(100);
            // Sets a character limit for the description (for example, 100).

            modelBuilder.Entity<Transactions>().Property(t => t.Amount).IsRequired();
            // Makes the 'Amount' field required (cannot be null).


            modelBuilder.Entity<Transactions>().Property(t => t.Amount).HasColumnType("decimal(18,2)");
            // By default, SQL Server uses something like decimal(18,2) (18 total digits, 2 decimals), but EF was not
            // configuring it explicitly, so it warns you that if you enter a very large or very precise number
            // (like 123456789012345.6789), it may be truncated or rounded. With this line, the warning in the console disappears.
        }

        // OnModelCreating is a method that is automatically called by Entity Framework when the
        // internal model of how classes are translated to tables is being created.

        // The modelBuilder parameter allows you to configure custom rules and relationships,
        // such as: changing the name of a table or column, configuring relationships
        // (one-to-many, many-to-many), adding constraints (required fields, max lengths, etc.).

        // You override OnModelCreating to use custom configurations.

        // If you don't call base.OnModelCreating(), you might be skipping important automatic configurations
        // that EF Core does for you, such as inferring table names, primary keys, basic relationships, etc.
        // That's why it's recommended to always leave it at the beginning of the method, and then put your custom rules,
        // which - if necessary - can overwrite the default configuration.
    }
}
