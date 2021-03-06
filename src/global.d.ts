export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production" | "test";
      readonly PORT?: string;
      readonly DB_USERNAME: string;
      readonly DB_PASSWORD: string;
      readonly DB_NAME: string;
      readonly DB_PORT: string;
      readonly DEV_DB_FILL?: string;
      readonly DEV_DB_DROP?: string;
      readonly DB_HOST: string;
      readonly API_TEST_TOKEN?: string;
      readonly DEFAULT_PASSWORD: string;
      readonly SECRET: string;
      readonly MYSQL: string;
    }
  }

  namespace Express {
    interface Request {}
  }
}

declare module "winston" {
  interface LeveledLogMethod {
    (
      message: string,
      meta: { service: "api" | "db" | "server"; payload?: any }
    ): void;
  }
}

declare module "sequelize" {
  interface Hookable extends HookContext {}
}
