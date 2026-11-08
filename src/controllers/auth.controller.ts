import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client.ts";
import type {
  RegisterInput,
  LoginInput,
  RefreshInput,
} from "../validators/auth.validator.ts";
import logger from "../logger.ts";

export const register: RequestHandler = async (req, res) => {
  const { username, email, password, name } = req.body as RegisterInput;

  // check if username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    res.status(409).json({
      error: "Username or email already taken",
    });
    return;
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  // generate tokens
  const accessToken = jwt.sign(
    { sub: user.id, type: "access", jti: randomUUID() },
    secret,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: "refresh", jti: randomUUID() },
    secret,
    {
      expiresIn: "7d",
    },
  );

  // save refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  logger.info({ userId: user.id }, "New user registered");

  res.status(201).json({
    user,
    accessToken,
    refreshToken,
  });
};

export const login: RequestHandler = async (req, res) => {
  const { username, password } = req.body as LoginInput;

  // Find user by username
  const user = await prisma.user.findUnique({
    where: { username },
  });

  // Check if user exists
  if (!user) {
    res.status(401).json({
      error: "Invalid credentials",
    });
    return;
  }

  // Compare password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({
      error: "Invalid credentials",
    });
    return;
  }

  // Get JWT secret
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign(
    { sub: user.id, type: "access", jti: randomUUID() },
    secret,
    {
      expiresIn: "15m",
    },
  );
  const refreshToken = jwt.sign(
    { sub: user.id, type: "refresh", jti: randomUUID() },
    secret,
    {
      expiresIn: "7d",
    },
  );

  // Replace old refresh tokens with a new one
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });
  });

  logger.info({ userId: user.id }, "User logged in");

  // Return user data and tokens
  res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  });
};

export const refresh: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body as RefreshInput;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  let payload: jwt.JwtPayload;

  try {
    const decoded = jwt.verify(refreshToken, secret);

    if (typeof decoded === "string") {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    payload = decoded;
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  if (payload.type !== "refresh" || typeof payload.sub !== "number") {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  const userId = payload.sub;

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.userId !== userId) {
    res.status(401).json({ error: "Refresh token not found or revoked" });
    return;
  }

  const newAccessToken = jwt.sign(
    { sub: userId, type: "access", jti: randomUUID() },
    secret,
    {
      expiresIn: "15m",
    },
  );

  const newRefreshToken = jwt.sign(
    { sub: userId, type: "refresh", jti: randomUUID() },
    secret,
    {
      expiresIn: "7d",
    },
  );

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.delete({
      where: { token: refreshToken },
    });

    await tx.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId,
      },
    });
  });

  res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

export const logout: RequestHandler = async (req, res) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId: req.user!.sub,
    },
  });

  res.status(204).end();
};

export const getMe: RequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user!.sub,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json(user);
};
