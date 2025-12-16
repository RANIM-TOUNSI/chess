import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/user';

  constructor(private http: HttpClient) { }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.id.toString());
        localStorage.setItem('username', res.username);
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  getUserId(): number | null {
    if (typeof localStorage !== 'undefined') {
      const id = localStorage.getItem('userId');
      return id ? parseInt(id, 10) : 999;
    }
    return 999;
  }

  getUsername(): string | null {
    if (typeof localStorage !== 'undefined') {
      const username = localStorage.getItem('username');
      return username ? username : 'Guest';
    }
    return 'Guest';
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      return token ? token : 'guest-token';
    }
    return 'guest-token';
  }
}
