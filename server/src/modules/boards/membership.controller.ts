import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../../lib/app-error";

import {
  boardIdSchema,
  joinBoardSchema,
} from "./membership.schemas";

import * as membershipService
  from "./membership.service";

export async function joinBoard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) {
      throw new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required.",
      );
    }

    const { boardId } =
      boardIdSchema.parse(
        req.params,
      );

    const input =
      joinBoardSchema.parse(
        req.body,
      );

    const membership =
      await membershipService.joinBoard(
        req.auth.userId,
        boardId,
        input,
      );

    res.status(200).json({
      success: true,
      data: {
        membership,
      },
    });
  } catch (error) {
    next(error);
  }
}