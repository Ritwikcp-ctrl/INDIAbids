import { AppError } from "../../lib/app-error";
import { createBoardSchema, boardKeySchema, listBoardsQuerySchema, } from "./board.schema";
import * as boardService from "./board.service";
import { serializeBoard, } from "./board.serializer";
export async function createBoard(req, res, next) {
    try {
        const input = createBoardSchema.parse(req.body);
        const board = await boardService.createfBoard(input);
        res.status(201).json({
            success: true,
            data: {
                board: serializeBoard(board),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listBoards(req, res, next) {
    try {
        const query = listBoardsQuerySchema.parse(req.query);
        const boards = await boardService.listBoards(query);
        res.status(200).json({
            success: true,
            data: {
                boards: boards.map(serializeBoard),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getBoardByKey(req, res, next) {
    try {
        const { key } = boardKeySchema.parse(req.params);
        const board = await boardService.getBoardByKey(key);
        res.status(200).json({
            success: true,
            data: {
                board: serializeBoard(board),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
