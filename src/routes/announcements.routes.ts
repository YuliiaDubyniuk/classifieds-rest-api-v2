import { Router } from "express";
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcements.controller.ts";
import {
  validateQuery,
  validateParams,
  validateBody,
} from "../middleware/validate.ts";
import {
  announcementsQuerySchema,
  announcementIdSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "../validators/announcements.validator.ts";
import { registry } from "../openapi.ts";
import { authenticate } from "../middleware/authenticate.ts";
import upload from "../middleware/upload.ts";

registry.registerPath({
  method: "get",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Get all announcements",
  request: {
    query: announcementsQuerySchema,
  },
  responses: {
    200: {
      description: "List of announcements",
    },
    400: {
      description: "Validation failed",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Get announcement by ID",
  request: {
    params: announcementIdSchema,
  },
  responses: {
    200: {
      description: "Announcement found",
    },
    400: {
      description: "Invalid announcement ID",
    },
    404: {
      description: "Announcement not found",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Create a new announcement",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              category: {
                type: "string",
                enum: ["sale", "service", "job", "other"],
              },
              image: {
                type: "string",
                format: "binary",
              },
            },
            required: ["title", "description", "price", "category"],
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Announcement created successfully",
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
  method: "patch",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Update an announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementIdSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              category: {
                type: "string",
                enum: ["sale", "service", "job", "other"],
              },
              image: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Announcement updated successfully",
    },
    400: {
      description: "Validation failed",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Access denied",
    },
    404: {
      description: "Announcement not found",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Delete an announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementIdSchema,
  },
  responses: {
    204: {
      description: "Announcement deleted successfully",
    },
    400: {
      description: "Validation failed",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Access denied",
    },
    404: {
      description: "Announcement not found",
    },
  },
});

const router = Router();

router.get("/", validateQuery(announcementsQuerySchema), getAnnouncements);
router.get("/:id", validateParams(announcementIdSchema), getAnnouncementById);
router.post(
  "/",
  authenticate,
  upload.single("image"),
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);
router.patch(
  "/:id",
  authenticate,
  validateParams(announcementIdSchema),
  upload.single("image"),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);
router.delete(
  "/:id",
  authenticate,
  validateParams(announcementIdSchema),
  deleteAnnouncement,
);

export default router;
