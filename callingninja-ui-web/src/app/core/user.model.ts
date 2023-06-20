import { Role } from './role.model';

export interface User {
  username: string
  token: string;
  mobile?: number;
  name?: string;
  role?: Role;
  email?: string;
}
