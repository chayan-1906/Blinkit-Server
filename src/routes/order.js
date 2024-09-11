import {verifyToken} from "../middleware/auth.js";
import {confirmOrder, createOrder, getOrderById, getOrders, updateOrderStatus} from "../controllers/order/order.js";

export const orderRoutes = async (fastify, options) => {
    fastify.addHook('preHandler', async (request, response) => {
        const isAuthenticated = await verifyToken(request, response);
        if (!isAuthenticated) {
            return response.status(401).send({
                error: {
                    code: 'unauthenticated',
                    message: 'You\'re not authenticated',
                    description: response,
                }
            });
        }
    });

    fastify.post('/orders', createOrder);               // /orders (POST)  with jwt
    fastify.get('/orders/all', getOrders);              // /orders/all (GET)  with jwt
    fastify.patch('/orders', updateOrderStatus);        // /orders?orderId={orderId} (PATCH)  with jwt
    fastify.post('/orders/confirm', confirmOrder);      // /orders/confirm?orderId={orderId} (POST)  with jwt
    fastify.get('/orders', getOrderById);               // /orders?orderId={orderId} (GET)  with jwt
}
