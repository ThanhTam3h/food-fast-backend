import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from 'src/models';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address)
    private readonly addressModel: typeof Address,
  ) {}

  async create(userId: number, createAddressDto: CreateAddressDto) {
    const newAddress = await this.addressModel.create({
      ...createAddressDto,
      userId,
      location: {
        type: 'Point',
        coordinates: createAddressDto.location.coordinates,
      },
    } as any);
    return newAddress;
  }

  async findAllByUser(userId: number) {
    return this.addressModel.findAll({ where: { userId } });
  }

  async findOne(id: number, userId: number) {
    const address = await this.addressModel.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');
    return address;
  }

  async update(id: number, userId: number, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);
    await address.update({
      ...updateAddressDto,
      location: updateAddressDto.location
        ? { type: 'Point', coordinates: updateAddressDto.location.coordinates }
        : address.location,
    } as any);
    return address;
  }

  async remove(id: number, userId: number) {
    const address = await this.findOne(id, userId);
    await address.destroy();
    return { message: 'Đã xóa địa chỉ thành công' };
  }
}
