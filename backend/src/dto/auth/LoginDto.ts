import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { t } from '@/services/TranslationService';

export class LoginDto {
  @IsEmail({}, { message: () => t.validation('email_invalid') })
  @IsNotEmpty({ message: () => t.validation('email_required') })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: () => t.validation('password_required') })
  password!: string;
}
