import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { firstValueFrom } from 'rxjs';
import { Merchant, User, UserRole } from 'src/models';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Merchant) private merchantModel: typeof Merchant,
    @InjectModel(UserRole) private userRoleModel: typeof UserRole,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async getCoordinatesFromAddress(address: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address,
    )}&format=json&limit=1`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'YourAppNameHere', // bắt buộc phải có
          },
        }),
      );

      if (!response.data || response.data.length === 0) {
        throw new BadRequestException('Không tìm thấy địa chỉ trên bản đồ');
      }

      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch (error) {
      throw new BadRequestException(
        `Lỗi khi lấy tọa độ từ OSM: ${error.message}`,
      );
    }
  }

  async registerMerchant(createMerchantDTO: CreateMerchantDto) {
    const { userId, address } = createMerchantDTO;
    const checkUser = await this.userModel.findOne({
      where: { id: userId },
      include: [
        {
          model: this.userRoleModel,
          where: { roleId: 2 },
          required: true,
        },
      ],
    });

    if (!checkUser) {
      throw new BadRequestException(
        'User không có quyền tạo Merchant hoặc chưa tồn tại',
      );
    }

    // Lấy tọa độ từ địa chỉ
    const coordinates = await this.getCoordinatesFromAddress(address);
    if (!coordinates) {
      throw new BadRequestException('Không tìm thấy địa chỉ trên bản đồ');
    }

    const { latitude, longitude } = coordinates;

    // Tạo GeoJSON
    const geoJson = {
      type: 'Point',
      coordinates: [longitude, latitude], // Lưu theo [lon, lat]
    };

    // Lưu merchant
    const merchant = await Merchant.create({
      ...createMerchantDTO, // Spread toàn bộ DTO
      location: JSON.stringify(geoJson),
    } as any);

    await this.userRoleModel.update(
      { merchantId: merchant.id },
      {
        where: { userId: checkUser.id, roleId: 2 },
        returning: true, // PostgreSQL mới hỗ trợ trả về bản ghi
      },
    );

    return merchant;
  }

  async updateMerchant(
    merchantId: number,
    userId: number,
    updateMerchantDto: UpdateMerchantDto,
  ) {
    const role = await this.userRoleModel.findOne({
      where: { userId, roleId: 2 },
    });

    if (!role) {
      throw new ForbiddenException('Bạn không có quyền cập nhật Merchant');
    }

    // Kiểm tra user có đúng là chủ của merchant này không
    if (role.merchantId !== merchantId) {
      throw new ForbiddenException(
        'Bạn không được phép chỉnh sửa merchant của người khác',
      );
    }

    const merchant = await this.merchantModel.findByPk(merchantId);
    if (!merchant) throw new NotFoundException('Không tìm thấy Merchant');

    // Nếu đổi địa chỉ thì cập nhật tọa độ mới
    if (updateMerchantDto.address) {
      const coordinates = await this.getCoordinatesFromAddress(
        updateMerchantDto.address,
      );
      if (coordinates) {
        const { latitude, longitude } = coordinates;
        updateMerchantDto['location'] = JSON.stringify({
          type: 'Point',
          coordinates: [longitude, latitude],
        });
      }
    }

    await merchant.update(updateMerchantDto);
    return merchant;
  }

  async findAllMerchants() {
    const merchants = await this.merchantModel.findAll({
      include: [
        {
          model: this.userRoleModel,
          include: [{ model: this.userModel, attributes: ['id', 'email'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!merchants || merchants.length === 0) {
      throw new NotFoundException('Không có Merchant nào được tìm thấy');
    }

    return merchants;
  }

  async findOneMerchant(id: number) {
    const merchant = await this.merchantModel.findByPk(id, {
      include: [
        {
          model: this.userRoleModel,
          include: [{ model: this.userModel, attributes: ['id', 'email'] }],
          required: false,
        },
      ],
    });

    if (!merchant) {
      throw new NotFoundException(`Không tìm thấy Merchant với id ${id}`);
    }

    return merchant;
  }
}
