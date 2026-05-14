import type { Knex } from "knex";

export const config: Knex.Config = {
  client: process.env.POSTGRES_CLIENT ?? "pg",
  connection: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? "local_user",
    database: process.env.POSTGRES_DB ?? "local_db",
    password: process.env.PASSWORD ?? "local_password",
  },
  migrations: {
    directory: "migrations/",
  },
};

export default config;
