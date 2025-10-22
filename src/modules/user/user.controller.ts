import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/common/decorators/global-guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Public()
  @Post('register')
  async register(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.register(createUserDTO);
  }

  @Public()
  @Get('/')
  async findAllUsers() {
    return this.userService.findAllUsers();
  }
}
