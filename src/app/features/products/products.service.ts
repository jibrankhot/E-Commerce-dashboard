import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Product, UpdateProductPayload } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly baseUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http
      .get<{ success: boolean; data: Product[] }>(this.baseUrl)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  getProduct(id: string): Observable<Product> {
    return this.http
      .get<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  addProduct(formData: FormData): Observable<Product> {
    return this.http
      .post<{ success: boolean; data: Product }>(this.baseUrl, formData)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  updateProduct(id: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http
      .patch<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`, payload)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }
}
