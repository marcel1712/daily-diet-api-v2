import Fastify from "fastify";
import { knex } from "../db/database.ts";
import { userRoutes } from "./users/users.routes.ts";
import { sessionsRoutes } from "./users/sessions.routes.ts";
import cookie, { type FastifyCookieOptions } from "@fastify/cookie";
import { env } from "./env/env.ts";

export const app = Fastify();

const message = "VAI CORINTHIANS!!";
app.get("/", async function handler() {
  return message;
});

app.register(cookie, {
  secret: env.COOKIE_SECRET,
} as FastifyCookieOptions)

app.register(userRoutes, { prefix: "users" });
app.register(sessionsRoutes, { prefix: "sessions"})

app.get("/status", async () => {
  const maxConnections = (await knex.raw("SHOW max_connections;")).rows[0]
    .max_connections;

  const opendConnection = await knex("pg_stat_activity")
    .count("*")
    .where("datname", process.env.POSTGRES_DB)
    .first();

  return {
    Max_connections: maxConnections,
    Opned_connection: opendConnection?.count,
  };
});
