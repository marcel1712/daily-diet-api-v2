import { expect, test, beforeAll, afterAll, beforeEach } from "vitest";
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

test("POST /users should create a user", async () => {
  const response = await request(app.server)
    .post("/users")
    .send({
      username: "marcelhrb",
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    username: "marcelhrb",
    email: "marcel@email.com",
    user_id: expect.any(String),
  });
});
