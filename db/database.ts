import type { Knex } from "knex";
import setupKnex from "knex";
import { env } from "../src/env/env.ts";

export const config: Knex.Config = {
  client: env.POSTGRES_CLIENT ?? "pg",
  connection: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    database: env.POSTGRES_DB,
    password: env.POSTGRES_PASSWORD,
  },
  migrations: {
    directory: "migrations/",
  },
};

export const knex = await setupKnex(config);

export default config;
