import { z } from "zod";

// validation schema for user registration
export const registerSchema = z.object({
  username: z.string().trim().min(3, "Username is required").max(30),

  email: z
    .string()
    .trim()
    .pipe(z.email({ message: "Invalid email format" })),

  password: z.string().min(6, "Password is required"),

  name: z.string().trim().min(2, "Name is required"),
});

// validation schema for user login
export const loginSchema = z.object({
  username: z.string().trim().min(3, "Username is required"),

  password: z.string().min(1, "Password is required"),
});

// TypeScript types inferred from Zod schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// check token presence in the request body
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshInput = z.infer<typeof refreshSchema>;
