import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../lib/app-error";
import {
  createBoardSchema,
  boardKeySchema,
  listBoardsQuerySchema,
} from "./board.schema";

import * as boardService from "./board.service";

export async function createBoard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createBoardSchema.parse(req.body);

    const board = await boardService.createfBoard(input);

    res.status(201).json({
      success: true,
      data: {
        board,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listBoards(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = listBoardsQuerySchema.parse(req.query);

    const boards = await boardService.listBoards(query);

    res.status(200).json({
      success: true,
      data: {
        boards,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBoardByKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { key } = boardKeySchema.parse(req.params);

    const board = await boardService.getBoardByKey(key);

    res.status(200).json({
      success: true,
      data: {
        board,
      },
    });
  } catch (error) {
    next(error);
  }
}
