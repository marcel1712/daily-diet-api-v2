import type { FastifyInstance } from "fastify";
import MealController from "./meals.controller.ts";
import { checkSessionIdExists } from "../middleware/check-session-id.ts";

export async function mealRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [checkSessionIdExists] }, MealController.create);
  app.put(
    `/:id`,
    { preHandler: [checkSessionIdExists] },
    MealController.updateMeal,
  );
  app.delete(
    `/:id`,
    { preHandler: [checkSessionIdExists] },
    MealController.deleteMeals,
  );
  app.get(
    `/:id`,
    { preHandler: [checkSessionIdExists] },
    MealController.getMealById,
  );
  app.get(
    `/`,
    { preHandler: [checkSessionIdExists] },
    MealController.getAllMeals,
  );
}
