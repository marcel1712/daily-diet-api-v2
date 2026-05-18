import type { FastifyReply, FastifyRequest } from "fastify";
import UserController from "./users.controller.ts";
import z from "zod";
// import crypto from "node:crypto";
import passwordUtils from "./users.password.ts";
import { knex } from "../../db/database.ts";

const EXPIRATION_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000; //30 days

async function create(request: FastifyRequest, reply: FastifyReply) {
  const sessionBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });
  const { email, password } = sessionBodySchema.parse(request.body);
  //const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

  const user = await UserController.findOneByEmail(email);

  if (!user || !(await passwordUtils.compare(password, user.password))) {
    return reply.status(401).send({ error: "Invalid credentials" });
  }

  const newSessionQuery = await knex("sessions").insert(
    { user_id: user.user_id, expires_at: expiresAt },
    ["session_id", "user_id", "expires_at"],
  );

  const newSession = newSessionQuery[0];

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

const SessionController = {
  create,
};

export default SessionController;
