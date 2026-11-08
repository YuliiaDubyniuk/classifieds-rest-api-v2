import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.ts";
import prisma from "../prisma/client.ts";
import bcrypt from "bcrypt";

// Integration tests

describe("Auth", () => {
  beforeAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("should register a new user and return tokens", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "test_user",
        email: "test@mail.com",
        password: "Password123!",
        name: "Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body.user.username).toBe("test_user");
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      const user = await prisma.user.findUnique({
        where: { username: "test_user" },
      });

      expect(user).not.toBeNull();
    });
  });

  describe("POST /auth/login", () => {
    it("should return 401 when password is incorrect", async () => {
      const response = await request(app).post("/auth/login").send({
        username: "test_user",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        username: "test_user",
        password: "Password123!",
      });

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe("test_user");
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });
  });
});

// Unit tests

describe("Password hashing", () => {
  it("should hash a password", async () => {
    const password = "Password123!";

    const hashedPassword = await bcrypt.hash(password, 10);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword).toBeDefined();
  });

  it("should compare password with its hash correctly", async () => {
    const password = "Password123!";

    const hashedPassword = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare(password, hashedPassword);
    const isInvalid = await bcrypt.compare("WrongPassword", hashedPassword);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});
