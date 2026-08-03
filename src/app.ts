import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { UserRoutes } from "./app/modules/user/user.route";
import { TechnicianRoutes } from "./app/modules/technician/technician.route";
import { ServiceRoutes } from "./app/modules/service/service.routes";
import { CategoryRoutes } from "./app/modules/category/category.routes";
import { BookingRoutes } from "./app/modules/booking/booking.routes";
import { ProfileRoutes } from "./app/modules/profile/profile.routes";
import { AdminRoutes } from "./app/modules/admin/admin.routes";
import { ReviewRoutes } from "./app/modules/review/review.routes";
import { PaymentRoutes } from "./app/modules/payment/payment.routes";

const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://fix-it-now-mocha.vercel.app",
  "https://fix-it-now-forntend.vercel.app",
  "https://fixitnow-frontend-alpha.vercel.app",
];
if (config.app_url) {
  allowedOrigins.push(config.app_url);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/technicians", TechnicianRoutes);
app.use("/api/v1/services", ServiceRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/bookings", BookingRoutes);
app.use("/api/v1/profile", ProfileRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/reviews", ReviewRoutes);
app.use("/api/v1/payments", PaymentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Hello, World! FixItNow Server API is spinning safely.",
    author: {
      name: "Md. Shehab Al Rabby",
      profession: "Junior Frontend & Full Stack Web Developer",
    },
  });
});

// Middleware Layer
app.use(globalErrorHandler);

export default app;
