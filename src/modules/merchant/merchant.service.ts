import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Address, User } from 'src/models';
import { Merchant, MerchantStatus } from 'src/models/merchant.model';
import {
  MerchantImage,
  MerchantImageType,
} from 'src/models/merchant_image.model';
import { AddressService } from '../address/address.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApproveMerchantDto } from './dto/approve-merchant.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantService {
  constructor(
    @InjectModel(Merchant)
    private readonly merchantModel: typeof Merchant,

    @InjectModel(Address)
    private readonly addressModel: typeof Merchant,

    @InjectModel(MerchantImage)
    private readonly merchantImageModel: typeof MerchantImage,

    @InjectModel(User)
    private readonly userModel: typeof User,

    private readonly addressService: AddressService,

    private readonly cloudinaryService: CloudinaryService,

    private readonly mailerService: MailerService,

    private readonly sequelize: Sequelize,
  ) {}

  async validateEmailMerchant(email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Tiếp tục đăng ký để trở thành đối tác trên FastFood Delivery',
        template: './register-merchant',
        context: {
          userEmail: email,
          appName: 'FastFood Delivery',
          registrationLink: `${process.env.REACT_URL}/register-merchant`,
        },
      });
      return {
        message: `OTP sent to ${email}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async registerMerchant(
    createMerchantDto: CreateMerchantDto,
    filesByType?: Record<string, Express.Multer.File[]>,
  ): Promise<Merchant> {
    const t = await this.sequelize.transaction();
    try {
      // Check email
      const existEmail = await this.userModel.findOne({
        where: { email: createMerchantDto.representativeEmail },
        include: [
          {
            model: this.merchantModel,
            where: {
              representativeEmail: createMerchantDto.representativeEmail,
            },
          },
        ],
      });

      if (existEmail) {
        throw new BadRequestException('Email is already registerd');
      }

      // Tạo email cho user
      await this.userModel.create(
        { email: createMerchantDto.representativeEmail } as any,
        {
          transaction: t,
        },
      );

      // Tạo địa chỉ
      const address = await this.addressService.create(
        createMerchantDto.ownerId,
        createMerchantDto.temporaryAddress,
      );

      let addressId = address.id;

      // Tạo merchant
      const merchant = await this.merchantModel.create({
        ...createMerchantDto,
        addressId,
      } as any);

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

      await t.commit();

      // Trả về merchant kèm ảnh
      const createdMerchant = await this.merchantModel.findByPk(merchant.id, {
        include: [MerchantImage],
      });

      if (!createdMerchant)
        throw new Error('Merchant not found after creation');

      return createdMerchant;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async approveMerchant(
    merchantId: number,
    approveMerchantDto: ApproveMerchantDto,
  ) {
    try {
      const merchant = await this.merchantModel.findByPk(merchantId);

      if (!merchant) {
        throw new NotFoundException('Merchant not found');
      }

      if (approveMerchantDto.status === 'APPROVE') {
        await this.merchantModel.update(
          { status: MerchantStatus.APPROVE },
          { where: { id: merchant.id } },
        );
      } else {
        await this.merchantModel.update(
          { status: MerchantStatus.REJECT },
          { where: { id: merchant.id } },
        );
      }

      const isApproved = approveMerchantDto.status === 'APPROVE';
      const context = {
        userEmail: merchant.representativeEmail,
        appName: 'FastFood Delivery',
        isApproved,
        onboardingLink: isApproved
          ? `${process.env.REACT_URL}/register`
          : undefined,
        currentYear: new Date().getFullYear(),
        companyAddress: '123 Đường A, Quận B, TP.HCM',
        companyPhone: '0123 456 789',
        supportEmail: 'support@fastfood.com',
      };

      await this.mailerService.sendMail({
        to: merchant.representativeEmail,
        subject: 'Thông báo kết quả hợp tác',
        template: './reply-merchant',
        context,
      });

      return merchant;
    } catch (error) {
      throw error;
    }
  }

  async findOne(merchantId: number) {
    const merchant = await this.merchantModel.findByPk(merchantId, {
      attributes: ['id', 'name'],
      include: [
        {
          model: this.addressModel,
          attributes: ['street', 'location'],
          required: false,
        },
        {
          model: this.merchantImageModel,
          where: { type: 'BACKGROUND' },
          attributes: ['url'],
          required: false,
        },
      ],
    });
    return merchant;
  }

  async findAll() {
    const merchant = await this.merchantModel.findAll({
      attributes: ['id', 'name', 'description'],
      include: [
        {
          model: this.addressModel,
          attributes: ['street', 'location'],
          required: false,
        },
        {
          model: this.merchantImageModel,
          where: { type: 'BACKGROUND' },
          attributes: ['url'],
          required: false,
        },
      ],
    });
    return merchant;
  }

  async findNearby(lat: number, lng: number, radiusKm = 5) {
    // Chuyển radius sang mét vì PostGIS ST_DWithin sử dụng mét
    const radiusMeters = radiusKm * 1000;

    const merchants = await this.merchantModel.findAll({
      include: [
        {
          model: Address,
          required: true,
        },
        {
          model: MerchantImage,
          required: false,
          where: { type: 'BACKGROUND' }, // chỉ lấy ảnh nền
        },
      ],
      where: this.sequelize.literal(`
        ST_DWithin(
          "address"."location",
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
      `),
      attributes: {
        include: [
          [
            this.sequelize.literal(`
              ST_Distance(
                "address"."location",
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
              )
            `),
            'distance',
          ],
        ],
      },
    });

    return merchants;
  }

  async updateMerchant(
    merchantId: number,
    userId: number,
    updateMerchantDto: UpdateMerchantDto,
    filesByType?: Record<string, Express.Multer.File[]>,
  ) {
    try {
      const merchant = await this.merchantModel.findOne({
        where: { id: merchantId, ownerId: userId },
      });

      if (!merchant) throw new Error('Merchant not found');
      await merchant.update(updateMerchantDto as any);

      if (filesByType) {
        for (const typeKey of Object.keys(filesByType)) {
          const type = typeKey.toUpperCase() as MerchantImageType;
          const files = filesByType[typeKey];

          // Chỉ update AVATAR + BACKGROUND
          if (!['AVATAR', 'BACKGROUND'].includes(type)) continue;

          // Xóa ảnh cũ cùng type
          const oldImages = await this.merchantImageModel.findAll({
            where: { merchantId, type },
          });

          for (const old of oldImages) {
            if (old.url) await this.cloudinaryService.deleteImageByUrl(old.url);
            await old.destroy();
          }

          // Upload ảnh mới
          for (const file of files) {
            const url = await this.cloudinaryService.uploadImage(
              file,
              'merchants',
            );
            await this.merchantImageModel.create({
              merchantId,
              url,
              type,
            } as any);
          }
        }
      }

      return this.merchantModel.findByPk(merchantId, {
        include: [MerchantImage],
      });
    } catch (error) {
      throw new error();
    }
  }
}
