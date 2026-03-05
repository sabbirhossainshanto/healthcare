/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from "express";
import { indexRoute } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./app/config/env";
import qs from "qs";
import { paymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/module/appointment/appointment.service";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhookEvent,
);

app.use(
  cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", toNodeHandler(auth));
cron.schedule("*/25 * * * *", async () => {
  try {
    console.log(`Running cron job to cancel unpaid appointments`);
    await AppointmentService.cancelUnpaidAppointments();
  } catch (error: any) {
    console.error(
      "Error occurred while cancelling unpaid appointments:",
      error.message,
    );
  }
});

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", indexRoute);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
