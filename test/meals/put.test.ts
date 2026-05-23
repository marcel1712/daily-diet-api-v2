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

test("PUT /meals/:id should update a meal", async () => {
  const requestCreatedUser = await request(app.server)
    .post("/users")
    .send({
      username: "marcelhrb",
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  expect(requestCreatedUser.status).toBe(200);

  const createdUser = requestCreatedUser.body;

  const responseSession = await request(app.server)
    .post("/sessions")
    .send({
      email: "marcel@email.com",
      password: "senhaBolada",
    })
    .set("Accept", "application/json");

  expect(responseSession.status).toBe(200);

  expect(responseSession.body).toEqual({
    user_id: createdUser.user_id,
    email: "marcel@email.com",
    username: "marcelhrb",
  });

  const cookies = responseSession.get("Set-Cookie");

  expect(cookies).toBeDefined();

  const responseMeal = await request(app.server)
    .post("/meals")
    .set("Cookie", cookies!)
    .send({
      name: "Frango com arroz",
      description: "Almoço pós-treino",
      date: "2026-05-22T12:00:00.000Z",
      is_on_diet: true,
    });

  expect(responseMeal.status).toBe(200);

  expect(responseMeal.body).toEqual({
    meal_id: expect.any(String),
    name: "Frango com arroz",
    description: "Almoço pós-treino",
    date: expect.any(String),
    is_on_diet: true,
  });

  const responseUpdatedMeal = await request(app.server)
    .put(`/meals/${responseMeal.body.meal_id}`)
    .set("Cookie", cookies!)
    .send({
      name: "Frango",
      description: "Almoço",
      date: "2026-05-22T13:00:00.000Z",
      is_on_diet: false,
    });

  expect(responseUpdatedMeal.status).toBe(200);

  expect(responseUpdatedMeal.body).toEqual({
    meal_id: responseMeal.body.meal_id,
    name: "Frango",
    description: "Almoço",
    date: expect.any(String),
    is_on_diet: false,
  });
});

test("PUT /meals/:id should not update meal from another user", async () => {
  //criar o user1
  const user1 = await request(app.server).post("/users").send({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  console.log(user1.body);

  //configura a session do user1
  const firstUserSession = await request(app.server).post("/sessions").send({
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const firstUserCookies = firstUserSession.get("Set-Cookie");

  //cria a meal do user 1
  const createdMeal = await request(app.server)
    .post("/meals")
    .set("Cookie", firstUserCookies!)
    .send({
      name: "Frango com arroz",
      description: "Almoço pós-treino",
      date: "2026-05-22T12:00:00.000Z",
      is_on_diet: true,
    });

  //criar o user2
  await request(app.server).post("/users").send({
    username: "outro_user",
    email: "outro@email.com",
    password: "senhaBolada",
  });

  //criar a session do user 2
  const secondUserSession = await request(app.server).post("/sessions").send({
    email: "outro@email.com",
    password: "senhaBolada",
  });

  const secondUserCookies = secondUserSession.get("Set-Cookie");
  console.log(firstUserCookies);
  console.log(secondUserCookies);

  const response = await request(app.server)
    .put(`/meals/${createdMeal.body.meal_id}`)
    .set("Cookie", secondUserCookies!)
    .send({
      name: "Frango roubado",
      description: "Tentando editar refeição de outro usuário",
      date: "2026-05-22T13:00:00.000Z",
      is_on_diet: false,
    });

  expect(response.status).toBe(404);
});
