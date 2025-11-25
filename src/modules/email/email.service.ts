import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async sendMail({ to, subject, html }) {
    const apiKey = this.config.get('MAILERSEND_API_KEY');

    return await firstValueFrom(
      this.httpService.post(
        'https://api.mailersend.com/v1/email',
        {
          from: { email: this.config.get('MAIL_FROM') },
          to: [{ email: to }],
          subject,
          html,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  }

  // ⭐⭐ HÀM NÀY để AuthService dùng resend OTP
  async sendOtpEmail(to: string, otp: string) {
    const html = `
      <h2>Mã OTP xác thực</h2>
      <p>Mã của bạn: <b>${otp}</b></p>
      <p>OTP có hiệu lực trong 5 phút.</p>
    `;

    return this.sendMail({
      to,
      subject: 'Mã OTP xác minh tài khoản',
      html,
    });
  }
}
