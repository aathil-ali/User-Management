import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  preferences?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
    timezone?: string;
  };
}