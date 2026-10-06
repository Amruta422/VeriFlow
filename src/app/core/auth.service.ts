import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User, UserRole } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'veriflow.token';
  readonly currentUser = signal<User | null>(this.readUser());
  readonly delayMs = signal(Number(localStorage.getItem('veriflow.delay') ?? 700));
  constructor(private http: HttpClient, private router: Router) {}

  login(userId: string, password: string, role: UserRole): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { userId, password, role, delay: this.delayMs() }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem('veriflow.user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
      })
    );
  }
  token(): string | null { return localStorage.getItem(this.tokenKey); }
  setDelay(value: number): void { this.delayMs.set(value); localStorage.setItem('veriflow.delay', String(value)); }
  logout(): void { localStorage.removeItem(this.tokenKey); localStorage.removeItem('veriflow.user'); this.currentUser.set(null); void this.router.navigate(['/login']); }
  private readUser(): User | null {
    try { const value = localStorage.getItem('veriflow.user'); return value ? JSON.parse(value) as User : null; }
    catch { return null; }
  }
}
