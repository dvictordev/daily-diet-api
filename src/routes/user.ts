import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  const prisma = new PrismaClient();

  app.post("/user", async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const user = createUserBodySchema.parse(req.body);

    await prisma.user.create({
      data: {
        name: user.name,
      },
    });

    res.status(201).send("User Created");
  });
}
