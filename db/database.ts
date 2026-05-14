import type { Knex } from "knex";
import setupKnex from "knex";
import { env } from "../src/env/env.ts";

export const config: Knex.Config = {
  client: env.POSTGRES_CLIENT ?? "pg",
  connection: {
    host: env.POSTGRES_HOST ?? "localhost",
    port: env.POSTGRES_PORT ?? 5432,
    user: env.POSTGRES_USER ?? "local_user",
    database: env.POSTGRES_DB ?? "local_db",
    password: env.POSTGRES_PASSWORD ?? "local_password",
  },
  migrations: {
    directory: "migrations/",
  },
};

export const knex = setupKnex(config);

export default config;
