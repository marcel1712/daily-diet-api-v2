import z from "zod";
import { knex } from "../../db/database.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

async function create(request: FastifyRequest) {
  const createMealBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    is_on_diet: z.boolean(),
  });

  const { name, description, date, is_on_diet } = createMealBodySchema.parse(
    request.body,
  );

  const { user_id } = request.data!;

  const meal = await knex("meals").insert(
    { user_id: user_id, name, description, date, is_on_diet },
    ["meal_id", "name", "description", "date", "is_on_diet", "name"],
  );

  return meal[0];
}

async function updateMeal(request: FastifyRequest, reply: FastifyReply) {
  const updateMealParamsSchema = z.object({
    id: z.string(),
  });

  const createMealBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    is_on_diet: z.boolean(),
  });

  const { id } = updateMealParamsSchema.parse(request.params);
  const { name, description, date, is_on_diet } = createMealBodySchema.parse(
    request.body,
  );
  const { user_id } = request.data!;

  const meal = await knex("meals")
    .update({ name, description, date, is_on_diet }, [
      "meal_id",
      "name",
      "description",
      "date",
      "is_on_diet",
    ])
    .where({ meal_id: id, user_id: user_id });
  reply.status(200).send(meal[0]);
}

async function deleteMeals(request: FastifyRequest, reply: FastifyReply) {
  const deleteMealParamsSchema = z.object({
    id: z.string(),
  });

  const { user_id } = request.data!;

  const { id } = deleteMealParamsSchema.parse(request.params);

  await knex("meals").where({ meal_id: id, user_id: user_id }).delete();

  reply.status(204).send();
}

async function getMealById(request: FastifyRequest, reply: FastifyReply) {
  const getMealParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = getMealParamsSchema.parse(request.params);

  const { user_id } = request.data!;

  const meal = await knex("meals")
    .select("meal_id", "name", "description", "date", "is_on_diet")
    .where({ meal_id: id, user_id: user_id })
    .first();

  reply.status(200).send(meal);
}

async function getAllMeals(request: FastifyRequest) {
  const { user_id } = request.data!;

  const meals = await knex("meals")
    .select("meal_id", "name", "description", "date", "is_on_diet")
    .where({ user_id: user_id });

  return meals;
}

const MealController = {
  create,
  updateMeal,
  deleteMeals,
  getMealById,
  getAllMeals,
};

export default MealController;
