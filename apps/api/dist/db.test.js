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
(0, vitest_1.describe)('db module', () => {
    const originalEnv = process.env.NODE_ENV;
    (0, vitest_1.beforeEach)(() => {
        // Ensure we start with a clean global state so the module's init code runs.
        delete global.prisma;
        vitest_1.vi.resetModules();
    });
    (0, vitest_1.afterEach)(() => {
        process.env.NODE_ENV = originalEnv;
    });
    (0, vitest_1.it)('sets global.prisma when NODE_ENV is not production', async () => {
        process.env.NODE_ENV = 'test';
        vitest_1.vi.doMock('@prisma/client', () => {
            return {
                PrismaClient: class {
                },
            };
        });
        const { prisma } = await Promise.resolve().then(() => __importStar(require('./db')));
        (0, vitest_1.expect)(prisma).toBeDefined();
        (0, vitest_1.expect)(global.prisma).toBe(prisma);
    });
    (0, vitest_1.it)('does not set global.prisma when NODE_ENV is production', async () => {
        process.env.NODE_ENV = 'production';
        vitest_1.vi.doMock('@prisma/client', () => {
            return {
                PrismaClient: class {
                },
            };
        });
        const { prisma } = await Promise.resolve().then(() => __importStar(require('./db')));
        (0, vitest_1.expect)(prisma).toBeDefined();
        (0, vitest_1.expect)(global.prisma).toBeUndefined();
    });
});
//# sourceMappingURL=db.test.js.map