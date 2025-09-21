export class AuthConfig {
  static getJwtSecret(): string {
    return process.env.JWT_SECRET || 'your-fallback-secret-key';
  }

  static getJwtRefreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET || 'your-fallback-refresh-secret-key';
  }

  static getJwtExpiry(): string {
    return process.env.JWT_EXPIRE || '1h';
  }

  static getJwtRefreshExpiry(): string {
    return process.env.JWT_REFRESH_EXPIRE || '7d';
  }

  static getBcryptRounds(): number {
    return parseInt(process.env.BCRYPT_ROUNDS || '12');
  }
}
