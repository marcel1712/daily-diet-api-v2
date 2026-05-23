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

test("DELETE /meals/:id returns", async () => {
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

  const responseDeletedMeal = await request(app.server)
    .delete(`/meals/${responseMealBody.meal_id}`)
    .set("Cookie", cookies!);

  const deletedMeal = await knex("meals")
    .select("meal_id")
    .where({ meal_id: responseMealBody.meal_id })
    .first();

  expect(responseDeletedMeal.status).toBe(204);
  expect(deletedMeal).toBeUndefined();
});
