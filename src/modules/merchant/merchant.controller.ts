import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/common/decorators/global-guard';
import { ApproveMerchantDto } from './dto/approve-merchant.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { MerchantService } from './merchant.service';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Public()
  @Post('/validate-email')
  async validateEmailMerchant(@Body() body: { email: string }) {
    return await this.merchantService.validateEmailMerchant(body.email);
  }

  @Public()
  @Get('nearby')
  async getNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 100,
  ) {
    return this.merchantService.findNearby(lat, lng, radius);
  }

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
  async registerMerchant(
    @Body() createMerchantDto: CreateMerchantDto,
    @UploadedFiles()
    files: {
      IDENTITY?: Express.Multer.File[];
      BUSINESS?: Express.Multer.File[];
      KITCHEN?: Express.Multer.File[];
      OTHERS?: Express.Multer.File[];
    },
  ) {
    return this.merchantService.registerMerchant(createMerchantDto, files);
  }

  @Public()
  @Get('/:ownerId')
  async findMerchant(@Param('ownerId') ownerId: number) {
    return await this.merchantService.findMerchantsByOwner(ownerId);
  }

  @Public()
  @Get('/merchant/:merchantId')
  async findOneMerchant(@Param('merchantId') merchantId: number) {
    return await this.merchantService.findOne(merchantId);
  }

  @Public()
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'AVATAR', maxCount: 1 },
        { name: 'BACKGROUND', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param('id') id: number,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @UploadedFiles()
    files: {
      AVATAR?: Express.Multer.File[];
      BACKGROUND?: Express.Multer.File[];
    },
  ) {

    return this.merchantService.updateMerchant(
      id,
      updateMerchantDto,
      files,
    );
  }

  @Public()
  @Get('')
  async findAllMerchants() {
    return await this.merchantService.findAll();
  }

  @Public()
  @Patch('/approve/:id')
  async approveMerchant(
    @Param('id') id: number,
    @Body() approveMerchantDto: ApproveMerchantDto,
  ) {
    return await this.merchantService.approveMerchant(id, approveMerchantDto);
  }
}
