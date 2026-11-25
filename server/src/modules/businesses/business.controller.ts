import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../lib/app-error.js";
import {
  createBusinessSchema,
  updateBusinessSchema,
  businessIdSchema,
} from "./business.schemas.js";
import * as businessService from "./business.service.js";

export async function createBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createBusinessSchema.parse(req.body);
    const business = await businessService.createBusiness(
      req.auth?.userId ?? null,
      input
    );

    res.status(201).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyBusinesses(
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

    const businesses = await businessService.listMyBusinesses(req.auth.userId);

    res.status(200).json({
      success: true,
      data: { businesses },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicBusinessBySlug(
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const business = await businessService.getPublicBusinessBySlug(
      req.params.slug
    );

    res.status(200).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBusinessByManageToken(
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.params;
    if (!token) {
      throw new AppError(400, "TOKEN_REQUIRED", "Manage token is required.");
    }

    const business = await businessService.getBusinessByManageToken(token);

    res.status(200).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    next(error);
  }
}

export async function claimBusinessByManageToken(
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required to claim a listing."
      );
    }

    const { token } = req.params;
    if (!token) {
      throw new AppError(400, "TOKEN_REQUIRED", "Manage token is required.");
    }

    const business = await businessService.claimBusinessByManageToken(
      req.auth.userId,
      token
    );

    res.status(200).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBusiness(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = businessIdSchema.parse(req.params);
    const input = updateBusinessSchema.parse(req.body);

    const manageToken =
      (req.headers["x-manage-token"] as string) || req.body.manageToken;

    const business = await businessService.updateBusiness(
      {
        ownerId: req.auth?.userId,
        manageToken,
      },
      id,
      input
    );

    res.status(200).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    next(error);
  }
}
