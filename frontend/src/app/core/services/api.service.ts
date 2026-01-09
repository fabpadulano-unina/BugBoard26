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
   * Wrapper generico per le chiamate GET
   * @param path L'endpoint relativo (es. 'auth/login')
   * @param params Parametri opzionali query string
   */
  get<T>(path: string, params?: HttpParams | { [param: string]: string | number | boolean }): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params });
  }

  /**
   * Wrapper generico per le chiamate POST
   */
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body);
  }

  /**
   * Wrapper generico per le chiamate PUT
   */
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body);
  }

  /**
   * Wrapper generico per le chiamate DELETE
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }
}