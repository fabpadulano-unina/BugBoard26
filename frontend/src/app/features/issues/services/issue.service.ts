import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Issue, IssueRequest } from '../../../core/models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private api = inject(ApiService);
  private readonly endpoint = 'issues'; 

  getAll() {
    return this.api.get<Issue[]>(this.endpoint);
  }

  create(issue: IssueRequest) {
    return this.api.post<Issue>(this.endpoint, issue);
  }
}