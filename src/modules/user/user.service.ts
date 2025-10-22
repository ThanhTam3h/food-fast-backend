import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';

import { Sequelize } from 'sequelize-typescript';
import { Role, User, UserRole } from 'src/models';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Role) private readonly roleModel: typeof Role,
    @InjectModel(UserRole) private readonly userRoleModel: typeof UserRole,
    private readonly sequelize: Sequelize,
  ) {}

  async findByEmail(email: string) {
    return await this.userModel.findOne({ where: { email }, raw: true });
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
    console.log(alreadyExist);

    if (!alreadyExist) {
      throw new BadRequestException('Account is not registerd');
    }

    const isCorrectPassword = bcrypt.compareSync(
      password,
      alreadyExist.password,
    );

    if (!isCorrectPassword) {
      throw new BadRequestException('Password is incorrect');
    }

    const isCustomerRole = await this.userRoleModel.findOne({
      where: { userId: alreadyExist.id },
      include: [
        {
          model: this.roleModel,
          where: { name: 'customer' },
          attributes: ['name'],
          required: true,
        },
      ],
    });

    if (!isCustomerRole) {
      throw new BadRequestException('Role is incorrect');
    }

    return {
      id: alreadyExist.id,
      email: alreadyExist.email,
      role: isCustomerRole.role.name,
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

      const user = await this.userModel.create(
        {
          email,
          password: hashPassword,
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

      return { message: 'Register successfully' };
    } catch (error) {
      await t.rollback();
    }
  }
}
