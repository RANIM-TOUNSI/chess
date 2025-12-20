import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebSocketService } from '../services/websocket.service';
import { Router } from '@angular/router';

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/user`;

  // Add a subject to track logout status
  private loggingOut = new BehaviorSubject<boolean>(false);
  public loggingOut$ = this.loggingOut.asObservable();

  // Reactive Login State
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private injector: Injector, private router: Router) { }

  private hasToken(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('token', res.token);
          localStorage.setItem('userId', res.id.toString());
          localStorage.setItem('username', res.username);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  setOnline(username: string, online: boolean): Observable<any> {
    // If we are setting offline, call the new logout endpoint
    if (!online) {
      return this.http.post(`${this.apiUrl}/logout`, { username });
    }
    return new Observable(observer => { observer.next(null); observer.complete(); });
  }

  logout() {
    // 1. Set loading state
    this.loggingOut.next(true);

    const username = this.getUsername();

    // 2. Define cleanup function to run after network request (success or fail)
    const performLocalLogout = () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }

      // Lazy load WebSocketService to avoid circular dependency
      try {
        const wsService = this.injector.get(WebSocketService);
        wsService.disconnect();
      } catch (e) {
        console.warn('Could not disconnect WebSocket:', e);
      }

      this.isLoggedInSubject.next(false);
      this.loggingOut.next(false);
      this.router.navigate(['/login']);
    };

    // 3. Call backend to set offline
    if (username && username !== 'Guest') {
      this.setOnline(username, false).subscribe({
        next: () => {
          console.log('Backend logout success');
          performLocalLogout();
        },
        error: (err) => {
          console.error('Backend logout failed, forcing local logout', err);
          performLocalLogout();
        }
      });
    } else {
      performLocalLogout();
    }
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
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
