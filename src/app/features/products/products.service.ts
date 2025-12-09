import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) { }

  getProducts() {
    return this.http.get<any[]>(this.baseUrl);
  }
  addProduct(data: any) {
    return this.http.post(this.baseUrl, data);
  }

}
