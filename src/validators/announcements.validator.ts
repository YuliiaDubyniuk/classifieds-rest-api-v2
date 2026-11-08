import { z } from "zod";

export const announcementIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const announcementsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().trim().default(""),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});
export type AnnouncementsQuery = z.infer<typeof announcementsQuerySchema>;

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(5, "Title is required").max(50),
  description: z.string().trim().min(10, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.enum(["sale", "service", "job", "other"]),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = z.object({
  title: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(5, "Title is required").max(50).optional(),
  ),
  description: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(10, "Description is required").optional(),
  ),
  price: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().positive("Price must be positive").optional(),
  ),
  category: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["sale", "service", "job", "other"]).optional(),
  ),
});
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
