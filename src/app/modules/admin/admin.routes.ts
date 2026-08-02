import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";

const router = express.Router();

router.get("/overview", auth("ADMIN"), AdminController.getDashboardOverview);
router.get("/users", auth("ADMIN"), AdminController.getAllUsers);
router.get("/bookings", auth("ADMIN"), AdminController.getAllBookings);

router.patch(
  "/users/:id/status",
  auth("ADMIN"),
  validateRequest(AdminValidation.updateUserStatusValidationSchema),
  AdminController.updateUserStatus,
);

router.patch(
  "/users/:id/role",
  auth("ADMIN"),
  validateRequest(AdminValidation.updateUserRoleValidationSchema),
  AdminController.updateUserRole,
);
router.post(
  "/categories",
  auth("ADMIN"),
  validateRequest(AdminValidation.createCategoryValidationSchema),
  AdminController.createCategory,
);
router.get("/categories", AdminController.getAllCategories);

router.patch(
  "/bookings/:id/status",
  auth("ADMIN"),
  AdminController.updateBookingStatus
);

router.delete(
  "/bookings/:id",
  auth("ADMIN"),
  AdminController.deleteBooking
);

export const AdminRoutes = router;
