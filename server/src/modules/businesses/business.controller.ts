import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../lib/app-error";

import {
  createBusinessSchema,
  updateBusinessSchema,
  businessIdSchema,
} from "./business.schemas";

import * as businessService from "./business.service";

export async function createBusiness(
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

    const input = createBusinessSchema.parse(req.body);

    const business = await businessService.createBusiness(
      req.auth.userId,
      input
    );

    res.status(201).json({
      success: true,
      data: {
        business,
      },
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
      data: {
        businesses,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicBusinessBySlug(
  req: Request<{slug:string}>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const business = await businessService.getPublicBusinessBySlug(
      req.params.slug
    );

    res.status(200).json({
      success: true,
      data: {
        business,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBusiness(
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

    const { id } = businessIdSchema.parse(req.params);

    const input = updateBusinessSchema.parse(req.body);

    const business = await businessService.updateBusiness(
      req.auth.userId,
      id,
      input 
    );

    res.status(200).json({
      success: true,
      data: {
        business,
      },
    });
  } catch (error) {
    next(error);
  }
}
