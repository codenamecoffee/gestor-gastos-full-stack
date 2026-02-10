import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id: number;
  date: string;  // In .NET it's DateTime, in Angular it travels as string (ISO 8601)
  description: string;
  category: string;  // The enum arrives as string (e.g., "Rent")
  amount: number;  // decimal in .NET = number in TypeScript
  currency: string;
  type: string;  // Same as category
  receipt?: string;
  receiptMimeType?: string;
}

export interface TransactionFilters {  // For filters in transactions-widget.component.ts
  description: string;
  type: string;
  category: string;
  fromDate: string;
  toDate: string;
  mimeType: string;
  minAmount: number | null;
  maxAmount: number | null;
};

@Injectable({
  providedIn: 'root'
})

export class TransactionService {
  private apiUrl = 'https://localhost:7274/api/transactions';

  constructor(private http: HttpClient) { }

  // Get all transactions
  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  // Filter transactions
  // filter(filters: any): Observable<any> {
  //   const params = new HttpParams({ fromObject: filters });
  //   return this.http.get(`${this.apiUrl}/filter`, { params });
  // }

  filter(filters: any): Observable<any> {
    let params = new HttpParams();
    
    // Solo agregar parámetros que no sean null, undefined o string vacío
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    return this.http.get(`${this.apiUrl}/filter`, { params });
  }

  // Get transaction by ID
  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  // Get transaction receipt
  getReceipt(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/receipt`, { responseType: 'blob' });
  }

  // Create a new transaction
  create(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // Update a transaction
  update(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  // Delete a transaction
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
