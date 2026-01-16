import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsUUID,
} from 'class-validator';

export class CreateCandidateDto {
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

  @IsUUID()
  @IsNotEmpty()
  org_id: string;
}

