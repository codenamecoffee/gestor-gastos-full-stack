import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-actions.component.html',
  styleUrl: './transactions-actions.component.scss'
})
export class TransactionsActionsComponent {
  // INPUTS - Receives data from the parent
  @Input() isFormVisible: boolean = false;
  @Input() isReceiptVisible: boolean = false;
  @Input() isSearchVisible: boolean = false;

  // OUTPUTS - Sends events to the parent
  @Output() newTransaction = new EventEmitter<void>();
  @Output() openSearchBar = new EventEmitter<void>();

  // Methods that only emit events
  showForm(): void {
    this.newTransaction.emit();
  }

  viewSearchBar(): void {
    this.openSearchBar.emit();
  }
}
