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
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)('auth utils', () => {
    afterEach(() => {
        vitest_1.vi.resetModules();
        delete process.env.JWT_SECRET;
    });
    (0, vitest_1.it)('uses fallback secret in development when JWT_SECRET is unset', async () => {
        process.env.NODE_ENV = 'development';
        const { generateToken, verifyToken } = await Promise.resolve().then(() => __importStar(require('./auth')));
        const token = generateToken('admin-123');
        const payload = verifyToken(token);
        (0, vitest_1.expect)(payload).toBeTruthy();
        (0, vitest_1.expect)(payload).toHaveProperty('id', 'admin-123');
    });
    (0, vitest_1.it)('verifies token using JWT_SECRET when provided', async () => {
        process.env.JWT_SECRET = 'test-secret-1';
        process.env.NODE_ENV = 'production';
        const { generateToken, verifyToken } = await Promise.resolve().then(() => __importStar(require('./auth')));
        const token = generateToken('admin-456');
        const payload = verifyToken(token);
        (0, vitest_1.expect)(payload).toBeTruthy();
        (0, vitest_1.expect)(payload).toHaveProperty('id', 'admin-456');
    });
    (0, vitest_1.it)('verifyToken returns null for invalid token', async () => {
        process.env.JWT_SECRET = 'test-secret-2';
        process.env.NODE_ENV = 'production';
        const { verifyToken } = await Promise.resolve().then(() => __importStar(require('./auth')));
        const payload = verifyToken('invalid-token');
        (0, vitest_1.expect)(payload).toBeNull();
    });
    (0, vitest_1.it)('throws when JWT_SECRET is missing in production', async () => {
        process.env.NODE_ENV = 'production';
        delete process.env.JWT_SECRET;
        await (0, vitest_1.expect)(Promise.resolve().then(() => __importStar(require('./auth')))).rejects.toThrow('FATAL: JWT_SECRET environment variable is not set');
    });
    (0, vitest_1.it)('hashPassword and comparePasswords work correctly', async () => {
        process.env.JWT_SECRET = 'test-secret-3';
        process.env.NODE_ENV = 'production';
        const { hashPassword, comparePasswords } = await Promise.resolve().then(() => __importStar(require('./auth')));
        const password = 'My$ecureP@ssw0rd';
        const hashed = await hashPassword(password);
        (0, vitest_1.expect)(typeof hashed).toBe('string');
        (0, vitest_1.expect)(hashed).not.toBe(password);
        const isMatch = await comparePasswords(password, hashed);
        (0, vitest_1.expect)(isMatch).toBe(true);
        const isWrong = await comparePasswords('wrong', hashed);
        (0, vitest_1.expect)(isWrong).toBe(false);
    });
});
//# sourceMappingURL=auth.test.js.map