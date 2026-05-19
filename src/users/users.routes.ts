import type { FastifyInstance } from "fastify";
import UserController from "./users.controller.ts";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", UserController.create);
  app.post("/login", UserController.login);
}
