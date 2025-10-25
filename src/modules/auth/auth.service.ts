import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { isOtpExpired } from 'src/common/helpers/functions';
import { User } from 'src/models';
import { UserService } from '../user/user.service';
import { VerifyOtpDTO } from './dto/verifyOTP.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async validateUser(email: string, password: string) {
    return await this.userService.validateUser(email, password);
  }

  async login({ id, email, role }) {
    const accessToken = await this.jwtService.signAsync({
      id: id,
      email: email,
      role: role,
    });
    return {
      message: 'Login successfully',
      data: { accessToken: accessToken },
    };
  }

  async verifyOtp(verifyOtpDTO: VerifyOtpDTO) {
    const { email, otp } = verifyOtpDTO;
    console.log(email, otp);
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.code_id !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (isOtpExpired(user.code_expired)) {
      throw new BadRequestException('OTP expired');
    }

    await this.userModel.update({ isActive: true }, { where: { email } });

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }
}
