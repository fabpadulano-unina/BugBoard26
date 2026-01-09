import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { IssueType, Priority } from '../../../../core/models/issue.model';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-issue-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './issue-create.component.html'
})
export class IssueCreateComponent {
  private fb = inject(FormBuilder);
  private issueService = inject(IssueService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Opzioni per i Dropdown (convertiamo gli Enum in array di oggetti)
  types = Object.values(IssueType).map(t => ({ label: t, value: t }));
  priorities = Object.values(Priority).map(p => ({ label: p, value: p }));

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    type: [IssueType.BUG, [Validators.required]], // Default a BUG
    priority: [Priority.MEDIUM], // Default a MEDIUM
    deadline: [null as Date | null] 
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();
    const payload = {
      ...rawValue,
      deadline: rawValue.deadline ? rawValue.deadline.toISOString().split('T')[0] : undefined
    };

    this.issueService.create(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.errorMessage.set('Errore durante la creazione della issue. Riprova.');
      }
    });
  }
}