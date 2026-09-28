import { z } from "zod";

const locationText = z.string().trim().min(1).max(100);

export const createBoardSchema = z
  .object({
    categoryId: z.string().uuid(),

    country: z
      .string()
      .trim()
      .length(2)
      .transform((value) => value.toUpperCase())
      .default("IN"),

    state: locationText.optional(),

    city: locationText.optional(),
  })
  .refine(
    (data) => {
      return !data.city || Boolean(data.state);
    },
    {
      message: "State is required when city is provided.",
      path: ["state"],
    }
  )
  .refine((data) => data.country === "IN", {
    message: "Only India boards are supported in the MVP.",
    path: ["country"],
  });

export const boardKeySchema = z.object({
  key: z.string().trim().min(1).max(250),
});

export const listBoardsQuerySchema = z.object({
  category: z.string().trim().toLowerCase().max(100).optional(),

  state: z.string().trim().max(100).optional(),

  city: z.string().trim().max(100).optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export type ListBoardsQuery = z.infer<typeof listBoardsQuerySchema>;
