import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MenubarModule, ButtonModule],
  template: `
    <div class="min-h-screen flex flex-column">
      <p-menubar [model]="items">
        <ng-template pTemplate="end">
          <p-button label="Logout" icon="pi pi-power-off" styleClass="p-button-text p-button-danger" (onClick)="logout()"></p-button>
        </ng-template>
      </p-menubar>

      <div class="p-4 flex-grow-1">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  items: MenuItem[] = [
    { label: 'BugBoard', icon: 'pi pi-bug', routerLink: '/dashboard', styleClass: 'font-bold text-primary' },
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Nuova Issue', icon: 'pi pi-plus', routerLink: '/issues/new' } 
  ];

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}