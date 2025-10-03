import { UserProfile } from './UserProfile';

export interface UserList {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
