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

test("GET /users/metrics returns correct metrics", async () => {
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
    name: "Frango",
    description: "Almoço",
    date: new Date().toISOString(),
    is_on_diet: true,
  });

  await request(app.server).post("/meals").set("Cookie", cookies!).send({
    name: "Pizza",
    description: "Jantar",
    date: new Date().toISOString(),
    is_on_diet: false,
  });

  await request(app.server).post("/meals").set("Cookie", cookies!).send({
    name: "Salada",
    description: "Almoço",
    date: new Date().toISOString(),
    is_on_diet: true,
  });

  await request(app.server).post("/meals").set("Cookie", cookies!).send({
    name: "Ovo",
    description: "Café",
    date: new Date().toISOString(),
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
