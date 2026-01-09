import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service'; // Importa il wrapper
import { AuthRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService); 

  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  login(credentials: AuthRequest) {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.tokenSignal.set(response.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSignal.set(null);
  }
}