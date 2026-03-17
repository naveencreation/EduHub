"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const vitest_1 = require("vitest");
const validateRequest_1 = require("./validateRequest");
const zod_1 = require("zod");
const makeApp = (schema) => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.post('/test', (0, validateRequest_1.validateRequest)(schema), (req, res) => {
        res.status(200).json({ ok: true, body: req.body, query: req.query, params: req.params });
    });
    // error handler to surface errors
    app.use((err, _req, res, _next) => {
        res.status(500).json({ error: err?.message || 'unknown' });
    });
    return app;
};
(0, vitest_1.describe)('validateRequest middleware', () => {
    (0, vitest_1.it)('allows valid bodies through', async () => {
        const schema = zod_1.z.object({
            body: zod_1.z.object({
                name: zod_1.z.string(),
            }),
        });
        const app = makeApp(schema);
        const res = await (0, supertest_1.default)(app)
            .post('/test')
            .send({ name: 'Naveen' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toMatchObject({ ok: true, body: { name: 'Naveen' } });
    });
    (0, vitest_1.it)('returns 400 with details for invalid request body', async () => {
        const schema = zod_1.z.object({
            body: zod_1.z.object({
                name: zod_1.z.string(),
            }),
        });
        const app = makeApp(schema);
        const res = await (0, supertest_1.default)(app)
            .post('/test')
            .send({ name: 123 });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toHaveProperty('error', 'Validation failed');
        (0, vitest_1.expect)(Array.isArray(res.body.details)).toBe(true);
        (0, vitest_1.expect)(res.body.details[0]).toMatchObject({ field: 'body.name' });
    });
    (0, vitest_1.it)('passes non-Zod errors to error handler', async () => {
        const schema = {
            parseAsync: () => Promise.reject(new Error('boom')),
        };
        const app = makeApp(schema);
        const res = await (0, supertest_1.default)(app)
            .post('/test')
            .send({});
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'boom' });
    });
});
//# sourceMappingURL=validateRequest.test.js.map