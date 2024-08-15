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
    async (request, reply) => {
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

  app.put(
    "/meal/:id",
    {
      preHandler: [checkUserCookieExist],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.optional(z.string()),
        description: z.optional(z.string()),
        in_diet: z.optional(z.boolean()),
      });

      const mealParamSchema = z.object({
        id: z.string(),
      });

      const id = Number(mealParamSchema.parse(request.params).id);

      const { sessionId } = request.cookies;

      const { in_diet, description, name } = createMealBodySchema.parse(
        request.body
      );

      const meal = await prisma.meal.findUnique({
        where: {
          id,
        },
      });

      const response = await prisma.meal.update({
        where: {
          id,
        },
        data: {
          name: meal?.name != name ? name : meal?.name,
          description:
            meal?.description != description ? description : meal?.description,
          In_diet: meal?.In_diet != in_diet ? in_diet : meal?.In_diet,
        },
      });

      reply.status(201).send(response);
    }
  );

  app.delete(
    "/meal",
    {
      preHandler: [checkUserCookieExist],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        id: z.number(),
      });

      const { sessionId } = request.cookies;

      const { id } = createMealBodySchema.parse(request.body);

      await prisma.meal.delete({
        where: {
          id,
          userId: Number(sessionId),
        },
      });

      reply.status(200).send();
    }
  );

  app.get(
    "/meals",
    {
      preHandler: [checkUserCookieExist],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const response = await prisma.meal.findMany({
        where: {
          userId: Number(sessionId),
        },
      });

      reply.status(200).send(response);
    }
  );

  app.get(
    "/meal/:id",
    {
      preHandler: [checkUserCookieExist],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        id: z.string(),
      });

      const { sessionId } = request.cookies;

      const id = Number(createMealBodySchema.parse(request.params).id);

      const response = await prisma.meal.findUnique({
        where: {
          id,
          userId: Number(sessionId),
        },
      });

      reply.status(200).send(response);
    }
  );

  app.get(
    "/meals/metrics",
    {
      preHandler: [checkUserCookieExist],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const response = await prisma.meal.findMany({
        where: {
          userId: Number(sessionId),
        },
      });

      const total = response.length;
      const totalInDietMeals = response.map((meal) => {
        return meal.In_diet == true;
      });
      const totalOutDietMeals = response.map((meal) => {
        return meal.In_diet == false;
      });

      const { bestOnDietSequence } = response.reduce(
        (acc, meal: any) => {
          if (meal.is_on_diet) {
            acc.currentSequence += 1;
          } else {
            acc.currentSequence = 0;
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence;
          }

          return acc;
        },
        { bestOnDietSequence: 0, currentSequence: 0 }
      );

      reply.status(200).send({
        total,
        totalInDietMeals: totalInDietMeals.length,
        totalOutDietMeals: totalOutDietMeals.length,
        bestSequence: bestOnDietSequence,
      });
    }
  );
}
