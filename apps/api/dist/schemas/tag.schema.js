"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTagSchema = exports.createTagSchema = void 0;
const zod_1 = require("zod");
exports.createTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(30),
    }),
});
exports.updateTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(30),
    }),
});
//# sourceMappingURL=tag.schema.js.map