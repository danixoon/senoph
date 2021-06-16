export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT: string;

      JWT_SECRET: string;

      MONGO_URI: string;
      TEST_MONGO_URI: string;

      CHAT_TOKENS: string;
      ANON_CHAT_HOST: string;
    }
  }
}
