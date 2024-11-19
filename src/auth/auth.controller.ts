import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ILoginResponse } from './interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ILoginResponse> {
    const response = await this.authService.login(loginDto.email_dependencia, loginDto.password);
    return {
      access_token: response.access_token,
      dependencia: loginDto.email_dependencia
    };
  }
}
