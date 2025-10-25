import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/global-guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  @Public()
  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.userService.findById(id);
  }
  @Public()
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDTO: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDTO);
  }
}
