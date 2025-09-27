import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @IsString()
  name: string;

  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNumber()
  merchantId: number;
}
