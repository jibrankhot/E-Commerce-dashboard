import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  Product,
  CreateProductPayload,
  UpdateProductPayload
} from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly baseUrl = 'http://localhost:5000/api/products';
  private readonly uploadUrl = 'http://localhost:5000/upload';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.baseUrl)
      .pipe(catchError(err => throwError(() => err)));
  }

  getProduct(id: string): Observable<Product> {
    return this.http
      .get<Product>(`${this.baseUrl}/${id}`)
      .pipe(catchError(err => throwError(() => err)));
  }

  addProduct(payload: CreateProductPayload): Observable<Product> {
    return this.http
      .post<Product>(this.baseUrl, payload)
      .pipe(catchError(err => throwError(() => err)));
  }

  updateProduct(id: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http
      .patch<Product>(`${this.baseUrl}/${id}`, payload)
      .pipe(catchError(err => throwError(() => err)));
  }

  uploadImage(payload: { image: string }): Observable<{ url: string }> {
    return this.http
      .post<{ url: string }>(this.uploadUrl, payload)
      .pipe(catchError(err => throwError(() => err)));
  }
}
