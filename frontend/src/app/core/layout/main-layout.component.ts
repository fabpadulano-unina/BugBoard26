import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../services/notification.service'; // Service Notifiche
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { OverlayPanelModule } from 'primeng/overlaypanel'; // Per il pannello notifiche
import { BadgeModule } from 'primeng/badge'; // Per il badge rosso
import { AvatarModule } from 'primeng/avatar'; // Per icona utente

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MenubarModule, 
    ButtonModule,
    OverlayPanelModule,
    BadgeModule,
    AvatarModule
  ],
  template: `
    <div class="min-h-screen flex flex-column">
      <p-menubar [model]="items()">
        <ng-template pTemplate="end">
          <div class="flex align-items-center gap-3">
            
            <div class="relative cursor-pointer mr-2" (click)="op.toggle($event)">
                <i class="pi pi-bell text-xl text-600" 
                   pBadge 
                   [value]="notificationCount() || 0" 
                   severity="danger" 
                   [class.p-overlay-badge]="hasNotifications()">
                </i>
            </div>

            <!-- Pannello Notifiche -->
            <p-overlayPanel #op [style]="{width: '350px'}">
                <ng-template pTemplate>
                    <div class="flex flex-column gap-3">
                        <span class="font-bold text-lg text-900">Notifiche</span>
                        
                        @if (!hasNotifications()) {
                            <div class="text-center text-500 py-3">Nessuna nuova notifica</div>
                        }

                        @for (notif of notifications(); track notif.id) {
                            <div class="p-2 surface-hover border-round cursor-pointer flex align-items-center justify-content-between" 
                                 (click)="markRead(notif.id)">
                                <div class="flex flex-column">
                                  <span class="text-sm font-semibold">{{ notif.message }}</span>
                                  <span class="text-xs text-500">{{ notif.createdAt | date:'shortTime' }}</span>
                                </div>
                                <i class="pi pi-check text-xs text-primary"></i>
                            </div>
                        }
                    </div>
                </ng-template>
            </p-overlayPanel>

            <div class="flex align-items-center gap-2">
                <p-avatar icon="pi pi-user" shape="circle"></p-avatar>
                <span class="font-semibold text-sm hidden md:inline">{{ auth.currentUser()?.name }}</span>
            </div>

            <p-button label="Logout" icon="pi pi-power-off" styleClass="p-button-text p-button-danger" (onClick)="logout()"></p-button>
          </div>
        </ng-template>
      </p-menubar>

      <div class="p-4 flex-grow-1">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  public auth = inject(AuthService); 
  private router = inject(Router);
  private notifService = inject(NotificationService);

  notifications = this.notifService.unreadNotifications;
  
  notificationCount = computed(() => {
      const count = this.notifications().length;
      return count > 0 ? count.toString() : null;
  });

  hasNotifications = computed(() => this.notifications().length > 0);

  items = computed(() => {
    const user = this.auth.currentUser();
    const menu: MenuItem[] = [
       { label: 'BugBoard', icon: 'pi pi-bug', routerLink: '/dashboard', styleClass: 'font-bold text-primary' },
       { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
       { label: 'Nuova Issue', icon: 'pi pi-plus', routerLink: '/issues/new' }
    ];

    if (user?.role === 'ADMIN') { 
       menu.push({ 
         label: 'Crea Utente', 
         icon: 'pi pi-user-plus', 
         routerLink: '/users/new',
         styleClass: 'text-orange-500' 
       });
    }

    return menu;
  });

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  markRead(id: number) {
      this.notifService.markAsRead(id);
  }
}