import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Issue, IssueRequest } from '../../../core/models/issue.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private api = inject(ApiService);
  private readonly endpoint = 'issues';

  getAll() {
    return this.api.get<Issue[]>(this.endpoint);
  }

  create(issue: IssueRequest, file?: File) {
    const formData = new FormData();
    
    formData.append('request', new Blob([JSON.stringify(issue)], {
      type: 'application/json'
    }));

    if (file) {
      formData.append('file', file);
    }

    return this.api.post<Issue>(this.endpoint, formData);
  }

  updateState(id: number, state: string) {
    return this.api.put<Issue>(`${this.endpoint}/${id}/state`, {}, { params: { state } });
  }

  getById(id: number): Observable<Issue> {
    return this.api.get<Issue>(`${this.endpoint}/${id}`);
  }

  update(id: number, issue: IssueRequest) {
    return this.api.put<Issue>(`${this.endpoint}/${id}`, issue);
  }
}