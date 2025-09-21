import { Response, NextFunction } from 'express';
import { BaseController, EnhancedRequest } from './BaseController';
import { IUserService } from '@/interfaces/IUserService';

export class AdminController extends BaseController {
  constructor(private userService: IUserService) {
    super();
  }

  async getAllUsers(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req, res, t) => {
      const { page = 1, limit = 10 } = req.query;
      const userList = await this.userService.getAllUsers(Number(page), Number(limit));
      
      this.sendPaginatedSuccess(
        res, 
        userList.users, 
        { 
          page: userList.page, 
          limit: userList.limit, 
          total: userList.total 
        }, 
        t.user('users_retrieved'), 
        req
      );
    });
  }

  async getUserById(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req, res, t) => {
      const user = await this.userService.getUserById(req.params.id);
      this.sendSuccess(res, user, t.user('users_retrieved'), req);
    });
  }
}
