import { expect, test, beforeAll, afterAll } from "vitest";
import { app } from "../src/app.ts";
import request from 'supertest';

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

test('GET / returns', async () => {
  const response = await request(app.server).get('/')
  expect(response.status).toBe(200)
  expect(response.text).toBe("VAI CORINTHIANS!!")
})

test('noncreated method error ', async() => {
  const response = await request(app.server).post('/')
  expect(response.status).toBe(404)
})