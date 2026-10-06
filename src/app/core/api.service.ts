import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { RecordItem, User } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  private params(): HttpParams { return new HttpParams().set('delay', this.auth.delayMs()); }
  me(): Observable<User> { return this.http.get<User>('/api/me', { params: this.params() }); }
  records(): Observable<RecordItem[]> { return this.http.get<RecordItem[]>('/api/records', { params: this.params() }); }
  users(): Observable<User[]> { return this.http.get<User[]>('/api/users', { params: this.params() }); }
  saveUser(user: Partial<User> & { password?: string }): Observable<User> {
    return user.id ? this.http.patch<User>(`/api/users/${user.id}`, user, { params: this.params() }) : this.http.post<User>('/api/users', user, { params: this.params() });
  }
  deleteUser(id: string): Observable<void> { return this.http.delete<void>(`/api/users/${id}`, { params: this.params() }); }
}
