import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";

const router = express.Router();

router.post(
  "/create-booking",
  auth("CUSTOMER"),
  validateRequest(BookingValidation.createBookingValidationSchema),
  BookingController.createBooking,
);


router.get(
  "/",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  BookingController.getAllBookings,
);

router.get(
  "/:id",
  auth("CUSTOMER", "TECHNICIAN", "ADMIN"),
  BookingController.getSingleBooking,
);

router.patch(
  "/:id/status",
  auth("TECHNICIAN", "ADMIN"),
  BookingController.updateBookingStatus
);


router.patch(
  "/:id/cancel",
  auth("CUSTOMER"),
  BookingController.cancelBooking
);


export const BookingRoutes = router;
