import type { FastifyRequest } from "fastify";
import { knex } from "../../db/database.ts";
import z from "zod";

declare module "fastify" {
  interface FastifyRequest {
    data: {
      user_id: string;
    } | null;
  }
}

export async function checkSessionIdExists(request: FastifyRequest) {
  const verifyCookieSchema = z.object({
    session_id: z.string(),
  });

  const { session_id } = verifyCookieSchema.parse(request.cookies);

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

  request.data = { user_id: session.user_id };
}
