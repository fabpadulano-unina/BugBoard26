import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * Wrapper generico per GET
   */
  get<T>(path: string, params?: HttpParams | { [param: string]: string | number | boolean }): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params });
  }

  /**
   * Wrapper generico per POST
   * Aggiornato per accettare opzioni extra (es. params)
   */
  post<T>(path: string, body: any, options: { params?: any } = {}): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body, options);
  }

  /**
   * Wrapper generico per PUT
   * Aggiornato per accettare opzioni extra (es. params)
   */
  put<T>(path: string, body: any, options: { params?: any } = {}): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body, options);
  }

  /**
   * Wrapper generico per DELETE
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }
}