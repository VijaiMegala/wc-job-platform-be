import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../users/user.service';
import { CreateUserWithOrgDto } from '../organization/dto/create-user-with-org.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserWithOrgDto) {
    const user = await this.userService.createUserWithOrg(createUserDto);
    const { user_password, ...result } = user;
    return result;
  }
}

