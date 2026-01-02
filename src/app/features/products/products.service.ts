import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly baseUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http
      .get<{ success: boolean; data: Product[] }>(this.baseUrl)
      .pipe(map(res => res.data));
  }

  getProductById(id: string): Observable<Product> {
    return this.http
      .get<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  addProduct(formData: FormData): Observable<Product> {
    return this.http
      .post<{ success: boolean; data: Product }>(this.baseUrl, formData)
      .pipe(map(res => res.data));
  }

  updateProductJson(id: string, payload: any): Observable<Product> {
    return this.http
      .put<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  updateProductFormData(id: string, formData: FormData): Observable<Product> {
    return this.http
      .put<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`, formData)
      .pipe(map(res => res.data));
  }

  /**
   * DELETE PRODUCT (ADMIN)
   */
  deleteProduct(id: string): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${this.baseUrl}/${id}`)
      .pipe(map(() => void 0));
  }
}
