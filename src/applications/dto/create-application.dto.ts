import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  org_id: string;

  @IsUUID()
  @IsNotEmpty()
  job_id: string;
}

