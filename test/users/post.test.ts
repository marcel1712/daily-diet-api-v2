import { expect, test, beforeAll, afterAll } from "vitest";
import { app } from "../../src/app.ts";
import request from "supertest";
import { knex } from "../../db/database.ts";

beforeAll(async () => {
  await knex("users").delete();
  await app.ready();
  await knex.migrate.latest();
});

afterAll(async () => {
  await app.close();
});

test("POST /users returns", async () => {
  const response = await request(app.server)
    .post("/users")
    .send({
      username: "marcelhrb",
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  const responseBody = await response.body;

  expect(response.status).toBe(200);
  expect(responseBody).toEqual({
    username: "marcelhrb",
    email: "marcel@email.com",
    user_id: responseBody.user_id,
  });
});
