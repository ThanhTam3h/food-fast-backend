import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  createAddress(@Req() req: any, @Body() createAddressDto: CreateAddressDto) {
    const userId = req.user.id;
    return this.addressService.create(userId, createAddressDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  findAllAddresses(@Req() req: any) {
    const userId = req.user.id;
    return this.addressService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  findOneAddress(@Req() req: any, @Param('id') id: number) {
    const userId = req.user.id;
    return this.addressService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  updateAddress(
    @Req() req: any,
    @Param('id') id: number,
    @Body() updateAdressDto: UpdateAddressDto,
  ) {
    const userId = req.user.id;
    return this.addressService.update(id, userId, updateAdressDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  removeAddress(@Req() req: any, @Param('id') id: number) {
    const userId = req.user.id;
    return this.addressService.remove(id, userId);
  }
}
