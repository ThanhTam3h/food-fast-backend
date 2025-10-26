import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/global-guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { MerchantService } from './merchant.service';
import { JWTAuthGuard } from '../auth/guards/jwt.guard';

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Public()
  @Post('register')
  async register(@Body() createMerchantDTO: CreateMerchantDto) {
    return this.merchantService.registerMerchant(createMerchantDTO);
  }

  @UseGuards(JWTAuthGuard)
  @Patch(':id')
  @ApiBody({ type: UpdateMerchantDto })
  @ApiBearerAuth('access-token')
  async updateMerchant(
    @Param('id') id: number,
    @Body() dto: UpdateMerchantDto,
    @Req() req: any, 
  ) {
    const userId = req.user.id;
    return this.merchantService.updateMerchant(id, userId, dto);
  }

  @Public()
  @Get("/")
  async findAllMerchants() {
    return await this.merchantService.findAllMerchants()
  }

  @Public()
  @Get(":id")
  async findMerchant(@Param('id') id: number) {
    return await this.merchantService.findOneMerchant(id)
  }
}
