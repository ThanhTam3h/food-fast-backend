import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { createOtpExpiry, generateOtp, isOtpExpired } from 'src/common/helpers/functions';
import { Merchant, User } from 'src/models';
import { UserService } from '../user/user.service';
import { VerifyOtpDTO } from './dto/verifyOTP.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
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
      data: {
        accessToken: accessToken,
        user: { id: id, email: email, role: role },
      },
    };
  }

  async verifyOtp(verifyOtpDTO: VerifyOtpDTO) {
    const { email, otp } = verifyOtpDTO;
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

  async resendOtp(email: string) {
    // Kiểm tra user tồn tại
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Nếu user đã active rồi thì không cần resend
    if (user.isActive) {
      throw new BadRequestException('User is already active');
    }

    // Tạo OTP mới + thời hạn mới
    const newOtp = generateOtp();
    const newExpiry = createOtpExpiry();

    // Cập nhật user
    await this.userModel.update(
      { code_id: newOtp, code_expired: newExpiry },
      { where: { email } },
    );

    // Gửi email OTP mới
    await this.mailerService.sendMail({
      to: email,
      subject: 'Resend OTP - Xác minh tài khoản của bạn',
      template: './verify-otp',
      context: {
        appName: 'Fastfood delivery',
        userEmail: email,
        otpCode: newOtp,
        expiryTime: newExpiry,
        supportEmail: 'support@naomieats.com',
        companyAddress: '123 Nguyễn Trãi, TP.HCM',
        companyPhone: '0123 456 789',
        currentYear: new Date().getFullYear(),
      },
    });

    return {
      success: true,
      message: `OTP has been resent to ${email}`,
    };
  }
}
