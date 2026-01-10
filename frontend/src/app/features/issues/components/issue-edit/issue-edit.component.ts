import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { IssueType, Priority } from '../../../../core/models/issue.model';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-issue-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CardModule, InputTextModule, InputTextareaModule, DropdownModule, CalendarModule, ButtonModule, MessageModule],
  templateUrl: './issue-edit.component.html'
})
export class IssueEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private issueService = inject(IssueService);
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  issueId = signal<number | null>(null);
  isLoading = signal(false);
  users = signal<any[]>([]); 

  types = Object.values(IssueType).map(t => ({ label: t, value: t }));
  priorities = Object.values(Priority).map(p => ({ label: p, value: p }));

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    type: [IssueType.BUG, [Validators.required]],
    priority: [Priority.MEDIUM],
    deadline: [null as Date | null],
    assigneeId: [null as number | null]
  });

  ngOnInit() {
    this.userService.getAll().subscribe(u => this.users.set(u));

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
        this.issueId.set(id);
        this.loadIssue(id);
    }
  }

  loadIssue(id: number) {
    this.issueService.getById(id).subscribe(issue => {
        this.form.patchValue({
            title: issue.title,
            description: issue.description,
            type: issue.type,
            priority: issue.priority,
            deadline: issue.deadline ? new Date(issue.deadline) : null,
            assigneeId: issue.assigneeId || null
        });

        // PUNTO 4/18: Se NON sono admin, disabilito Assegnatario e Scadenza
        const isAdmin = this.auth.currentUser()?.role === 'ADMIN';
        if (!isAdmin) {
            this.form.get('assigneeId')?.disable();
            this.form.get('deadline')?.disable();
        }
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.issueId()) return;
    this.isLoading.set(true);

    const rawValue = this.form.getRawValue(); // Nota: getRawValue prende anche i campi disabilitati
    const payload = {
        ...rawValue,
        deadline: rawValue.deadline ? rawValue.deadline.toISOString().split('T')[0] : undefined,
    };

    this.issueService.update(this.issueId()!, payload as any).subscribe({
        next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/dashboard']);
        },
        error: (err) => {
            console.error(err);
            this.isLoading.set(false);
        }
    });
  }
}