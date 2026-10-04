import * as categoryService from "./category.service";
export async function listCategories(req, res, next) {
    try {
        const categories = await categoryService.listCategories();
        res.status(200).json({
            success: true,
            data: {
                categories,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getCategoryBySlug(req, res, next) {
    try {
        const category = await categoryService.getCategoryBySlug(req.params.slug);
        res.status(200).json({
            success: true,
            data: {
                category,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
