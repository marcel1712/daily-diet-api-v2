import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import MealController from "./meals.controller.ts";
import { checkSessionIdExists } from "../middleware/check-session-id.ts";

export async function mealRoutes(app: FastifyInstance) {
  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await checkSessionIdExists(request, reply);
    },
  );
  app.post("/", MealController.create);
  app.put(`/:id`, MealController.updateMeal);
  app.delete(`/:id`, MealController.deleteMeals);
  app.get(`/:id`, MealController.getMealById);
  app.get(`/`, MealController.getAllMeals);
}
