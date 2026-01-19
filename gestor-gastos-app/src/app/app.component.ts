import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransactionsWidgetComponent } from './transactions-widget/transactions-widget.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TransactionsWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gestor-gastos-app';
}
