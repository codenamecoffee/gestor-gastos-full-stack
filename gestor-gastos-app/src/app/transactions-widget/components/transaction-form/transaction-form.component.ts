import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionTypeOption, CategoryOption } from '../../transaction-mappings';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss'
})
export class TransactionFormComponent {
  // INPUTS - Data that ALWAYS comes from the parent (uses '!')
  @Input() newTransaction!: any;
  @Input() categories!: CategoryOption[];
  @Input() transactionTypes!: TransactionTypeOption[];
  @Input() useCustomDate!: boolean;
  @Input() hasReceipt!: boolean;
  @Input() deleteReceipt!: boolean;
  @Input() editingId!: number | null;
  @Input() addReceipt!: boolean

  // INPUTS - Data that can be null/false by default
  @Input() isSubmitting: boolean = false; 

  // OUTPUTS - Data sent to the parent component
  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() viewReceipt = new EventEmitter<number>();
  @Output() fileSelected = new EventEmitter<Event>();
  @Output() useCustomDateChange = new EventEmitter<boolean>();
  @Output() deleteReceiptChange = new EventEmitter<boolean>();

  @Output() addReceiptChange = new EventEmitter<boolean>();


  onAddReceiptChange(event: Event) {
    this.addReceiptChange.emit(this.addReceipt);
  }

  onUseCustomDateChange(event: Event) {
    this.useCustomDateChange.emit(this.useCustomDate);
  }

  onDeleteReceiptChange(event: Event) {
    this.deleteReceiptChange.emit(this.deleteReceipt);
  }

  onSubmit(): void {
    if (this.isSubmitting) return; // ⬅️ Prevent double submit
    this.submit.emit();
  }
  cancelCreation(): void {
    this.cancel.emit();
  }
  viewTransactionReceipt(): void {
    if (this.editingId) { // Depending on whether we are editing or creating
      this.viewReceipt.emit(this.editingId);
    }
  }
  onFileSelected(event: Event): void {
    this.fileSelected.emit(event);
  }
}
