import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  async sendOtpEmail(to: string, otp: string) {
    const API_KEY = this.config.get('MAILERSEND_API_KEY');

    const body = {
      from: { email: this.config.get('MAIL_FROM') },
      to: [{ email: to }],
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    };

    await axios.post('https://api.mailersend.com/v1/email', body, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
