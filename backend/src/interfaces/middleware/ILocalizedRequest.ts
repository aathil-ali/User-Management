import { Request } from 'express';
import { TranslationService } from '@/services/TranslationService';
import { IRequestContext } from './IRequestContext';

/**
 * Localized request with language and translation service
 */
export interface ILocalizedRequest extends Request {
  language?: string;
  t?: TranslationService;
  context?: IRequestContext;
}
