import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { timer, switchMap, retry, EMPTY } from 'rxjs'; // Aggiungi EMPTY
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'; // Aggiungi toObservable
import { Notification } from '../models/notification.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(ApiService);
  private authService = inject(AuthService); 
  
  unreadNotifications = signal<Notification[]>([]);

  constructor() {
    this.startReactivePolling();
  }

  private startReactivePolling() {
    // Converte il segnale isAuthenticated in un Observable
    toObservable(this.authService.isAuthenticated).pipe(
      switchMap(isLoggedIn => {
        if (isLoggedIn) {
          // SE LOGGATO: Avvia il timer (polling)
          return timer(0, 5000).pipe(
            switchMap(() => this.api.get<Notification[]>('notifications/unread')),
            retry(2)
          );
        } else {
          // SE NON LOGGATO: Ferma il polling e pulisci lo stato
          this.unreadNotifications.set([]); 
          return EMPTY; // EMPTY completa questo ramo dello stream senza emettere nulla
        }
      }),
      takeUntilDestroyed() 
    ).subscribe({
      next: (notifications) => {
        // Questo viene eseguito solo quando il timer emette valori validi
        this.unreadNotifications.set(notifications);
      },
      error: (err) => console.error('Errore polling notifiche', err)
    });
  }

  refresh() {
    // Esegui refresh manuale solo se l'utente è autenticato
    if (this.authService.isAuthenticated()) {
        this.api.get<Notification[]>('notifications/unread').subscribe(notifications => {
          this.unreadNotifications.set(notifications);
        });
    }
  }

  markAsRead(id: number) {
    this.api.put(`notifications/${id}/read`, {}).subscribe(() => {
      this.unreadNotifications.update(list => list.filter(n => n.id !== id));
    });
  }
}