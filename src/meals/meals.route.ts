import type { FastifyInstance } from "fastify";
import MealController from "./meals.controller.ts";

export async function mealRoutes(app: FastifyInstance) {
  app.post("/", MealController.create);
}
