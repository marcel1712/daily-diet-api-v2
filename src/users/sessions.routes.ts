import type { FastifyInstance } from "fastify";
import SessionsController from "./sessions.controller.ts";

export async function sessionsRoutes(app: FastifyInstance) {
  app.post("/", SessionsController.create);
}
