"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("./index"));
describe('Express API integration', () => {
    it('responds to /api/health with status 200 and ok payload', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
    });
    it('returns 404 for unknown routes', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/this-route-does-not-exist');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'Route not found');
    });
});
//# sourceMappingURL=index.test.js.map