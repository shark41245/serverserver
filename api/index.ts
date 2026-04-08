
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/trpc", createExpressMiddleware({
  router: appRouter,
  createContext: () => ({})
}));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
