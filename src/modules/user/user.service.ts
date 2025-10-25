import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';

import { MailerService } from '@nestjs-modules/mailer';
import { Sequelize } from 'sequelize-typescript';
import { createOtpExpiry, generateOtp } from 'src/common/helpers/functions';
import { Role, User, UserRole } from 'src/models';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Role) private readonly roleModel: typeof Role,
    @InjectModel(UserRole) private readonly userRoleModel: typeof UserRole,
    private readonly sequelize: Sequelize,
    private readonly mailerService: MailerService,
  ) {}

  async findByEmail(email: string) {
    return await this.userModel.findOne({ where: { email }, raw: true });
  }

  async findById(id: number) {
    return this.userModel.findByPk(id);
  }

  async findAllUsers() {
    return await this.userModel.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: this.roleModel,
          through: { attributes: [] },
          attributes: ['name'],
        },
      ],
    });
  }

  async validateUser(email: string, password: string) {
    const alreadyExist = await this.findByEmail(email);

    if (!alreadyExist) {
      throw new BadRequestException('Account is not registerd');
    }

    if (alreadyExist.isActive === false) {
      throw new BadRequestException('Account is unactive');
    }

    const isCorrectPassword = bcrypt.compareSync(
      password,
      alreadyExist.password,
    );

    if (!isCorrectPassword) {
      throw new BadRequestException('Password is incorrect');
    }

    const checkRole = await this.userRoleModel.findOne({
      where: { userId: alreadyExist.id },
      include: [
        {
          model: this.roleModel,
          attributes: ['name'],
          required: true,
        },
      ],
    });

    if (!checkRole) {
      throw new BadRequestException('Role is not exist');
    }

    return {
      id: alreadyExist.id,
      email: alreadyExist.email,
      role: checkRole.role.name,
    };
  }

  async register(createUserDTO: CreateUserDTO) {
    const t = await this.sequelize.transaction();

    try {
      const { email, password, role } = createUserDTO;
      const alreadyExist = await this.findByEmail(email);
      if (alreadyExist) {
        throw new BadRequestException('Email is already registerd');
      }

      const salt = await bcrypt.genSalt();
      const hashPassword = bcrypt.hashSync(password, salt);

      const code_id = generateOtp();
      const code_expired = createOtpExpiry();

      const user = await this.userModel.create(
        {
          email,
          password: hashPassword,
          code_id,
          code_expired,
        } as any,
        { transaction: t },
      );

      const customerRole = await this.roleModel.findOne({
        where: { name: role },
      });

      if (!customerRole)
        throw new BadRequestException('Role "customer" not found');

      await this.userRoleModel.create(
        {
          userId: user.id,
          roleId: customerRole.id,
        } as any,
        { transaction: t },
      );

      await t.commit();

      await this.mailerService.sendMail({
        to: email,
        subject: 'Xác minh tài khoản của bạn',
        template: './verify-otp', // tương ứng verify-otp.hbs
        context: {
          appName: 'Fastfood delivery',
          userEmail: email,
          otpCode: user.code_id,
          expiryTime: user.code_expired,
          supportEmail: 'support@naomieats.com',
          companyAddress: '123 Nguyễn Trãi, TP.HCM',
          companyPhone: '0123 456 789',
          currentYear: new Date().getFullYear(),
        },
      });

      return {
        message: `OTP sent to ${user.email}`,
      };
    } catch (error) {
      await t.rollback();
    }
  }

  async updateUser(id: number, updateUserDTO: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    await this.userModel.update(updateUserDTO, { where: { id } });

    const updatedUser = await this.findById(id);

    return {
      success: true,
      message: 'Update user successfully',
      data: updatedUser,
    };
  }
}
