import { RegisterDto } from '@/dto/auth/RegisterDto';
import { LoginDto } from '@/dto/auth/LoginDto';
import { AuthResponseDto } from '@/dto/auth/AuthResponseDto';

export interface IAuthService {
  register(registerDto: RegisterDto): Promise<AuthResponseDto>;
  login(loginDto: LoginDto): Promise<AuthResponseDto>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
  logout(userId: string): Promise<void>;
}
