import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { IssueService } from '../../services/issue.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Issue, IssueState } from '../../../../core/models/issue.model';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenubarModule } from "primeng/menubar";

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    DropdownModule,
    ToastModule,
    MenubarModule
],
  providers: [MessageService], // Necessario per i Toast
  templateUrl: './issue-list.component.html'
})
export class IssueListComponent {
  private issueService = inject(IssueService);
  public auth = inject(AuthService);
  private messageService = inject(MessageService);

  issues = toSignal(this.issueService.getAll(), { initialValue: [] });

  stateOptions = Object.values(IssueState).map(s => ({ label: s, value: s }));

  getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
    switch (status) {
      case 'DONE': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'TODO': return 'warning';
      default: return undefined;
    }
  }

  getPrioritySeverity(priority: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
     switch (priority) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return undefined;
    }
  }

  onStateChange(issue: Issue, newState: string) {
    this.issueService.updateState(issue.id, newState).subscribe({
      next: () => {
        this.messageService.add({
            severity: 'success', 
            summary: 'Aggiornato', 
            detail: 'Stato modificato con successo'
        });
        issue.state = newState as IssueState; // Aggiorna la UI
      },
      error: () => {
        this.messageService.add({
            severity: 'error', 
            summary: 'Errore', 
            detail: 'Non hai i permessi per modificare questa issue'
        });
      }
    });
  }
  
  canEdit(issue: Issue): boolean {
      const currentUser = this.auth.currentUser();
      if (!currentUser) return false;
      return issue.assigneeId === currentUser.id;
  }
}