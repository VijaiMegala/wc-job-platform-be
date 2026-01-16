import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserWithOrgDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  user_name: string;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  user_password: string;

  @IsString()
  @IsOptional()
  role_name?: string;

  @IsString()
  @IsNotEmpty()
  organization_name: string;
}

