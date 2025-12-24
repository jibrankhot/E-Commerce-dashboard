import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'admin_token';
  private readonly USER_KEY = 'admin_user';

  // Reactive auth state (Angular 16 signal)
  private _isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) { }

  /**
   * ADMIN LOGIN
   * POST /api/auth/login
   */
  login(payload: LoginPayload) {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        tap((response) => {
          const token = response?.data?.accessToken;
          const user = response?.data?.user;

          if (!token || user?.role !== 'ADMIN') {
            throw new Error('Unauthorized access');
          }

          this.storage.set(this.TOKEN_KEY, token);
          this.storage.set(this.USER_KEY, user);
          this._isAuthenticated.set(true);
        })
      );
  }

  /**
   * LOGOUT
   */
  logout(): void {
    this.storage.remove(this.TOKEN_KEY);
    this.storage.remove(this.USER_KEY);
    this._isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * AUTH CHECK (used by guard)
   */
  isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  /**
   * CURRENT ADMIN USER
   */
  getCurrentUser(): AuthUser | null {
    return this.storage.get<AuthUser>(this.USER_KEY);
  }

  /**
   * JWT TOKEN
   */
  getToken(): string | null {
    return this.storage.get<string>(this.TOKEN_KEY);
  }

  /**
   * INTERNAL
   */
  private hasToken(): boolean {
    return !!this.storage.get(this.TOKEN_KEY);
  }
}
