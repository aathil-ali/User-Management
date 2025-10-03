import { Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { IUserService } from '@/interfaces/IUserService';
import { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';

export class UserController extends BaseController {
  constructor(private userService: IUserService) {
    super();
  }

  async getProfile(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req: any, res, t) => {
      const userId = req.user.id;
      const profile = await this.userService.getProfile(userId);
      this.sendSuccess(res, profile, t.user('profile_retrieved'), req);
    });
  }

  async updateProfile(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req: any, res, t) => {
      const userId = req.user.id;
      const updateData = req.body as UpdateProfileDto;
      const updatedProfile = await this.userService.updateProfile(userId, updateData);
      this.sendSuccess(res, updatedProfile, t.user('profile_updated'), req);
    });
  }

  async deleteAccount(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req: any, res, t) => {
      const userId = req.user.id;
      await this.userService.deleteAccount(userId);
      this.sendSuccess(res, null, t.user('account_deleted'), req);
    });
  }
}
