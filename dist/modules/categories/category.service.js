import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";
export async function listCategories() {
    return prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
export async function getCategoryBySlug(slug) {
    const category = await prisma.category.findUnique({
        where: {
            slug,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!category) {
        throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found.");
    }
    return category;
}
