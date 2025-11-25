import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailService {
  async sendOtpEmail(to: string, otp: string) {
    const API_KEY = process.env.MAILERSEND_API_KEY;
    const FROM = process.env.MAIL_FROM;

    await axios.post(
      'https://api.mailersend.com/v1/email',
      {
        from: { email: FROM },
        to: [{ email: to }],
        subject: 'Your OTP Code',
        html: `<p>Your OTP code is: <b>${otp}</b></p>`,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}