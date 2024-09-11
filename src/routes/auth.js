import {fetchUser, loginCustomer, loginDeliveryPartner, refreshToken} from "../controllers/auth/auth.js";
import {verifyToken} from "../middleware/auth.js";
import {updateUser} from "../controllers/tracking/user.js";

export const authRoutes = async (fastify, options) => {
    fastify.post('/customer/login', loginCustomer);                 // /customer/login (POST)
    fastify.post('/delivery/login', loginDeliveryPartner);          // /delivery/login (POST)
    fastify.post('/refresh-token', refreshToken);                   // /refresh-token (POST)
    // fastify.get('/user', {preHandler: [verifyToken]}, fetchUser);
    fastify.get('/user', {preHandler: [verifyToken]}, fetchUser);   //  /user (GET) with jwt
    fastify.patch('/user', {preHandler: [verifyToken]}, updateUser);// /user (PATCH) with jwt
}
