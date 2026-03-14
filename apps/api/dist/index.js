"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
// Middleware: Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true,
}));
// Middleware: Parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Middleware: Rate limiting (for login endpoint)
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many login attempts, please try again later",
});
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});
const auth_routes_1 = __importDefault(require("./routes/admin/auth.routes"));
const topics_routes_1 = __importDefault(require("./routes/admin/topics.routes"));
const courses_routes_1 = __importDefault(require("./routes/admin/courses.routes"));
const content_routes_1 = __importDefault(require("./routes/admin/content.routes"));
const tags_routes_1 = __importDefault(require("./routes/admin/tags.routes"));
const topics_routes_2 = __importDefault(require("./routes/public/topics.routes"));
const courses_routes_2 = __importDefault(require("./routes/public/courses.routes"));
const content_routes_2 = __importDefault(require("./routes/public/content.routes"));
const tags_routes_2 = __importDefault(require("./routes/public/tags.routes"));
const requireAuth_1 = require("./middlewares/requireAuth");
// Public API Routes
app.use("/api/topics", topics_routes_2.default);
app.use("/api/courses", courses_routes_2.default);
app.use("/api/content", content_routes_2.default);
app.use("/api/tags", tags_routes_2.default);
// Admin API Routes
app.use("/api/admin/auth", auth_routes_1.default);
app.use("/api/admin/topics", requireAuth_1.requireAuth, topics_routes_1.default);
app.use("/api/admin/courses", requireAuth_1.requireAuth, courses_routes_1.default);
app.use("/api/admin/content", requireAuth_1.requireAuth, content_routes_1.default);
app.use("/api/admin/tags", requireAuth_1.requireAuth, tags_routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === "production"
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
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path,
        method: req.method,
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
    console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=index.js.map