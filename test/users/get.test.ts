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

async function createUserAndSession({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  await request(app.server).post("/users").send({
    username,
    email,
    password,
  });

  const responseSession = await request(app.server).post("/sessions").send({
    email,
    password,
  });

  return responseSession.get("Set-Cookie");
}

async function createMeal(
  cookies: string[],
  meal: {
    name: string;
    description: string;
    date: string;
    is_on_diet: boolean;
  },
) {
  return request(app.server).post("/meals").set("Cookie", cookies).send(meal);
}

test("GET /users/metrics returns correct metrics", async () => {
  const cookies = await createUserAndSession({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  await createMeal(cookies!, {
    name: "Frango",
    description: "Almoço",
    date: "2026-05-01T12:00:00.000Z",
    is_on_diet: true,
  });

  await createMeal(cookies!, {
    name: "Pizza",
    description: "Jantar",
    date: "2026-05-02T20:00:00.000Z",
    is_on_diet: false,
  });

  await createMeal(cookies!, {
    name: "Salada",
    description: "Almoço",
    date: "2026-05-03T12:00:00.000Z",
    is_on_diet: true,
  });

  await createMeal(cookies!, {
    name: "Ovo",
    description: "Café da manhã",
    date: "2026-05-04T08:00:00.000Z",
    is_on_diet: true,
  });

  const response = await request(app.server)
    .get("/users/metrics")
    .set("Cookie", cookies!);

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    total: 4,
    on_diet: 3,
    off_diet: 1,
    best_streak: 2,
  });
});

test("GET /users/metrics returns zero metrics when user has no meals", async () => {
  const cookies = await createUserAndSession({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const response = await request(app.server)
    .get("/users/metrics")
    .set("Cookie", cookies!);

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    total: 0,
    on_diet: 0,
    off_diet: 0,
    best_streak: 0,
  });
});

test("GET /users/metrics does not count meals from another user", async () => {
  const marcelCookies = await createUserAndSession({
    username: "marcelhrb",
    email: "marcel@email.com",
    password: "senhaBolada",
  });

  const otherUserCookies = await createUserAndSession({
    username: "outro_user",
    email: "outro@email.com",
    password: "senhaBolada",
  });

  await createMeal(marcelCookies!, {
    name: "Frango",
    description: "Almoço",
    date: "2026-05-01T12:00:00.000Z",
    is_on_diet: true,
  });

  await createMeal(marcelCookies!, {
    name: "Salada",
    description: "Jantar",
    date: "2026-05-02T20:00:00.000Z",
    is_on_diet: true,
  });

  await createMeal(otherUserCookies!, {
    name: "Pizza",
    description: "Jantar",
    date: "2026-05-03T20:00:00.000Z",
    is_on_diet: false,
  });

  await createMeal(otherUserCookies!, {
    name: "Hambúrguer",
    description: "Jantar",
    date: "2026-05-04T20:00:00.000Z",
    is_on_diet: false,
  });

  const response = await request(app.server)
    .get("/users/metrics")
    .set("Cookie", marcelCookies!);

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    total: 2,
    on_diet: 2,
    off_diet: 0,
    best_streak: 2,
  });
});

test("GET /users/metrics should not be accessible without authentication", async () => {
  const response = await request(app.server).get("/users/metrics");

  console.log(response.status);
  console.log(response.body);

  expect(response.status).toBe(401);
});
