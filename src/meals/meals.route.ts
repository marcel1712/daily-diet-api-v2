import type { FastifyInstance } from "fastify";
import MealController from "./meals.controller.ts";

export async function mealRoutes(app: FastifyInstance) {
  app.post("/", MealController.create);
  app.put(`/:id`, MealController.updateMeal);
  app.delete(`/:id`, MealController.deleteMeals);
  app.get(`/:id`, MealController.getMealById);
  app.get(`/`, MealController.getAllMeals);
}
