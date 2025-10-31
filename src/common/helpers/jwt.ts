import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export function extractUserIdFromRequest(
  req: Request,
  jwtService: JwtService,
  configService: ConfigService,
): number {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new BadRequestException('Thiếu token đăng nhập!');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwtService.verify(token, {
      secret: configService.get<string>('JWT_SECRET'),
    }) as any;

    if (!decoded?.id) {
      throw new BadRequestException('Token không hợp lệ hoặc thiếu userId!');
    }

    return decoded.id;
  } catch (error) {
    throw new BadRequestException('Token không hợp lệ hoặc hết hạn!');
  }
}
