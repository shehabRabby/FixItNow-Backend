import { BookingStatus, UserRole, UserStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

const getDashboardOverviewFromDB = async () => {
  const [
    totalUsers,
    totalBookings,
    bookingsGroupedByStatus,
    totalServices,
    completedBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.booking.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.service.count(),
    prisma.booking.findMany({
      where: { status: "COMPLETED" },
      select: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }),
  ]);

  const totalRevenue = completedBookings.reduce(
    (sum, booking) => sum + (booking.service?.price || 0),
    0,
  );

  const bookingStatusOverview = bookingsGroupedByStatus.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalUsers,
    totalBookings,
    totalServices,
    totalRevenue,
    bookingStatusOverview,
  };
};
const getAllUsersFromDB = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllBookingsFromDB = async () => {
  return await prisma.booking.findMany({
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const createCategoryInDB = async (payload: {
  name: string;
  description?: string;
}) => {
  const isExist = await prisma.category.findFirst({
    where: {
      name: {
        equals: payload.name,
        mode: "insensitive",
      },
    },
  });

  if (isExist) {
    throw new Error("Category already exists!");
  }

  const slug = payload.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return await prisma.category.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description || "",
    },
  });
};

const getAllCategoriesFromDB = async () => {
  return await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

// change user status (ACTIVE/BANNED)
const updateUserStatusInDB = async (
  adminId: string,
  id: string,
  status: UserStatus,
) => {
  if (adminId === id) {
    throw new Error("You cannot change your own status!");
  }

  const isUserExist = await prisma.user.findUnique({
    where: { id },
  });

  if (!isUserExist) {
    throw new Error("User not found!");
  }

  const result = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return result;
};

// change user role (CUSTOMER/TECHNICIAN/ADMIN)
const updateUserRoleInDB = async (
  adminId: string,
  id: string,
  role: UserRole,
) => {
  if (adminId === id) {
    throw new Error("You cannot change your own role!");
  }

  const isUserExist = await prisma.user.findUnique({
    where: { id },
  });

  if (!isUserExist) {
    throw new Error("User not found!");
  }

  if (isUserExist.status === "BANNED") {
    throw new Error(
      "Cannot change the role of a BANNED user! Unban them first.",
    );
  }

  return await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (role === "TECHNICIAN") {
      await tx.technicianProfile.upsert({
        where: { userId: id },
        update: {},
        create: {
          userId: id,
          skills: "",
          experienceYears: 0,
          bio: "",
          availabilitySlots: "",
        },
      });
    }

    return updatedUser;
  });
};

const updateBookingStatusInDB = async (id: string, status: string) => {
  const isBookingExist = await prisma.booking.findUnique({
    where: { id },
  });

  if (!isBookingExist) {
    throw new Error("Booking not found!");
  }

  return await prisma.booking.update({
    where: { id },
    data: { 
      status: status as BookingStatus 
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      service: true,
    },
  });
};

const deleteBookingFromDB = async (id: string) => {
  const isBookingExist = await prisma.booking.findUnique({
    where: { id },
  });

  if (!isBookingExist) {
    throw new Error("Booking not found!");
  }

  return await prisma.booking.delete({
    where: { id },
  });
};

export const AdminService = {
  getDashboardOverviewFromDB,
  updateUserStatusInDB,
  updateUserRoleInDB,
  getAllUsersFromDB,
  getAllBookingsFromDB,
  createCategoryInDB,
  getAllCategoriesFromDB,
  updateBookingStatusInDB,
  deleteBookingFromDB
};
