import fastify from "fastify";
import { userRoutes } from "./routes/user";
import fastifyCookie from "@fastify/cookie";
import { mealRoutes } from "./routes/meal";

export const app = fastify();

app.register(fastifyCookie);
app.register(userRoutes);
app.register(mealRoutes);
