import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TemporaryAddressDto } from 'src/modules/cart-preview/dto/checkout.dto';

export class RegisterImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateMerchantDto {
  // --- 1. Thông tin cửa hàng / cơ bản ---

  @ApiProperty({ description: 'Tên cửa hàng' })
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @ApiProperty({ description: 'Tên cửa hàng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tên người đại diện' })
  @IsString()
  @IsOptional()
  representativeName?: string;

  @ApiProperty({ description: 'Email người đại diện' })
  @IsString()
  @IsOptional()
  representativeEmail: string;

  @ApiProperty({ description: 'Số điện thoại người đại diện' })
  @IsString()
  @IsOptional()
  representativeMobile: string;

  @ApiProperty({ description: 'Email cửa hàng' })
  @IsString()
  @IsOptional()
  merchantEmail?: string;

  @ApiProperty({ description: 'Số điện thoại cửa hàng' })
  @IsString()
  @IsOptional()
  merchantPhoneNumber?: string;

  @ApiProperty({
    required: false,
    type: () => TemporaryAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemporaryAddressDto)
  temporaryAddress: TemporaryAddressDto;

  @ApiProperty({ description: 'Mô hình kinh doanh (công ty/HKD/cá nhân)' })
  @IsString()
  @IsOptional()
  businessModel: string;

  @ApiProperty({
    description: 'Số lượng đơn hàng trung bình 1 ngày',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  dailyOrderVolume: number;

  // --- 2. Thông tin đăng ký & mô hình ---
  @ApiProperty({
    description: 'Hình thức đăng ký',
    example: 'Đăng ký nhà hàng mới',
  })
  @IsString()
  @IsOptional()
  registrationType: string;

  @ApiProperty({ description: 'Tên đăng ký kinh doanh đầy đủ' })
  @IsString()
  @IsOptional()
  legalBusinessName: string;

  @ApiProperty({ description: 'Mã số doanh nghiệp' })
  @IsString()
  @IsOptional()
  businessRegistrationCode: string;

  @ApiProperty({ description: 'Ngày đăng ký kinh doanh' })
  @IsDateString()
  @IsOptional()
  registrationDate: string;

  @ApiProperty({ description: 'Ngành nghề kinh doanh' })
  @IsString()
  @IsOptional()
  businessIndustry: string;

  @ApiProperty({ description: 'Danh sách hình ảnh liên quan' })
  @IsOptional()
  images: RegisterImageDto[];

  // --- 3. Thông tin ngân hàng ---
  @ApiProperty({ description: 'Tên ngân hàng' })
  @IsString()
  @IsOptional()
  bankName: string;

  @ApiProperty({ description: 'Số tài khoản ngân hàng' })
  @IsString()
  @IsOptional()
  bankAccountNumber: string;

  @ApiProperty({ description: 'Tên chủ tài khoản ngân hàng' })
  @IsString()
  @IsOptional()
  bankAccountHolderName: string;

  // --- 4. Thông tin chủ sở hữu ---
  @ApiProperty({ description: 'Tên chủ sở hữu' })
  @IsString()
  @IsOptional()
  ownerName: string;

  @ApiProperty({ description: 'Ngày sinh chủ sở hữu' })
  @IsDateString()
  @IsOptional()
  ownerDateOfBirth: string;

  @ApiProperty({ description: 'Số CMND/CCCD' })
  @IsString()
  @IsOptional()
  ownerIdNumber: string;

  @ApiProperty({ description: 'Ngày cấp CMND/CCCD' })
  @IsDateString()
  @IsOptional()
  ownerIdIssueDate: string;

  @ApiProperty({ description: 'Nơi cấp CMND/CCCD' })
  @IsString()
  @IsOptional()
  ownerIdIssuePlace: string;

  @ApiProperty({ description: 'Ngày hết hạn CMND/CCCD' })
  @IsDateString()
  @IsOptional()
  ownerIdExpiryDate: string;

  @ApiProperty({ description: 'Địa chỉ thường trú' })
  @IsString()
  @IsOptional()
  ownerPermanentAddress: string;

  @ApiProperty({ description: 'Quốc gia' })
  @IsString()
  @IsOptional()
  ownerCountry: string;

  @ApiProperty({ description: 'Thành phố' })
  @IsString()
  @IsOptional()
  ownerCity: string;

  @ApiProperty({ description: 'Địa chỉ hiện tại' })
  @IsString()
  @IsOptional()
  ownerCurrentAddress: string;
}
