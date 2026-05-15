import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";

async function create(request:FastifyRequest, reply:FastifyReply) {
  const createUserBodySchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
  });

  const { username, email, password } = createUserBodySchema.parse(
    request.body,
  );

  return { username, email, password };
}

const UserController = {
    create,
}

export default UserController;