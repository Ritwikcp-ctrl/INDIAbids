import { Router } from "express";
import { prisma } from "../lib/prisma";
import { success } from "zod";
const router = Router();
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: "ok",
            sevice: "INDIAbids-api",
        },
    });
});
router.get("/ready", async (req, res, next) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            success: true,
            data: {
                status: "ready",
                database: "connected",
            },
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
