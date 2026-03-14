import { z } from "zod";

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(30),
  }),
});

export const updateTagSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(30),
  }),
});
