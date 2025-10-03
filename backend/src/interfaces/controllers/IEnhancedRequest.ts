import { ILocalizedRequest } from '../middleware/ILocalizedRequest';
import { IRequestWithContext } from '../middleware/IRequestWithContext';
import { IAuthenticatedRequest } from '../middleware/IAuthenticatedRequest';

/**
 * Combined request type for convenience (unauthenticated)
 */
export type IEnhancedRequest = ILocalizedRequest & IRequestWithContext;

/**
 * Authenticated enhanced request type
 */
export type IAuthenticatedEnhancedRequest = IAuthenticatedRequest & IRequestWithContext;
