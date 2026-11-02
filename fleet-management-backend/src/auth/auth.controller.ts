import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.authService.login(user);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('Login error:', error);
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  @Public()
  @Post('register')
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      name: string;
      role: 'owner' | 'member';
      username: string;
    },
  ) {
    try {
      if (
        !registerDto.email ||
        !registerDto.password ||
        !registerDto.name ||
        !registerDto.role ||
        !registerDto.username
      ) {
        throw new BadRequestException('All fields are required');
      }
      return this.authService.register(
        registerDto.email,
        registerDto.password,
        registerDto.name,
        registerDto.role,
        registerDto.username,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new InternalServerErrorException(
        'An error occurred during registration',
      );
    }
  }

  @Public()
  @Post('register-admin')
  async registerAdmin(
    @Body()
    registerAdminDto: {
      email: string;
      password: string;
      name: string;
      username: string;
    },
  ) {
    try {
      if (
        !registerAdminDto.email ||
        !registerAdminDto.password ||
        !registerAdminDto.name ||
        !registerAdminDto.username
      ) {
        throw new BadRequestException('All fields are required');
      }
      return this.authService.registerAdmin(
        registerAdminDto.email,
        registerAdminDto.password,
        registerAdminDto.name,
        registerAdminDto.username,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Admin registration error:', error);
      throw new InternalServerErrorException(
        'An error occurred during admin registration',
      );
    }
  }
}
