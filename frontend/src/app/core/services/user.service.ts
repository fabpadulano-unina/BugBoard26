import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UserSummary } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  getAll() {
    return this.api.get<UserSummary[]>('users');
  }
}