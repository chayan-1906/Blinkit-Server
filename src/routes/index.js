import {authRoutes} from "./auth.js";
import {categoryRoutes, productRoutes} from "./product.js";
import {orderRoutes} from "./order.js";

const prefix = '/api';
// const prefix = '/';

export const registerRoutes = async (fastify) => {
    fastify.get('/', function (request, reply) {
        return {root: true}
    });
    fastify.register(authRoutes, {prefix: prefix});
    fastify.register(categoryRoutes, {prefix: prefix});
    fastify.register(productRoutes, {prefix: prefix});
    fastify.register(orderRoutes, {prefix: prefix});
}
