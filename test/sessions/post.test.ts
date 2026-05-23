import { test, beforeAll, afterAll, expect, beforeEach } from "vitest";
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

test("POST /sessions should create a session and return user data with cookie", async () => {
  const requestCreatedUser = await request(app.server)
    .post("/users")
    .send({
      username: "marcelhrb",
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  const createdUser = requestCreatedUser.body;

  const responseSession = await request(app.server)
    .post("/sessions")
    .send({
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  const cookies = responseSession.get("Set-Cookie");

  expect(responseSession.status).toBe(200);

  expect(responseSession.body).toEqual({
    user_id: createdUser.user_id,
    email: "marcel@email.com",
    username: "marcelhrb",
  });

  expect(cookies).toBeDefined();
  expect(cookies?.[0]).toContain("session_id");

  const sessionOnDatabase = await knex("sessions")
    .where({
      user_id: createdUser.user_id,
    })
    .first();

  expect(sessionOnDatabase).toEqual(
    expect.objectContaining({
      user_id: createdUser.user_id,
    }),
  );
});

test("POST /sessions should not create session with wrong password", async () => {
  await request(app.server).post("/users").send({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const response = await request(app.server).post("/sessions").send({
    email: "marcel@email.com",
    password: "senhaErrada",
  });

  expect(response.status).toBe(401);
  expect(response.get("Set-Cookie")).toBeUndefined();
});

test("POST /sessions should not create session with non-existing email", async () => {
  const response = await request(app.server).post("/sessions").send({
    email: "naoexiste@email.com",
    password: "senhaBolada",
  });

  expect(response.status).toBe(401);
  expect(response.get("Set-Cookie")).toBeUndefined();
});
