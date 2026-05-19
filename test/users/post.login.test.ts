import { test, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { app } from "../../src/app.ts";
import request from "supertest";
import { knex } from "../../db/database.ts";

beforeAll(async () => {
  await app.ready();
  await knex.migrate.latest();
});

beforeEach(async () => {
  await knex("users").delete();
});

afterAll(async () => {
  await app.close();
});

test("POST /users/login returns cookie", async () => {
  // 1. cria o usuário
  await request(app.server).post("/users").send({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  // 2. faz login
  const response = await request(app.server).post("/users/login").send({
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  expect(response.status).toBe(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
