import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Get JWT_SECRET with development fallback
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start in production without a valid JWT secret."
      );
    }
    // Development: warn but use fallback
    console.warn(
      "⚠️  WARNING: JWT_SECRET not set. Using development fallback. Set JWT_SECRET in .env for production."
    );
    return "dev-secret-key-change-in-production";
  }
  
  return secret;
})();

// 7 days expiration as per PRD
const JWT_EXPIRES_IN = "7d";

// Generate JWT token for an admin
export const generateToken = (adminId: string): string => {
  return jwt.sign({ id: adminId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify JWT token and extract payload
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  try {
    if (!password || !hash) {
      console.error("❌ comparePasswords: Missing password or hash", {
        passwordExists: !!password,
        hashExists: !!hash,
      });
      return false;
    }
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    console.error("❌ Error comparing passwords:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    });
    throw new Error(`Password comparison failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
