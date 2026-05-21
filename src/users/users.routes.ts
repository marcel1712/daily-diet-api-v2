import type { FastifyInstance } from "fastify";
import UserController from "./users.controller.ts";
import { checkSessionIdExists } from "../middleware/check-session-id.ts";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", UserController.create);
  app.post("/login", UserController.login);
  app.get(
    "/metrics",
    { preHandler: checkSessionIdExists },
    UserController.getMetrics,
  );
}
