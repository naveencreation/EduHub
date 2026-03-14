import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";
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
  return bcrypt.compare(password, hash);
};
