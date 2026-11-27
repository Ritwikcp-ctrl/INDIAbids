import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";

import { AppError } from "../../lib/app-error";
import { env } from "../../config/env";
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
        name: true,
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
    res.setHeader("Cache-Control", "no-store");

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

const OAUTH_STATE_COOKIE = "ib_oauth_state";

function getFrontendBaseUrl(): string {
  if (env.FRONTEND_URL) return env.FRONTEND_URL.replace(/\/$/, "");
  const firstOrigin = env.CORS_ORIGIN.split(",")[0]?.trim();
  return (firstOrigin || "http://localhost:3000").replace(/\/$/, "");
}

function sanitizeNextPath(raw: unknown): string {
  if (typeof raw !== "string") return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function authProviders(
  _req: Request,
  res: Response
): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      manual: true,
      google: Boolean(
        env.GOOGLE_CLIENT_ID &&
          env.GOOGLE_CLIENT_SECRET &&
          env.GOOGLE_REDIRECT_URI
      ),
    },
  });
}

export async function googleAuthStart(
  req: Request,
  res: Response
): Promise<void> {
  const frontendUrl = getFrontendBaseUrl();
  const nextPath = sanitizeNextPath(req.query.next);

  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REDIRECT_URI
  ) {
    res.redirect(`${frontendUrl}/login?error=google_not_configured`);
    return;
  }

  const stateToken = randomBytes(24).toString("base64url");
  res.cookie(
    OAUTH_STATE_COOKIE,
    JSON.stringify({ state: stateToken, next: nextPath }),
    {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60 * 1000,
    }
  );

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", stateToken);
  authUrl.searchParams.set("prompt", "select_account");

  res.redirect(authUrl.toString());
}

export async function googleAuthCallback(
  req: Request,
  res: Response
): Promise<void> {
  const frontendUrl = getFrontendBaseUrl();
  const rawStateCookie = req.cookies?.[OAUTH_STATE_COOKIE];

  res.clearCookie(OAUTH_STATE_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REDIRECT_URI
  ) {
    res.redirect(`${frontendUrl}/login?error=google_not_configured`);
    return;
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";

  let expectedState = "";
  let nextPath = "/dashboard";
  try {
    const parsed = JSON.parse(rawStateCookie || "{}") as {
      state?: string;
      next?: string;
    };
    expectedState = parsed.state || "";
    nextPath = sanitizeNextPath(parsed.next);
  } catch {
    expectedState = "";
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    res.redirect(`${frontendUrl}/login?error=google_state_invalid`);
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenRes.ok || !tokenJson.access_token) {
      res.redirect(`${frontendUrl}/login?error=google_token_failed`);
      return;
    }

    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });

    const profile = (await userRes.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
    };

    if (!userRes.ok || !profile.sub || !profile.email || !profile.email_verified) {
      res.redirect(`${frontendUrl}/login?error=google_unverified_email`);
      return;
    }

    const result = await authService.loginWithGoogle({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
    });

    setRefreshCookie(res, result.refreshToken);
    res.redirect(`${frontendUrl}${nextPath}`);
  } catch {
    res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
}
