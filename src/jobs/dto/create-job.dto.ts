import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateJobDto {
  @IsUUID()
  @IsNotEmpty()
  org_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  work_policy?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  employment_type?: string;

  @IsString()
  @IsOptional()
  experience_level?: string;

  @IsString()
  @IsOptional()
  job_type?: string;

  @IsString()
  @IsOptional()
  salary_range?: string;

  @IsString()
  @IsOptional()
  job_slug?: string;

  @IsString()
  @IsOptional()
  job_description?: string;

  @IsDateString()
  @IsOptional()
  closed_at?: string;
}

