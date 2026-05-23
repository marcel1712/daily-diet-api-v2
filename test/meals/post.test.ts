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

test("POST /meals returns", async () => {
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

  const responseBody = responseSession.body;

  expect(responseSession.status).toBe(200);
  expect(responseBody).toEqual({
    user_id: createdUser.user_id,
    email: createdUser.email,
    username: createdUser.username,
  });

  const cookies = responseSession.get("Set-Cookie");

  expect(cookies).toBeDefined();

  const responseMeal = await request(app.server)
    .post("/meals")
    .set("Cookie", cookies!)
    .send({
      name: "Frango com arroz",
      description: "Almoço pós-treino",
      date: new Date().toISOString(),
      is_on_diet: true,
    });

  const responseMealBody = responseMeal.body;

  expect(responseMealBody).toEqual({
    meal_id: responseMealBody.meal_id,
    name: "Frango com arroz",
    description: "Almoço pós-treino",
    date: expect.any(String),
    is_on_diet: true,
  });
});

test("POST /meals should not create a meal without authentication", async () => {
  const responseMeal = await request(app.server).post("/meals").send({
    name: "Frango com arroz",
    description: "Almoço pós-treino",
    date: "2026-05-22T12:00:00.000Z",
    is_on_diet: true,
  });

  expect(responseMeal.status).toBe(401);
});
