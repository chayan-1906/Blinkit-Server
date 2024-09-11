import {getProductsByCategoryId} from "../controllers/product/product.js";
import {getAllCategories} from "../controllers/product/category.js";

export const categoryRoutes = async (fastify, options) => {
    fastify.get('/categories', getAllCategories);
}

export const productRoutes = async (fastify, options) => {
    fastify.get('/products', getProductsByCategoryId);
}
