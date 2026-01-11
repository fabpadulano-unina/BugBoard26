import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Aggiunto per gestire i Blob
import { ApiService } from '../../../core/services/api.service';
import { Issue, IssueRequest } from '../../../core/models/issue.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private api = inject(ApiService);
  private http = inject(HttpClient); // Serve per fetchare le immagini come Blob
  private readonly endpoint = 'issues';
  private baseUrl = environment.apiUrl;

  getAll() {
    return this.api.get<Issue[]>(this.endpoint);
  }

  create(issue: IssueRequest, file?: File) {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(issue)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    return this.api.post<Issue>(this.endpoint, formData);
  }

  // --- UPDATE MODIFICATO PER GESTIRE I FILE ---
  update(id: number, issue: IssueRequest, file?: File) {
    const formData = new FormData();
    // 1. Aggiungo il JSON come 'request'
    formData.append('request', new Blob([JSON.stringify(issue)], { type: 'application/json' }));
    
    // 2. Aggiungo il file SOLO se c'è
    if (file) {
      formData.append('file', file);
    }

    // Uso direttamente http.put per lasciare che il browser gestisca il boundary del Multipart
    return this.http.put<Issue>(`${this.baseUrl}/${this.endpoint}/${id}`, formData);
  }

  updateState(id: number, state: string) {
    return this.api.put<Issue>(`${this.endpoint}/${id}/state`, {}, { params: { state } });
  }

  getById(id: number): Observable<Issue> {
    return this.api.get<Issue>(`${this.endpoint}/${id}`);
  }

  // --- NUOVO METODO PER SCARICARE L'IMMAGINE ---
  getAttachment(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${this.endpoint}/${id}/attachment`, { 
      responseType: 'blob' 
    });
  }
}