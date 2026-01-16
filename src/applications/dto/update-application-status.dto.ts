import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '../../entities/application.entity';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;
}

