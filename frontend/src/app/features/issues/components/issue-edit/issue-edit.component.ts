import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { IssueType, Priority } from '../../../../core/models/issue.model';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-issue-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, 
    CardModule, InputTextModule, InputTextareaModule, 
    DropdownModule, CalendarModule, ButtonModule, 
    MessageModule, FileUploadModule, ImageModule
  ],
  templateUrl: './issue-edit.component.html'
})
export class IssueEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private issueService = inject(IssueService);
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  issueId = signal<number | null>(null);
  isLoading = signal(false);
  users = signal<any[]>([]); 
  
  currentImageUrl = signal<string | undefined>(undefined);
  selectedFile: File | undefined;

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

  ngOnDestroy() {
    // Importante: Rilascia la memoria del Blob URL quando esci dalla pagina
    if (this.currentImageUrl()) {
      URL.revokeObjectURL(this.currentImageUrl()!);
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

        const isAdmin = this.auth.currentUser()?.role === 'ADMIN';
        if (!isAdmin) {
            this.form.get('assigneeId')?.disable();
            this.form.get('deadline')?.disable();
        }
    });

    // 2. Carica l'immagine (Blob)
    this.issueService.getAttachment(id).subscribe({
      next: (blob) => {
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          this.currentImageUrl.set(url);
        }
      },
      error: () => this.currentImageUrl.set(undefined) 
    });
  }

  onFileSelect(event: FileSelectEvent) {
    this.selectedFile = event.files[0];
  }

  onSubmit() {
    if (this.form.invalid || !this.issueId()) return;
    this.isLoading.set(true);

    const rawValue = this.form.getRawValue();
    const payload = {
        ...rawValue,
        deadline: rawValue.deadline ? rawValue.deadline.toISOString().split('T')[0] : undefined,
    };

    this.issueService.update(this.issueId()!, payload as any, this.selectedFile).subscribe({
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