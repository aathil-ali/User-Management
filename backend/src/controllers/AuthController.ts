import { Response, NextFunction } from 'express';
import { BaseController, EnhancedRequest } from './BaseController';
import { IAuthService } from '@/interfaces/IAuthService';
import { RegisterDto } from '@/dto/auth/RegisterDto';
import { LoginDto } from '@/dto/auth/LoginDto';
import { LogoutDto } from '@/dto/auth/LogoutDto';

export class AuthController extends BaseController {
  constructor(private authService: IAuthService) {
    super();
  }

  async register(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req, res, t) => {
      const result = await this.authService.register(req.body);
      this.sendSuccess(res, result, t.auth('registration_success'), req, 201);
    });
  }

  async login(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req, res, t) => {
      const result = await this.authService.login(req.body);
      this.sendSuccess(res, result, t.auth('login_success'), req);
    });
  }

  async refreshToken(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req, res, t) => {
      const result = await this.authService.refreshToken(req.body.refreshToken);
      this.sendSuccess(res, result, t.auth('token_refresh_success'), req);
    });
  }

  async logout(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req, res, t) => {
      // req.body is already validated by ValidationMiddleware and transformed to LogoutDto
      const logoutData = req.body as LogoutDto;
      
      // Call the logout service with validated userId
      await this.authService.logout(logoutData.userId);
      this.sendSuccess(res, null, t.auth('logout_success'), req);
    });
  }
}
