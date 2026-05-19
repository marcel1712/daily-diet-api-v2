import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import passwordUtils from "./users.password.ts";
import { knex } from "../../db/database.ts";

async function verifyCookie(request: FastifyRequest) {
  const verifyCookieSchema = z.object({
    session_id: z.string(),
  });

  const { session_id } = verifyCookieSchema.parse(request.cookies);

  //procurar no banco de dado se existe session_id e se ta atrelado a um usuario e se esta valida
  const session = await knex("sessions")
    .select("session_id", "user_id", "expires_at")
    .where({ session_id })
    .first();

  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    return null;
  }

  const user = await knex("users")
    .select("user_id", "username")
    .where({ user_id: session.user_id })
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

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
  verifyCookie,
};

export default UserController;
