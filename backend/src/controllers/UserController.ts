import { Response, NextFunction } from 'express';
import { BaseController, EnhancedRequest } from './BaseController';
import { IUserService } from '@/interfaces/IUserService';
import { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';

export class UserController extends BaseController {
  constructor(private userService: IUserService) {
    super();
  }

  async getProfile(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req: any, res, t) => {
      const userId = req.user.id; // From authentication middleware
      const profile = await this.userService.getProfile(userId);
      this.sendSuccess(res, profile, t.user('profile_retrieved'), req);
    });
  }

  async updateProfile(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req: any, res, t) => {
      const userId = req.user.id; // From authentication middleware
      const updateData: UpdateProfileDto = req.body; // Should be validated by middleware
      const updatedProfile = await this.userService.updateProfile(userId, updateData);
      this.sendSuccess(res, updatedProfile, t.user('profile_updated'), req);
    });
  }

  async deleteAccount(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req: any, res, t) => {
      const userId = req.user.id; // From authentication middleware
      
      // Note: For enhanced security, you could add password confirmation here:
      // if (req.body.confirmPassword) {
      //   // Verify the password before deletion
      //   // const isValidPassword = await this.authService.verifyPassword(userId, req.body.confirmPassword);
      //   // if (!isValidPassword) throw validation error
      // }
      
      await this.userService.deleteAccount(userId);
      this.sendSuccess(res, null, t.user('account_deleted'), req);
    });
  }
}
