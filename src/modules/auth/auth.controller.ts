import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../lib/app-error";
import { loginSchema, registerSchema } from "./auth.schema";

import * as authService from "./auth.services";

import {
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
} from "./auth-cookie";
import { prisma } from "../../lib/prisma";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    setRefreshCookie(res, result.refreshToken);
    res.setHeader("Cache-Control", "no-store");

    res.status(201).json({
      success: true,

      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);

    const result = await authService.login(input);

    setRefreshCookie(res, result.refreshToken);

    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
      success: true,

      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!token) {
      throw new AppError(
        401,
        "REFRESH_TOKEN_REQUIRED",
        "Refresh token is required."
      );
    }

    const result = await authService.refresh(token);

    setRefreshCookie(res, result.refreshToken);

    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
      success: true,

      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (token) {
      await authService.logout(token);
    }

    clearRefreshCookie(res);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required."
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.auth.userId,
      },

      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        401,
        "USER_NOT_FOUND",
        "User account could not be found."
      );
    }
    res.setHeader("Cache-Controller", "no-store");

    res.status(200).json({
      success: true,

      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}
