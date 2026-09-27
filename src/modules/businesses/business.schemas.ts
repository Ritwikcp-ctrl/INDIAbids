import { z } from "zod";

const safeUrl = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => {
      const parsed = new URL(value);

      return (
        (parsed.protocol === "https:" || parsed.protocol === "http:") &&
        !parsed.username &&
        !parsed.password
      );
    },
    {
      message: "URL must use HTTP/HTTPS and must not contain credentials.",
    }
  );

const nullableSafeUrl = safeUrl.nullable().optional();

const nullableText = z.string().trim().max(2000).nullable().optional();

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2).max(120),

  description: nullableText,
  website: nullableSafeUrl,
  logoUrl: nullableSafeUrl,

  categoryId: z.string().uuid(),

  state: z.string().trim().min(1).max(100).optional(),

  city: z.string().trim().min(1).max(100).optional(),
});

export const updateBusinessSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),

    description: nullableText,

    website: nullableSafeUrl,

    logoUrl: nullableSafeUrl,

    state: z.string().trim().min(1).max(100).nullable().optional(),

    city: z.string().trim().min(1).max(100).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;

export const businessIdSchema = z.object({
  id: z.string().uuid(),
});
