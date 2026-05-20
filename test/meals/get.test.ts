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

test("GET /meals returns", async () => {
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

  const createdMealRequest = await request(app.server)
    .post("/meals")
    .set("Cookie", cookies!)
    .send({
      name: "Frango com arroz",
      description: "Almoço pós-treino",
      date: new Date().toISOString(),
      is_on_diet: true,
    });

  const createdMeal = createdMealRequest.body;

  const getMealRequest = await request(app.server)
    .get(`/meals/${createdMeal.meal_id}`)
    .set("Cookie", cookies!);

  expect(getMealRequest.body).toEqual({
    meal_id: createdMeal.meal_id,
    name: "Frango com arroz",
    description: "Almoço pós-treino",
    date: expect.any(String),
    is_on_diet: true,
  });
});

test("GET /meals returns all meals from user", async () => {
  await request(app.server).post("/users").send({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const responseSession = await request(app.server).post("/sessions").send({
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const cookies = responseSession.get("Set-Cookie");

  await request(app.server).post("/meals").set("Cookie", cookies!).send({
    name: "Frango com arroz",
    description: "Almoço pós-treino",
    date: new Date().toISOString(),
    is_on_diet: true,
  });

  await request(app.server).post("/meals").set("Cookie", cookies!).send({
    name: "Pizza",
    description: "Jantar",
    date: new Date().toISOString(),
    is_on_diet: false,
  });

  const response = await request(app.server)
    .get("/meals")
    .set("Cookie", cookies!);

  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(2);
  expect(response.body[0]).toEqual({
    meal_id: expect.any(String),
    name: "Frango com arroz",
    description: "Almoço pós-treino",
    date: expect.any(String),
    is_on_diet: true,
  });
});
