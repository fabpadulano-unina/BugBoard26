import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { timer, switchMap, retry, share } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Notification } from '../models/notification.model';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(ApiService);
  
  // Signal che contiene la lista delle notifiche non lette
  // Viene aggiornato automaticamente dal polling
  unreadNotifications = signal<Notification[]>([]);

  constructor() {
    this.startPolling();
  }

  private startPolling() {
    // Polling: Ogni 15 secondi chiama il backend per vedere se ci sono novità
    // takeUntilDestroyed gestisce automaticamente l'unsubscribe se il service morisse (raro in root)
    timer(0, 15000).pipe(
      switchMap(() => this.api.get<Notification[]>('notifications/unread')),
      retry(2), // Se la rete fallisce, riprova 2 volte
      takeUntilDestroyed()
    ).subscribe({
      next: (notifications) => {
        this.unreadNotifications.set(notifications);
      },
      error: (err) => console.error('Errore polling notifiche', err)
    });
  }

  refresh() {
    this.api.get<Notification[]>('notifications/unread').subscribe(notifications => {
      this.unreadNotifications.set(notifications);
    });
  }

  markAsRead(id: number) {
    this.api.put(`notifications/${id}/read`, {}).subscribe(() => {
      this.unreadNotifications.update(list => list.filter(n => n.id !== id));
    });
  }
}