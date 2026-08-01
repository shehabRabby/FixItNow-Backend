import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import config from "../../config";
import catchAsync from "../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error("You are not authorized!");
    }

    // 🔥 এখানে 'Bearer ' প্রিফিক্স আলাদা করে শুধু টোকেনটা নেওয়া হচ্ছে
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      throw new Error("Invalid token format!");
    }

    //  Verify token
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as Secret,
    ) as any;
    req.user = decoded;

    // Check if user exists and is not banned
    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
    });

    if (!user) {
      throw new Error("User does not exist anymore!");
    }

    if (user.status === ("BANNED" as UserStatus)) {
      throw new Error("Your account has been BANNED! Please contact support.");
    }

    // Role verification
    if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
      throw new Error("You are forbidden!");
    }

    next();
  });
};

export default auth;