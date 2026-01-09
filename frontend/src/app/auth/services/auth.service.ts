import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { UserSummary } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);

  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  
  readonly currentUser = signal<UserSummary | null>(null);
  
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor() {
    if (this.isAuthenticated()) {
      this.fetchMe();
    }
  }

  login(credentials: AuthRequest) {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.tokenSignal.set(response.token);
        this.fetchMe(); 
      })
    );
  }
  
  private fetchMe() {
    this.api.get<UserSummary>('auth/me').subscribe({
        next: (user) => this.currentUser.set(user),
        error: () => this.logout() 
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }
}