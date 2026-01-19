import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionFilters } from '../../../services/transaction.service';
import { CategoryOption } from '../../transaction-mappings';

@Component({
  selector: 'app-transactions-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-filters.component.html',
  styleUrl: './transactions-filters.component.scss'
})
export class TransactionsFiltersComponent {
  today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // INPUTS - Receives data from the parent
  @Input() isFormVisible: boolean = false;
  @Input() isReceiptVisible: boolean = false;
  @Input() isSearchVisible: boolean = false;
  @Input() categories!: CategoryOption[];
  @Input() filters!: TransactionFilters;

  // OUTPUTS - Sends events to the parent
  @Output() filterChange = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() closeFilters = new EventEmitter<void>();

  // Methods that only emit events
  onFilterChange(): void {
    this.filterChange.emit();
  }

  clear(): void {
    this.clearFilters.emit();
  }

  closeSearchBar(): void {
    this.closeFilters.emit();
  }
}
