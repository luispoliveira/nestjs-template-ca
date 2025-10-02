export interface EnvConfig {
  getAppPort(): number;
  getDatabaseUrl(): string;
  getLogPrismaQueries(): boolean;
  getNodeEnv(): string;
  getJwtSecret(): string;
  getJwtExpiresInSeconds(): number;
}
