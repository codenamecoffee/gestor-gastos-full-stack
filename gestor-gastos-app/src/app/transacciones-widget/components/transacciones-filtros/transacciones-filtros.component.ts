import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosTransaccion } from '../../../services/transaccion.service';


@Component({
  selector: 'app-transacciones-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transacciones-filtros.component.html',
  styleUrl: './transacciones-filtros.component.scss'
})
export class TransaccionesFiltrosComponent {
  today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // INPUTS - Recibe datos del padre
  @Input() mostrarFormulario: boolean = false;
  @Input() mostrarComprobante: boolean = false;
  @Input() mostrarBuscador: boolean = false;
  @Input() categorias: string[] = [];
  @Input() filtros!: FiltrosTransaccion;

  // OUTPUTS - Envía eventos al padre
  @Output() filtroChange = new EventEmitter<void>();
  @Output() limpiarFiltros = new EventEmitter<void>();
  @Output() cerrarFiltros = new EventEmitter<void>();

  // Métodos que solo emiten eventos
  onFiltroChange(): void {
    this.filtroChange.emit();
  }

  limpiar(): void {
    this.limpiarFiltros.emit();
  }

  cerrarBuscador(): void {
    this.cerrarFiltros.emit();
  }
}
