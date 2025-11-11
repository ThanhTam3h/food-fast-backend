import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/common/decorators/global-guard';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { MerchantService } from './merchant.service';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'IDENTITY', maxCount: 5 },
        { name: 'BUSINESS', maxCount: 5 },
        { name: 'KITCHEN', maxCount: 5 },
        { name: 'OTHERS', maxCount: 5 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() createMerchantDto: CreateMerchantDto,
    @UploadedFiles()
    files: {
      IDENTITY?: Express.Multer.File[];
      BUSINESS?: Express.Multer.File[];
      KITCHEN?: Express.Multer.File[];
      OTHERS?: Express.Multer.File[];
    },
  ) {
    return this.merchantService.create(createMerchantDto, files);
  }
}
