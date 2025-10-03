import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { t } from '@/services/TranslationService';

export class LogoutDto {
  @IsString({ message: () => t.validation('user_id_must_be_string') })
  @IsNotEmpty({ message: () => t.validation('user_id_required') })
  @IsUUID('4', { message: () => t.validation('user_id_must_be_uuid') })
  userId!: string;
}
