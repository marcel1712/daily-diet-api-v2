import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import passwordUtils from "./users.password.ts";
import { knex } from "../../db/database.ts";
import SessionController from "./sessions.controller.ts";

async function verifyCookie(request: FastifyRequest) {
  //verifica se ja ta tem um cookie no jar, se sim verifica se ele ta valido
  const session = await SessionController.verifySession(request);

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

async function login(request: FastifyRequest, reply: FastifyReply) {
  const loginUserBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const { email, password } = loginUserBodySchema.parse(request.body);

  const user = await findOneByEmail(email);

  if (!user || !(await passwordUtils.compare(password, user.password))) {
    return reply.status(401).send({ error: "Invalid credentials" });
  }

  await SessionController.pruneExpiredSessions(user.user_id);

  const expiresAt = new Date(
    Date.now() + SessionController.EXPIRATION_IN_MILISECONDS,
  );

  const [newSession] = await knex("sessions").insert(
    { user_id: user.user_id, expires_at: expiresAt },
    ["session_id"],
  );

  reply.setCookie("session_id", newSession.session_id, {
    path: "/",
    httpOnly: true,
    expires: expiresAt,
  });

  return reply.status(200).send({
    user_id: user.user_id,
    username: user.username,
    email: user.email,
  });
}

const UserController = {
  create,
  findOneByEmail,
  verifyCookie,
  login,
};

export default UserController;
