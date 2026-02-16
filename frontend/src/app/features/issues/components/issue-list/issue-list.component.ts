import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // Importante per il link di modifica
import { toSignal } from '@angular/core/rxjs-interop';

import { IssueService } from '../../services/issue.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Issue, IssueState } from '../../../../core/models/issue.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    TableModule, TagModule, ButtonModule, TooltipModule, DropdownModule, ToastModule,
    InputTextModule, IconFieldModule, InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './issue-list.component.html'
})
export class IssueListComponent {
  private issueService = inject(IssueService);
  public auth = inject(AuthService);
  private messageService = inject(MessageService);

  issues = toSignal(this.issueService.getAll(), { initialValue: [] });

  stateOptions = Object.values(IssueState).map(s => ({ label: s, value: s }));

  getSeverity(status: string) {  
     if(status==='DONE') return 'success';
     if(status==='IN_PROGRESS') return 'info';
     return 'warning';
  }
  
  getPrioritySeverity(priority: string) { 
     if(priority==='HIGH') return 'danger';
     if(priority==='MEDIUM') return 'warning';
     return 'info';
  }

  onStateChange(issue: Issue, newState: string) {
      this.issueService.updateState(issue.id, newState).subscribe((updatedIssue) => {
        this.messageService.add({severity:'success', summary:'Success', detail:`Stato dell'Issue #${issue.id} aggiornato a ${newState}`});
      });
  }
  
  canEdit(issue: Issue): boolean {
      const user = this.auth.currentUser();
      if (!user) return false;
      return user.role === 'ADMIN' || issue.assigneeId === user.id || issue.reporterId === user.id;
  }
}