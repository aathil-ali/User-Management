import { LocalizedRequest } from '@/middleware/LanguageMiddleware';
import { RequestWithContext } from '@/middleware/RequestContextMiddleware';

export type EnhancedRequest = LocalizedRequest & RequestWithContext;
