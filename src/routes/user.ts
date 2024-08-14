import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { checkUserCookieExist } from "../middlewares/check_user_cookie_exist";

export async function userRoutes(app: FastifyInstance) {
  const prisma = new PrismaClient();

  app.post("/user", async (request: FastifyRequest, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    });

    let sessionId = request.cookies.sessionId;

    const user = createUserBodySchema.parse(request.body);

    const response = await prisma.user.create({
      data: {
        name: user.name,
      },
    });

    if (!sessionId) {
      sessionId = response.id.toString();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, //7 days
      });
    }

    reply.status(201).send("User Created");
  });
}
