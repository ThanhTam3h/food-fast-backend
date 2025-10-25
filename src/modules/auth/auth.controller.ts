import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/global-guard';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { VerifyOtpDTO } from './dto/verifyOTP.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiBody({ type: LoginDTO })
  async login(@Req() req: any) {
    return await this.authService.login(req.user);
  }

  @Public()
  @Post('/verify-otp')
  @ApiBody({ type: VerifyOtpDTO })
  async verifyOtp(@Body() verifyOtpDTO: VerifyOtpDTO) {
    return await this.authService.verifyOtp(verifyOtpDTO);
  }
}
