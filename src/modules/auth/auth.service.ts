import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    console.log('AuthService.validateUser called with email:', email);
    return await this.userService.validateUser(email, password);
  }

  async login({ id, email, role }) {
    console.log('AuthService.login called with user:', { id, email, role });
    const accessToken = await this.jwtService.signAsync({
      id: id,
      email: email,
      role: role
    });
    return {
      message: 'Login successfully',
      data: { accessToken: accessToken },
    };
  }
}
