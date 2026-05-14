import dotenv from "dotenv";

dotenv.config({ path: `${process.cwd()}/.env.development` });

export const env = {
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT),
  POSTGRES_CLIENT: process.env.POSTGRES_CLIENT,
};
