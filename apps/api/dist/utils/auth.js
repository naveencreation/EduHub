"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.hashPassword = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get JWT_SECRET with development fallback
const JWT_SECRET = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start in production without a valid JWT secret.");
        }
        // Development: warn but use fallback
        console.warn("⚠️  WARNING: JWT_SECRET not set. Using development fallback. Set JWT_SECRET in .env for production.");
        return "dev-secret-key-change-in-production";
    }
    return secret;
})();
// 7 days expiration as per PRD
const JWT_EXPIRES_IN = "7d";
// Generate JWT token for an admin
const generateToken = (adminId) => {
    return jsonwebtoken_1.default.sign({ id: adminId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
// Verify JWT token and extract payload
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
// Hash password
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
// Compare password
const comparePasswords = async (password, hash) => {
    try {
        if (!password || !hash) {
            console.error("❌ comparePasswords: Missing password or hash", {
                passwordExists: !!password,
                hashExists: !!hash,
            });
            return false;
        }
        const result = await bcryptjs_1.default.compare(password, hash);
        return result;
    }
    catch (error) {
        console.error("❌ Error comparing passwords:", {
            message: error instanceof Error ? error.message : String(error),
            error,
        });
        throw new Error(`Password comparison failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.comparePasswords = comparePasswords;
//# sourceMappingURL=auth.js.map