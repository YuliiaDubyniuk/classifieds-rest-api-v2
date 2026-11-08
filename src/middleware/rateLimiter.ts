import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  statusCode: 429,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export default authLimiter;
