import { Component, OnInit, ViewChild, ElementRef,  Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { TransactionService, Transaction, TransactionFilters } from '../services/transaction.service';
import { WidgetComponent } from '../shared/widget/widget.component';
import { TransactionsActionsComponent } from './components/transactions-actions/transactions-actions.component';
import { TransactionsFiltersComponent } from './components/transactions-filters/transactions-filters.component';
import { TransactionCardComponent } from './components/transaction-card/transaction-card.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { TRANSACTION_TYPES, CATEGORIES, TransactionTypeOption, CategoryOption } from './transaction-mappings';

@Component({
  selector: 'app-transactions-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, WidgetComponent, TransactionsActionsComponent, TransactionsFiltersComponent, TransactionCardComponent, TransactionFormComponent], 
  templateUrl: './transactions-widget.component.html',
  styleUrl: './transactions-widget.component.scss'
})

export class TransactionsWidgetComponent implements OnInit {

  // In order to reference the card container and control the scroll.
  // The attribute #transactionsContainer was added to the transactions-container.
  @ViewChild('transactionsContainer', { static: false })
  transactionsContainer!: ElementRef;

  @Input() bodyHeight!: number;

  transactions: Transaction[] = []; // Array to save what comes from the API
  isFormVisible: boolean = false;
  useCustomDate: boolean = false;
  addReceipt: boolean = false;
  editingId: number | null = null;
  hasReceipt: boolean = false;
  deleteReceipt: boolean = false;
  isReceiptVisible: boolean = false;
  receiptUrl: SafeResourceUrl | null = null;
  isReceiptOverForm: boolean = false;
  receiptType: 'pdf' | 'image' | 'text' | null = null;
  textContent: string | null = null;
  isSearchVisible: boolean = false;
  isProcessing: boolean = false;

  // Subject to handle real-time searches with 'debounce' (add delays to function executions).
  // Receives filters and automatically executes the search with a delay to avoid backend spam
  private searchSubject = new Subject<Partial<TransactionFilters>>();

  newTransaction = {
    date: '', // Empty by default. It is only completed if the user selects the option.
    description: '',
    amount: 0,
    currency: '',
    category: '',
    type: '',
    receipt: null as File | null,
  };

  categories: CategoryOption[] = CATEGORIES;  
  transactionTypes: TransactionTypeOption[] = TRANSACTION_TYPES;

  filters: TransactionFilters = {
    description: '',
    type: '',
    category: '',
    fromDate: '',
    toDate: '',
    mimeType: ''
  };

  constructor(
    private transactionService: TransactionService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadTransactions();

    this.searchSubject.pipe(
      debounceTime(500),
      switchMap(searchFilters => this.transactionService.filter(searchFilters))
    ).subscribe({
      next: data => {
        this.transactions = data;
        // setTimeout(() => this.scrollToTop(), 100); // Delay for the DOM to update
      },
      error: err => console.error('Real-time search error', err)
    });
  }

  private refreshTransactionsWithFiltersIfNeeded(): void {
    const hasActiveFilters = Object.values(this.filters).some(valor => !!valor);
    if (hasActiveFilters || this.isSearchVisible) {
      this.onFilterChange();
    } else {
      this.loadTransactions();
    }
  }

  private scrollToTop(): void {  // Points to the div transactions-container
    if (this.transactionsContainer?.nativeElement) {
      this.transactionsContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  loadTransactions(): void {
    this.transactionService.getAll().subscribe(data => {
      this.transactions = data;
      // setTimeout(() => this.scrollToTop(), 100);
    });
  }

  showForm(): void {
    this.resetForm();
    this.isFormVisible = true;
  }

  resetForm(): void {
    this.addReceipt = false;
    this.useCustomDate = false;
    this.newTransaction = {
      date: '',
      description: '',
      amount: 0,
      currency: '',
      category: '',
      type: '',
      receipt: null,
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.addReceipt) {
      this.newTransaction.receipt = input.files[0];
    } else {
      this.newTransaction.receipt = null;
    }
  }

  cancelCreation(): void {
    this.editingId = null;
    this.isFormVisible = false;
    this.resetForm();
  }

  createTransaction(): void {
    const formData = new FormData();

    for (const key in this.newTransaction) {
      if (key === 'date' && !this.useCustomDate) continue; // Date not added if not used
      if (key === 'receipt' && this.newTransaction.receipt && this.addReceipt) {  // Receipt added if uploaded
        formData.append('receipt', this.newTransaction.receipt);
      } else if (key !== 'receipt') {
        formData.append(key, (this.newTransaction as any)[key]);
      }
    }

    this.transactionService.create(formData).subscribe({
      next: () => {
        this.isFormVisible = false;
        this.loadTransactions();
        this.resetForm();
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Error creating transaction', err);

        if (err.error && typeof err.error === 'string') {
          alert(err.error);
        } else if (err.error?.errors) {
          const mensajes = Object.values(err.error.errors).flat();
          alert(mensajes.join('\n'));
        } else {
          alert("The transaction couldn't be created. Please check the fields.");
        }
      }
    });
  }

  editTransaction(transaction: Transaction): void {
    this.isFormVisible = true;

    // Convert the UTC date from the backend to a local format compatible with local datetime
    const utcDate = new Date(transaction.date);
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

    // Load data into the current form:
    this.newTransaction = {
      date: formattedDate, // In order to render correctly on the input.
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.category,
      type: transaction.type,
      receipt: null, // Receipt not edited yet

    };

    // Save the ID to know which transaction we are editing.
    this.editingId = transaction.id;
    // Conversion: string/null => (!) = falsy/truthy => (!!) = true/false (boolean)
    this.hasReceipt = !!transaction.receipt; 
    this.deleteReceipt = false;
  }

  saveChanges(): void {
    if (!this.editingId) return;

    const formData = new FormData();
    for (const key in this.newTransaction) {
      if (key === 'date' && !this.useCustomDate) continue;
      if (key === 'receipt' && this.newTransaction.receipt) {
        formData.append('ReceiptInput', this.newTransaction.receipt);
      } else if (key !== 'receipt') {
        formData.append(key, (this.newTransaction as any)[key]);
      }
    }

    // Receipt logic
    if (this.deleteReceipt) {
      formData.append('UpdateReceipt', 'true');
    } else if (this.newTransaction.receipt) {
      // If a new one is uploaded, it also needs to be updated
      formData.append('UpdateReceipt', 'true');
    } else {
      formData.append('UpdateReceipt', 'false');
    }

    this.transactionService.update(this.editingId, formData).subscribe({
      next: () => {
        this.refreshTransactionsWithFiltersIfNeeded();
        this.isFormVisible = false;
        this.editingId = null;
        this.hasReceipt = false;
        this.deleteReceipt = false;
        this.resetForm();
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Update error:', err);

        if (err.error && typeof err.error === 'string') {
          alert(err.error);
        } else if (err.error?.errors) {
          const mensajes = Object.values(err.error.errors).flat();
          alert(mensajes.join('\n'));
        } else {
          alert("The transaction couldn't be updated. Please check the fields.");
        }
      }
    });
  }

  onSubmit() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    if (this.editingId) {
      this.saveChanges();
    } else {
      this.createTransaction();
    }

    // State is reset in the success/error callbacks of createTransaction/saveChanges
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.delete(id).subscribe(() => {
        this.refreshTransactionsWithFiltersIfNeeded();
      });
    }
  }

  viewReceipt(id: number, fromForm: boolean = false): void {
    this.transactionService.getReceipt(id).subscribe(blob => {
      // 1. Detect file type by MIME type
      this.determineFileType(blob);

      // 2. If it's text, extract the content
      if (this.receiptType === 'text') {
        this.extractText(blob);
      } else {
        // 3. For PDFs/images, create URLs as before
        const url = URL.createObjectURL(blob);
        this.receiptUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }

      this.isReceiptVisible = true;
      this.isReceiptOverForm = fromForm;
    });
  }

  private determineFileType(blob: Blob): void {
    if (blob.type.includes('pdf')) {
      this.receiptType = 'pdf';
    } else if (blob.type.includes('image')) {
      this.receiptType = 'image';
    } else if (blob.type.includes('text')) {
      this.receiptType = 'text';
    } else {
      this.receiptType = null;
    }
  }

  private extractText(blob: Blob): void {
    // 1. Create an instance of the reader
    const reader = new FileReader();

    // 2. Define what to do when finishing reading (callback)
    reader.onload = (event) => { 
      // event.target is the FileReader itself
      // event.target.result contains the read content
      this.textContent = event.target?.result as string;
    };

    // 3. Start reading (asynchronous)
    reader.readAsText(blob);
    // Note: This method returns immediately, but the callback above (reader.onload)
    // will be executed later, when the file reading is completed asynchronously by the browser.
  }

  isPDF(): boolean {
    return this.receiptType === 'pdf';
  }

  isImage(): boolean {
    return this.receiptType === 'image';
  }

  isText(): boolean {
    return this.receiptType === 'text';
  }

  closeReceipt(): void {
    this.isReceiptVisible = false;
    this.receiptUrl = null;
    this.isReceiptOverForm = false;
  }

  clean(): void {
    this.filters = {
      description: '',
      type: '',
      category: '',
      fromDate: '',
      toDate: '',
      mimeType: ''
    };
    setTimeout(() => this.scrollToTop(), 100);
    this.loadTransactions(); // return to the full list
  }

  viewSearchBar(): void {
    if (!this.isSearchVisible && !this.isFormVisible && !this.isReceiptVisible) {
      this.isSearchVisible = true;
    }
  }

  closeSearchBar(): void {
    this.isSearchVisible = false;
    this.clean();
  }

  onFilterChange(): void {
    const filtersCleaned: Partial<TransactionFilters> = {};
    (Object.keys(this.filters) as Array<keyof TransactionFilters>).forEach(key => {
      if (this.filters[key]) filtersCleaned[key] = this.filters[key];
    });
    this.searchSubject.next(filtersCleaned);
  }

}
