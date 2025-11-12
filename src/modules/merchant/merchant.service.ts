import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Merchant } from 'src/models/merchant.model';
import {
  MerchantImage,
  MerchantImageType,
} from 'src/models/merchant_image.model';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { Address } from 'src/models';

@Injectable()
export class MerchantService {
  constructor(
    @InjectModel(Merchant)
    private readonly merchantModel: typeof Merchant,

    @InjectModel(Address)
    private readonly addressModel: typeof Merchant,

    @InjectModel(MerchantImage)
    private readonly merchantImageModel: typeof MerchantImage,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * filesByType: {
   *   IDENTITY?: File[],
   *   BUSINESS?: File[],
   *   KITCHEN?: File[],
   *   OTHERS?: File[]
   * }
   */
  async create(
    createMerchantDto: CreateMerchantDto,
    filesByType?: Record<string, Express.Multer.File[]>,
  ): Promise<Merchant> {
    // Tạo merchant chính
    const merchant = await this.merchantModel.create(createMerchantDto as any);

    // Upload từng nhóm file theo type
    if (filesByType) {
      for (const typeKey of Object.keys(filesByType)) {
        const type = typeKey.toUpperCase() as MerchantImageType;
        const files = filesByType[typeKey];

        for (const file of files) {
          const url = await this.cloudinaryService.uploadImage(
            file,
            'merchants',
          );

          await this.merchantImageModel.create({
            merchantId: merchant.id,
            url,
            type,
          } as any);
        }
      }
    }

    // Trả về merchant kèm ảnh
    const createdMerchant = await this.merchantModel.findByPk(merchant.id, {
      include: [MerchantImage],
    });

    if (!createdMerchant) throw new Error('Merchant not found after creation');

    return createdMerchant;
  }

  async findOne(merchantId: number) {
    const merchant = await this.merchantModel.findByPk(merchantId, {
      attributes: ['id', 'name'], // bạn vẫn muốn lấy id, name
      include: [
        {
          model: this.addressModel,
          attributes: ['street', 'location'], // chỉ lấy các trường cần thiết
        },
      ],
    });
    return merchant;
  }
}
