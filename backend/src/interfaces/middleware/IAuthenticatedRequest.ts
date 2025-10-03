import { LocalizedRequest } from '@/middleware/LanguageMiddleware';

export interface IAuthenticatedRequest extends LocalizedRequest {
  user: {  // Required, not optional - follows LSP properly
    id: string;
    email: string;
    role: string;
  };
}
