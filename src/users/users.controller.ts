import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import passwordUtils from "./users.password.ts";
import { knex } from "../../db/database.ts";

async function findOneByEmail(email: string) {
  const user = await knex("users")
    .select("user_id", "username", "email", "password")
    .where({ email })
    .first();
  return user;
}

async function create(request: FastifyRequest, reply: FastifyReply) {
  const createUserBodySchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
  });

  const { username, email, password } = createUserBodySchema.parse(
    request.body,
  );

  const existingUser = await knex("users").where({ email }).first();
  if (existingUser) {
    return reply.status(409).send({
      error: "Email already exists",
    });
  }

  const hashedPassword = await passwordUtils.hash(password);

  try {
    const user = await knex("users").insert(
      { username, email, password: hashedPassword },
      ["user_id", "username", "email"],
    );
    return user[0];
  } catch (err) {
    console.error(err);
    reply.status(500).send(err);
  }
}

const UserController = {
  create,
  findOneByEmail,
};

export default UserController;
