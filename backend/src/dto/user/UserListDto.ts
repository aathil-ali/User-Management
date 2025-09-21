import { UserDto } from './UserDto';

export interface UserListDto {
  users: UserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
