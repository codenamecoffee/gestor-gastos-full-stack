import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../services/transaction.service';
import { TRANSACTION_TYPES, CATEGORIES } from '../../transaction-mappings';

@Component({
  selector: 'app-transaction-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-card.component.html',
  styleUrl: './transaction-card.component.scss'
})
export class TransactionCardComponent {
  // INPUT - Receives the transaction from the parent
  @Input() transaction!: Transaction;

  // OUTPUTS - Sends events to the parent
  @Output() edit = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<number>();
  @Output() viewReceipt = new EventEmitter<number>();

  // Methods that emit events
  editTransaction(): void {
    this.edit.emit(this.transaction); // Send the entire transaction
  }

  deleteTransaction(): void {
    this.delete.emit(this.transaction.id); // Send only the ID
  }

  viewTransactionReceipt(): void {
    this.viewReceipt.emit(this.transaction.id); // Send only the ID
  }

  getTypeLabel(value: string): string {
    return TRANSACTION_TYPES.find(type => type.value === value)?.label || value;
  }

  getCategoryLabel(value: string): string {
    return CATEGORIES.find(category => category.value === value)?.label || value;
  }

  // Method to format date (moved from parent)
  formatDate(fechaIso: string): string {
    if (!fechaIso) return '';
    return new Date(fechaIso).toLocaleString('es-UY', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    });
  }

  /* If we want dynamic conversion to the client's timezone (not just Uruguay):

    .toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    });

    => The undefined uses the regional settings of the system or the user's browser.

  */
}
