import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { t } from '@/services/TranslationService';

export class RegisterDto {
  @IsEmail({}, { message: () => t.validation('email_invalid') })
  @IsNotEmpty({ message: () => t.validation('email_required') })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: () => t.validation('password_required') })
  @MinLength(8, { message: () => t.validation('password_min_length', { min: 8 }) })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: () => t.validation('name_required') })
  name!: string;
}
