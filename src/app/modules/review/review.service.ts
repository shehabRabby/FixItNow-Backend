import { prisma } from "../../../lib/prisma";

const createReviewInDB = async (
  customerId: string,
  payload: { bookingId: string; rating: number; comment: string },
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: {
      service: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found!");
  }

  // check owner of the booking
  if (booking.customerId !== customerId) {
    throw new Error("You are not authorized to review this booking!");
  }

  if (booking.status !== "COMPLETED") {
    throw new Error("You can only review a booking after it is COMPLETED!");
  }

  // check duplicate review for the same booking
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: payload.bookingId },
  });

  if (existingReview) {
    throw new Error("You have already submitted a review for this booking!");
  }

  // সরাসরি service থেকে technicianProfileId নেওয়া হলো (TypeScript Error সমাধান করা হয়েছে)
  const technicianProfileId = booking.service?.technicianProfileId;
  
  if (!technicianProfileId) {
    throw new Error("No technician is assigned to this service to review!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        bookingId: payload.bookingId,
        customerId,
        technicianProfileId,
        rating: payload.rating,
        comment: payload.comment,
      },
      include: {
        customer: true,
        technicianProfile: true,
      },
    });

    const aggregations = await tx.review.aggregate({
      where: { technicianProfileId },
      _avg: {
        rating: true, 
      },
    });

    const newAverageRating = aggregations._avg.rating || payload.rating;
    await tx.technicianProfile.update({
      where: { id: technicianProfileId },
      data: {
        ratingAverage: parseFloat(newAverageRating.toFixed(1)),
      },
    });

    return newReview;
  });

  return result;
};

const getAllReviewsFromDB = async (query: {
  customerId?: string;
  technicianProfileId?: string;
}) => {
  const { customerId, technicianProfileId } = query;
  const findConditions: any = {};

  if (customerId && customerId !== "undefined" && customerId !== "null") {
    findConditions.customerId = customerId;
  }
  if (technicianProfileId && technicianProfileId !== "undefined" && technicianProfileId !== "null") {
    findConditions.technicianProfileId = technicianProfileId;
  }

  const reviews = await prisma.review.findMany({
    where: findConditions,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      technicianProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      booking: {
        include: {
          service: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

export const ReviewService = {
  createReviewInDB,
  getAllReviewsFromDB,
};