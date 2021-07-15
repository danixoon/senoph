export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production" | "test";
      readonly PORT: string;
      readonly DB_USERNAME: string;
      readonly DB_PASSWORD: string;
      readonly DB_NAME: string;
      readonly DB_PORT: string;
      readonly DB_HOST: string;
      readonly API_TEST_TOKEN: string;

      readonly SECRET: string;
    }
  }

  namespace Express {
    interface Request {}
  }
}
