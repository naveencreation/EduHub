import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { prisma } from "../db";

// Extend Express Request to include admin inside req
declare module "express-serve-static-core" {
  interface Request {
    admin?: {
      id: string;
      email: string;
    };
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from HttpOnly cookie
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // 2. Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // 3. Verify admin exists in database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true },
    });

    if (!admin) {
      return res.status(401).json({ error: "Unauthorized: Admin not found" });
    }

    // 4. Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};
