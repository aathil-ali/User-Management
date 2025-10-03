import { IAuthTranslationKeys } from './IAuthTranslationKeys';
import { IServerTranslationKeys } from './IServerTranslationKeys';
import { IValidationTranslationKeys } from './IValidationTranslationKeys';
import { IErrorTranslationKeys } from './IErrorTranslationKeys';
import { IUserTranslationKeys } from './IUserTranslationKeys';
import { IAuthorizationTranslationKeys } from './IAuthorizationTranslationKeys';
import { IDatabaseTranslationKeys } from './IDatabaseTranslationKeys';
import { IAuditTranslationKeys } from './IAuditTranslationKeys';

export interface ITranslationKeys {
  auth: IAuthTranslationKeys;
  server: IServerTranslationKeys;
  validation: IValidationTranslationKeys;
  errors: IErrorTranslationKeys;
  user: IUserTranslationKeys;
  authorization: IAuthorizationTranslationKeys;
  database: IDatabaseTranslationKeys;
  audit: IAuditTranslationKeys;
}