import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueService } from '../../services/issue.service';
import { toSignal } from '@angular/core/rxjs-interop';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenubarModule } from "primeng/menubar";

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, TooltipModule, MenubarModule],
  templateUrl: './issue-list.component.html'
})
export class IssueListComponent {
  private issueService = inject(IssueService);

  // La chiamata parte automaticamente quando il componente viene creato
  issues = toSignal(this.issueService.getAll(), { initialValue: [] });

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
      default: return undefined; // grigio
    }
  }
}