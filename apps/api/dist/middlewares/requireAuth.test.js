"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
vitest_1.vi.mock('../utils/auth', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        verifyToken: vitestVi.fn(),
    };
});
vitest_1.vi.mock('../db', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        prisma: {
            admin: {
                findUnique: vitestVi.fn(),
            },
        },
    };
});
const requireAuth_1 = require("./requireAuth");
const db_1 = require("../db");
const auth_1 = require("../utils/auth");
const mockAdminFindUnique = db_1.prisma.admin.findUnique;
const mockVerifyToken = auth_1.verifyToken;
(0, vitest_1.describe)('requireAuth middleware', () => {
    let app;
    (0, vitest_1.beforeEach)(() => {
        app = (0, express_1.default)();
        app.use((0, cookie_parser_1.default)());
        app.get('/protected', requireAuth_1.requireAuth, (req, res) => {
            return res.status(200).json({ ok: true, admin: req.admin });
        });
        mockAdminFindUnique.mockReset();
        mockVerifyToken.mockReset();
    });
    (0, vitest_1.it)('returns 401 if no token cookie', async () => {
        const res = await (0, supertest_1.default)(app).get('/protected');
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Unauthorized: No token provided' });
    });
    (0, vitest_1.it)('returns 401 if token is invalid', async () => {
        mockVerifyToken.mockReturnValue(null);
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Cookie', 'admin_token=invalid');
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Unauthorized: Invalid token' });
    });
    (0, vitest_1.it)('returns 401 if admin not found', async () => {
        mockVerifyToken.mockReturnValue({ id: 'admin-123' });
        mockAdminFindUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Unauthorized: Admin not found' });
    });
    (0, vitest_1.it)('allows access when token is valid and admin exists', async () => {
        mockVerifyToken.mockReturnValue({ id: 'admin-123' });
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ ok: true, admin: { id: 'admin-123', email: 'admin@example.com' } });
    });
    (0, vitest_1.it)('returns 500 when verifyToken throws', async () => {
        mockVerifyToken.mockImplementation(() => {
            throw new Error('boom');
        });
        const res = await (0, supertest_1.default)(app)
            .get('/protected')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Internal server error during authentication' });
    });
});
//# sourceMappingURL=requireAuth.test.js.map