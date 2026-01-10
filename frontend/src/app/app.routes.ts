import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { IssueListComponent } from './features/issues/components/issue-list/issue-list.component';
import { IssueCreateComponent } from './features/issues/components/issue-create/issue-create.component'; // Importa il nuovo componente
import { inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Router } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { UserCreateComponent } from './features/users/components/user-create/user-create.component';
import { IssueEditComponent } from './features/issues/components/issue-edit/issue-edit.component';
const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login');
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: IssueListComponent },
      { path: 'issues/new', component: IssueCreateComponent } ,
      { path: 'users/new', component: UserCreateComponent },
      { path: 'issues/edit/:id', component: IssueEditComponent } 
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];