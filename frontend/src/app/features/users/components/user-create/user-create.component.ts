import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password'; // Per input password sicuro
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './user-create.component.html'
})
export class UserCreateComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Opzioni Ruoli
  roles = [
    { label: 'Utente Normale', value: 'USER' },
    { label: 'Amministratore', value: 'ADMIN' }
  ];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER', [Validators.required]] // Default USER
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Casting del ruolo per TypeScript
    const rawValue = this.form.getRawValue();
    const payload = {
        ...rawValue,
        role: rawValue.role as 'ADMIN' | 'USER'
    };

    this.userService.create(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']); // O a una lista utenti se la faremo
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        // Gestione errore se email esiste già (dal backend arriva 500 o 400)
        this.errorMessage.set('Errore: ' + (err.error?.message || 'Impossibile creare utente'));
      }
    });
  }
}