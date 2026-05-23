import { test, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { app } from "../../src/app.ts";
import request from "supertest";
import { knex } from "../../db/database.ts";

beforeAll(async () => {
  await app.ready();
  await knex.migrate.latest();
});

beforeEach(async () => {
  await knex("meals").delete();
  await knex("sessions").delete();
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

test("POST /users/login should return session cookie", async () => {
  await request(app.server).post("/users").send({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const response = await request(app.server).post("/users/login").send({
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const cookies = response.get("Set-Cookie");

  expect(response.status).toBe(200);
  expect(cookies).toBeDefined();
  expect(cookies?.[0]).toContain("session_id");
});

test("POST /users/login should not login with wrong password", async () => {
  await request(app.server).post("/users").send({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const response = await request(app.server).post("/users/login").send({
    email: "marcel@email.com",
    password: "senhaErrada",
  });

  expect(response.status).toBe(401);
  expect(response.get("Set-Cookie")).toBeUndefined();
});

test("POST /users/login should not login with non-existing email", async () => {
  const response = await request(app.server).post("/users/login").send({
    email: "naoexiste@email.com",
    password: "senhaBolada",
  });

  expect(response.status).toBe(401);
  expect(response.get("Set-Cookie")).toBeUndefined();
});
