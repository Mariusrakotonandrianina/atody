import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google')) // Redirige l'utilisateur vers Google pour s'authentifier
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google')) // Reçoit le callback après l'authentification
  googleAuthRedirect() {
    return { message: 'Authentification réussie avec Google' };
  }
}
