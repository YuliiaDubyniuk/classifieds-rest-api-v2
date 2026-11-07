import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: {
          body: result.error.issues.map((issue) => issue.message),
        },
      });
    }

    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: {
          params: result.error.issues.map((issue) => issue.message),
        },
      });
    }

    res.locals.validatedParams = result.data;

    next();
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: {
          query: result.error.issues.map((issue) => issue.message),
        },
      });
    }

    res.locals.validatedQuery = result.data;

    next();
  };
};
