import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function checkUserCookieExist(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send({
      error: "Unauthorized",
    });
  }

  return sessionId;
}
