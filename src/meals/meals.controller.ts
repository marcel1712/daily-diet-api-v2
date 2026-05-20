import z from "zod";
import { knex } from "../../db/database.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import UserController from "../users/users.controller.ts";
import SessionController from "../users/sessions.controller.ts";

async function create(request: FastifyRequest, reply: FastifyReply) {
  const createMealBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    is_on_diet: z.boolean(),
  });

  const { name, description, date, is_on_diet } = createMealBodySchema.parse(
    request.body,
  );

  const user = await UserController.verifyCookie(request);

  if (!user) {
    return reply.status(401).send({ error: "Invalid session" });
  }

  const meal = await knex("meals").insert(
    { user_id: user.user_id, name, description, date, is_on_diet },
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

  const session = await SessionController.verifySession(request);

  if (!session) {
    return reply.status(401).send({ error: "Invalid session" });
  }

  const { id } = updateMealParamsSchema.parse(request.params);
  const { name, description, date, is_on_diet } = createMealBodySchema.parse(
    request.body,
  );

  const meal = await knex("meals")
    .update({ name, description, date, is_on_diet }, [
      "meal_id",
      "name",
      "description",
      "date",
      "is_on_diet",
    ])
    .where({ meal_id: id, user_id: session.user_id });
  reply.status(200).send(meal[0]);
}

async function deleteMeals(request: FastifyRequest, reply: FastifyReply) {
  const deleteMealParamsSchema = z.object({
    id: z.string(),
  });

  const session = await SessionController.verifySession(request);

  if (!session) {
    return reply.status(401).send({ error: "Invalid session" });
  }

  const { id } = deleteMealParamsSchema.parse(request.params);

  await knex("meals").where({ meal_id: id, user_id: session.user_id }).delete();

  reply.status(204).send();
}

async function getMealById(request: FastifyRequest, reply: FastifyReply) {
  const getMealParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = getMealParamsSchema.parse(request.params);

  const session = await SessionController.verifySession(request);

  if (!session) {
    return reply.status(401).send({ error: "Invalid session" });
  }

  const meal = await knex("meals")
    .select("meal_id", "name", "description", "date", "is_on_diet")
    .where({ meal_id: id, user_id: session.user_id })
    .first();

  reply.status(200).send(meal);
}

async function getAllMeals(request: FastifyRequest, reply: FastifyReply) {
  const session = await SessionController.verifySession(request);

  if (!session) {
    return reply.status(401).send({ error: "Invalid session" });
  }

  const meals = await knex("meals")
    .select("meal_id", "name", "description", "date", "is_on_diet")
    .where({ user_id: session.user_id });

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
