import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from "../controllers/auth.controller.ts";
import { validateBody } from "../middleware/validate.ts";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validator.ts";
import { registry } from "../openapi.ts";
import { authenticate } from "../middleware/authenticate.ts";

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: { description: "User registered successfully" },
    400: { description: "Validation failed" },
    409: { description: "Username or email already taken" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: { description: "User logged in successfully" },
    400: { description: "Validation failed" },
    401: { description: "Invalid username or password" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access and refresh tokens",
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshSchema,
        },
      },
    },
  },
  responses: {
    200: { description: "Tokens refreshed successfully" },
    400: { description: "Validation failed" },
    401: { description: "Invalid or expired refresh token" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout",
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: "Logged out successfully",
    },
    400: {
      description: "Validation failed",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Get current user profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current user profile",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "User not found",
    },
  },
});

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
