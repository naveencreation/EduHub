"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const auth_1 = require("../utils/auth");
const db_1 = require("../db");
const requireAuth = async (req, res, next) => {
    try {
        // 1. Get token from HttpOnly cookie
        const token = req.cookies.admin_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }
        // 2. Verify token
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        // 3. Verify admin exists in database
        const admin = await db_1.prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true },
        });
        if (!admin) {
            return res.status(401).json({ error: "Unauthorized: Admin not found" });
        }
        // 4. Attach admin to request
        req.admin = admin;
        next();
    }
    catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ error: "Internal server error during authentication" });
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=requireAuth.js.map