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
test("GET /meals/:id should return a specific meal from authenticated user", async () => {
  const requestCreatedUser = await request(app.server)
    .post("/users")
    .send({
      username: "marcelhrb",
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  expect(requestCreatedUser.status).toBe(200);

  const responseSession = await request(app.server)
    .post("/sessions")
    .send({
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  expect(responseSession.status).toBe(200);

  const cookies = responseSession.get("Set-Cookie");

  expect(cookies).toBeDefined();

  const createdMealRequest = await request(app.server)
    .post("/meals")
    .set("Cookie", cookies!)
    .send({
      name: "Frango com arroz",
      description: "Almoço pós-treino",
      date: "2026-05-22T12:00:00.000Z",
      is_on_diet: true,
    });

  expect(createdMealRequest.status).toBe(200);

  const createdMeal = createdMealRequest.body;

  const getMealRequest = await request(app.server)
    .get(`/meals/${createdMeal.meal_id}`)
    .set("Cookie", cookies!);

  expect(getMealRequest.status).toBe(200);
  expect(getMealRequest.body).toEqual({
    meal_id: createdMeal.meal_id,
    name: "Frango com arroz",
    description: "Almoço pós-treino",
    date: expect.any(String),
    is_on_diet: true,
  });
});

test("GET /meals should return all meals from authenticated user", async () => {
  const requestCreatedUser = await request(app.server).post("/users").send({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  expect(requestCreatedUser.status).toBe(200);

  const responseSession = await request(app.server).post("/sessions").send({
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  expect(responseSession.status).toBe(200);

  const cookies = responseSession.get("Set-Cookie");

  expect(cookies).toBeDefined();

  const firstMealResponse = await request(app.server)
    .post("/meals")
    .set("Cookie", cookies!)
    .send({
      name: "Frango com arroz",
      description: "Almoço pós-treino",
      date: "2026-05-22T12:00:00.000Z",
      is_on_diet: true,
    });

  expect(firstMealResponse.status).toBe(200);

  const secondMealResponse = await request(app.server)
    .post("/meals")
    .set("Cookie", cookies!)
    .send({
      name: "Pizza",
      description: "Jantar",
      date: "2026-05-22T20:00:00.000Z",
      is_on_diet: false,
    });

  expect(secondMealResponse.status).toBe(200);

  const response = await request(app.server)
    .get("/meals")
    .set("Cookie", cookies!);

  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(2);

  expect(response.body).toEqual([
    {
      meal_id: expect.any(String),
      name: "Frango com arroz",
      description: "Almoço pós-treino",
      date: expect.any(String),
      is_on_diet: true,
    },
    {
      meal_id: expect.any(String),
      name: "Pizza",
      description: "Jantar",
      date: expect.any(String),
      is_on_diet: false,
    },
  ]);
});

test("GET /meals should not return meals without authentication", async () => {
  const response = await request(app.server).get("/meals");

  expect(response.status).toBe(401);
});

test("GET /meals/:id should not return meal without authentication", async () => {
  const response = await request(app.server).get("/meals/fake-meal-id");

  expect(response.status).toBe(401);
});
