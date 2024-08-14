import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { checkUserCookieExist } from "../middlewares/check_user_cookie_exist";

export async function mealRoutes(app: FastifyInstance) {
  const prisma = new PrismaClient();

  app.post(
    "/meal",
    {
      preHandler: [checkUserCookieExist],
    },
    async (request: FastifyRequest, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        in_diet: z.boolean(),
      });

      const { sessionId } = request.cookies;

      const { description, in_diet, name } = createMealBodySchema.parse(
        request.body
      );

      const response = await prisma.meal.create({
        data: {
          description,
          In_diet: in_diet,
          name,
          userId: Number(sessionId),
        },
      });

      reply.status(201).send(response);
    }
  );
}
