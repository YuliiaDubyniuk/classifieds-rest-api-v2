import type { RequestHandler } from "express";
import prisma from "../../prisma/client.ts";
import type {
  AnnouncementsQuery,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../validators/announcements.validator.ts";

export const getAnnouncements: RequestHandler = async (req, res) => {
  const { page, search, sort } = res.locals
    .validatedQuery as AnnouncementsQuery;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const where = search
    ? {
        title: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const orderBy = {
    createdAt: sort === "oldest" ? ("asc" as const) : ("desc" as const),
  };

  const [announcements, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where,
      skip,
      take: perPage,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  res.status(200).json({
    data: announcements,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  });
};

export const getAnnouncementById: RequestHandler = async (req, res) => {
  const { id } = res.locals.validatedParams as { id: number };

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!announcement) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }

  res.status(200).json(announcement);
};

export const createAnnouncement: RequestHandler = async (req, res) => {
  const { title, description, price, category } =
    req.body as CreateAnnouncementInput;

  const userId = req.user!.sub;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      description,
      price,
      category,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json(announcement);
};

export const updateAnnouncement: RequestHandler = async (req, res) => {
  const { id } = res.locals.validatedParams as { id: number };
  const data = req.body as UpdateAnnouncementInput;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }

  if (announcement.userId !== req.user!.sub) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json(updatedAnnouncement);
};

export const deleteAnnouncement: RequestHandler = async (req, res) => {
  const { id } = res.locals.validatedParams as { id: number };

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }

  if (announcement.userId !== req.user!.sub) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  await prisma.announcement.delete({
    where: { id },
  });

  res.status(204).end();
};
