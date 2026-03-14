import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { comparePasswords, generateToken } from "../../utils/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema } from "../../schemas/auth.schema";

const router = Router();

// POST /api/admin/auth/login
router.post(
  "/login",
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // 1. Find admin by email
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // 2. Compare password
      const isPasswordValid = await comparePasswords(
        password,
        admin.passwordHash
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // 3. Update last login timestamp
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });

      // 4. Generate JWT token
      const token = generateToken(admin.id);

      // 5. Set HttpOnly cookie
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        message: "Login successful",
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      });
    } catch (error) {
      console.error("Login route error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/admin/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  
  return res.status(200).json({ message: "Logout successful" });
});

export default router;
