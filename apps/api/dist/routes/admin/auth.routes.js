"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const auth_1 = require("../../utils/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_schema_1 = require("../../schemas/auth.schema");
const router = (0, express_1.Router)();
// POST /api/admin/auth/login
router.post("/login", (0, validateRequest_1.validateRequest)(auth_schema_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Find admin by email
        const admin = await db_1.prisma.admin.findUnique({
            where: { email },
        });
        if (!admin) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // 2. Compare password
        const isPasswordValid = await (0, auth_1.comparePasswords)(password, admin.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // 3. Update last login timestamp
        await db_1.prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
        });
        // 4. Generate JWT token
        const token = (0, auth_1.generateToken)(admin.id);
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
    }
    catch (error) {
        console.error("Login route error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// POST /api/admin/auth/logout
router.post("/logout", (req, res) => {
    res.clearCookie("admin_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout successful" });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map