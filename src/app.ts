import dotenv from "dotenv";
import Fastify from "fastify";
import { knex } from "../db/database.ts";

export const app = Fastify();

const message = "VAI CORINTHIANS!!";
app.get("/", async function handler(request, reply) {
  return message;
});

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
