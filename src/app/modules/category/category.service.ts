import { prisma } from "../../../lib/prisma";

const createCategoryInDB = async (payload: {
  name: string;
  description: string;
  slug: string;
}) => {
  // check duplicate category
  const isCategoryExist = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: payload.name, mode: "insensitive" } },
        { slug: { equals: payload.slug, mode: "insensitive" } },
      ],
    },
  });

  if (isCategoryExist) {
    throw new Error("Category with this name or slug already exists!");
  }

  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany();
  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  try {
    const result = await prisma.category.delete({
      where: { id },
    });
    return result;
  } catch (error: any) {
    if (error.code === "P2003") {
      const customError: any = new Error(
        "Cannot delete this category because services are linked to it!",
      );
      customError.statusCode = 400;
      throw customError;
    }
    throw error;
  }
};

const getSingleCategoryFromDB = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
  });
  return result;
};

const updateCategoryInDB = async (
  id: string,
  payload: { name?: string; slug?: string; description?: string },
) => {
  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return result;
};

export const CategoryService = {
  createCategoryInDB,
  getAllCategoriesFromDB,
  deleteCategoryFromDB,
  getSingleCategoryFromDB,
  updateCategoryInDB,
};
