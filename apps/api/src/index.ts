import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware: Security
app.use(helmet({
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
  frameguard: { action: "deny" },
  noSniff: true,
}));

// Middleware: CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

// Middleware: Compression (requires: npm install compression)
// app.use(compression({ level: 6, threshold: 1024 }));

// Middleware: Request ID tracking
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  (req as any).id = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// Middleware: Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Middleware: Rate limiting (for login endpoint)
// Uncomment when compression is installed via npm install compression
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 requests per windowMs
//   message: "Too many login attempts, please try again later",
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Health check endpoint with cache headers
app.get("/api/health", (_req: Request, res: Response) => {
  res.set("Cache-Control", "public, max-age=30");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

import authRoutes from "./routes/admin/auth.routes";
import adminTopicRoutes from "./routes/admin/topics.routes";
import adminCourseRoutes from "./routes/admin/courses.routes";
import adminContentRoutes from "./routes/admin/content.routes";
import adminTagRoutes from "./routes/admin/tags.routes";
import publicTopicRoutes from "./routes/public/topics.routes";
import publicCourseRoutes from "./routes/public/courses.routes";
import publicContentRoutes from "./routes/public/content.routes";
import publicTagRoutes from "./routes/public/tags.routes";
import { requireAuth } from "./middlewares/requireAuth";

// Public API Routes
app.use("/api/topics", publicTopicRoutes);
app.use("/api/courses", publicCourseRoutes);
app.use("/api/content", publicContentRoutes);
app.use("/api/tags", publicTagRoutes);

// Admin API Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/topics", requireAuth, adminTopicRoutes);
app.use("/api/admin/courses", requireAuth, adminCourseRoutes);
app.use("/api/admin/content", requireAuth, adminContentRoutes);
app.use("/api/admin/tags", requireAuth, adminTagRoutes);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] [${status}] ${err.message || "Unknown error"}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Start server when run directly (not when imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
    console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
