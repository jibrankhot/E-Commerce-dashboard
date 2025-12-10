import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class ProductService {

  // JSON SERVER ENDPOINT
  private baseUrl = 'http://localhost:3000/products';

  // FUTURE BACKEND ENDPOINT (Node.js / Express)
  private uploadUrl = 'http://localhost:5000/upload'; // when backend is ready

  constructor(private http: HttpClient) { }

  // -----------------------------
  // PRODUCT CRUD
  // -----------------------------

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Robust getProduct:
   * 1) Try GET /products/:id
   * 2) If 404, try GET /products?id=:id and return first item (covers some JSON Server setups)
   */
  getProduct(id: number | string): Observable<any> {
    const idStr = String(id);
    return this.http.get<any>(`${this.baseUrl}/${idStr}`).pipe(
      catchError((err: HttpErrorResponse) => {
        // If the direct resource is not found, try query fallback
        if (err.status === 404) {
          return this.http.get<any[]>(`${this.baseUrl}?id=${encodeURIComponent(idStr)}`).pipe(
            map(arr => arr && arr.length > 0 ? arr[0] : null),
            switchMap(item => item ? of(item) : throwError(() => new Error('Product not found'))),
            catchError(e => throwError(() => e))
          );
        }
        return throwError(() => err);
      })
    );
  }

  addProduct(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data).pipe(
      catchError(err => this.handleError(err))
    );
  }

  /**
   * JSON Server supports PATCH and PUT. PATCH will update only provided fields.
   */
  updateProduct(id: number | string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, data).pipe(
      catchError(err => this.handleError(err))
    );
  }

  // -----------------------------
  // IMAGE UPLOAD (Backend-ready)
  // -----------------------------
  uploadImage(payload: { image: string }): Observable<any> {
    // In many dev setups the upload backend is not present. Return a controlled error so
    // component code can decide to use fallback images instead of getting a raw 404.
    return this.http.post(this.uploadUrl, payload).pipe(
      catchError(() => throwError(() => new Error('Upload backend not available')))
    );
  }

  // -----------------------------
  // Error handling
  // -----------------------------
  private handleError(err: any): Observable<never> {
    // Optional: add logging here
    return throwError(() => err);
  }
}
