import { Request, Response } from "express";
import httpStatus from "http-status";
import { AdminService } from "./admin.service";
import catchAsync from "../../utils/catchAsync";
import { UserRole, UserStatus } from "../../../../generated/prisma/enums";

const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardOverviewFromDB();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Dashboard overview data retrieved successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsersFromDB();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Users retrieved successfully!",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllBookingsFromDB();
  res.status(httpStatus.OK).json({
    success: true,
    message: "All bookings retrieved successfully!",
    data: result,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createCategoryInDB(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Category created successfully!",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllCategoriesFromDB();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Categories retrieved successfully!",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.id as string;
  const id = req.params.id as string;
  const status = req.body.status as UserStatus;

  // adminId pass
  const result = await AdminService.updateUserStatusInDB(adminId, id, status);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User status updated successfully!",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.id as string;
  const id = req.params.id as string;
  const role = req.body.role as UserRole;

  // adminId pass
  const result = await AdminService.updateUserRoleInDB(adminId, id, role);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User role updated successfully!",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // "ACCEPTED", "DECLINED", "COMPLETED", etc.

  const result = await AdminService.updateBookingStatusInDB(id as string, status);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Booking status updated successfully!",
    data: result,
  });
});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.deleteBookingFromDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Booking deleted successfully!",
    data: result,
  });
});

export const AdminController = {
  getDashboardOverview,
  updateUserStatus,
  updateUserRole,
  updateBookingStatus,
  getAllUsers,
  getAllBookings,
  createCategory,
  getAllCategories,
  deleteBooking,
};
