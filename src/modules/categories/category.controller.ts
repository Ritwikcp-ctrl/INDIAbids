import type {
    Request,
    Response,
    NextFunction,
} from "express";

import * as categoryService from "./category.service";

export async function listCategories (
    req:Request,res:Response,next:NextFunction,
): Promise<void> {
    try {
        const categories = await categoryService.listCategories();

        res.status(200).json({
            success:true,
            data: {
                categories,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function getCategoryBySlug(req:Request<{slug:string}>,res:Response,next:NextFunction,):Promise<void> {
    try {
        const category = await categoryService.getCategoryBySlug(req.params.slug,);
        res.status(200).json({
            success:true,
            data:{
                category,
            },
        });

    } catch(error) {
        next(error);

    }
}