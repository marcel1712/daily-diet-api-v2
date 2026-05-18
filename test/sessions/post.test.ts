import { test, beforeAll, afterAll, expect, beforeEach } from "vitest";
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

test("POST /sessions returns", async () => {
  const requestCreatedUser = await request(app.server)
    .post("/users")
    .send({
      username: "marcelhrb",
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  const createdUser = requestCreatedUser.body;

  const response = await request(app.server)
    .post("/sessions")
    .send({
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  const responseBody = response.body;

  expect(response.status).toBe(200);
  expect(responseBody).toEqual({
    user_id: createdUser.user_id,
    email: createdUser.email,
    username: createdUser.username,
  });
});
