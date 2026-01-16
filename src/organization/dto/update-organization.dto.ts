import { IsString, IsOptional, IsUrl, Matches } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'theme_color must be a valid hex color code (e.g., #FF5733)',
  })
  theme_color?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'logo_url must be a valid URL' })
  logo_url?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'website must be a valid URL' })
  website?: string;
}

