import z from "zod";
import { knex } from "../../db/database.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import UserController from "../users/users.controller.ts";

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
    ["name", "description", "date", "is_on_diet", "name"],
  );

  return meal[0];
}

const MealController = {
  create,
};

export default MealController;
