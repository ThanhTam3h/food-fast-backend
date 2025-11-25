import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailService {
  async sendMail({ to, subject, html }) {
    const API_KEY = process.env.MAILERSEND_API_KEY;

    return await axios.post(
      'https://api.mailersend.com/v1/email',
      {
        from: { email: process.env.MAIL_FROM },
        to: [{ email: to }],
        subject,
        html,
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
