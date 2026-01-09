import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UserCreateRequest, UserSummary } from '../models/user.model';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  getAll() {
    return this.api.get<UserSummary[]>('users');
  }

  create(user: UserCreateRequest) {
    return this.api.post<UserSummary>('users', user);
  }
}