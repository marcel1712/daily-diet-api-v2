import { expect, test, beforeAll, afterAll } from "vitest";
import { app } from "../../src/app.ts";
import request from "supertest";

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test("POST /users returns", async () => {
  const response = await request(app.server)
    .post("/users")
    .send({
      username: "Marcel Henrique Rodrigues Batista",
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  const responseBody = await response.body;

  expect(response.status).toBe(200);
  expect(responseBody).toEqual({
    username: "Marcel Henrique Rodrigues Batista",
    email: "marcel@email.com",
    password: "senhaBolada",
  });
});
