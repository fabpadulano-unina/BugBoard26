export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role?: 'ADMIN' | 'USER';
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
}