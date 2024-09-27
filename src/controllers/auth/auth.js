import {Customer, DeliveryPartner} from "../../models/index.js";
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    const accessToken = jwt.sign({userId: user._id, role: user.role}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });

    const refreshToken = jwt.sign({userId: user._id, role: user.role}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });

    return {accessToken, refreshToken}
}

export const loginCustomer = async (req, res) => {
    console.log('loginCustomer called 🔑', req.body);
    try {
        const {phoneNumber} = req.body;

        /** find from db by phone */
        let customer = await Customer.findOne({phoneNumber});
        if (!customer) {
            /** create customer */
            customer = new Customer({phoneNumber, role: 'Customer', isActivated: true});
            await customer.save();
        }

        const {accessToken, refreshToken} = generateToken(customer);

        console.log('success in loginCustomer ✅: accessToken -', accessToken);
        console.log('success in loginCustomer ✅: refreshToken -', refreshToken);
        return res.send({
            message: customer ? 'Login Successful' : 'Customer created and logged in',
            accessToken,
            refreshToken,
            customer,
        });
    } catch (err) {
        console.log('err in loginCustomer ❌', err);
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Customer login failed',
                description: err.message,
            }
        });
    }
}

export const loginDeliveryPartner = async (req, res) => {
    console.log('loginDeliveryPartner called 🔑', req.body);
    try {
        const {email, password} = req.body;

        /** find from db by email */
        let deliveryPartner = await DeliveryPartner.findOne({email});
        if (!deliveryPartner) {
            return res.status(404).send({
                error: {
                    code: 'deliveryPartnerNotFound',
                    message: 'Delivery Partner not found',
                },
            });
        }

        /** match password */
        const isMatch = password === deliveryPartner.password;
        if (!isMatch) {
            return res.status(400).send({
                error: {
                    code: 'invalidCredentials',
                    message: 'Invalid Credentials',
                },
            });
        }

        const {accessToken, refreshToken} = generateToken(deliveryPartner);

        console.log('success in loginDeliveryPartner ✅: accessToken -', accessToken);
        console.log('success in loginDeliveryPartner ✅: refreshToken -', refreshToken);
        return res.send({
            message: 'Login Successful',
            deliveryPartner,
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.log('err in loginDeliveryPartner ❌', err);
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Delivery Partner login failed',
                description: err.message,
            }
        });
    }
}

export const refreshToken = async (req, res) => {
    console.log('refreshToken called 🔑', req.body);
    const {refreshToken} = req.body;
    /** missing refresh token */
    if (!refreshToken) {
        return res.status(401).send({
            error: {
                code: 'missingRefreshToken',
                message: 'Refresh token required',
            }
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        let user;
        const role = decoded.role;

        /** find user */
        if (role === 'Customer') {
            user = await Customer.findById(decoded.userId);
        } else if (role === 'DeliveryPartner') {
            user = await DeliveryPartner.findById(decoded.userId);
        } else {
            return res.status(403).send({
                error: {
                    code: 'invalidRole',
                    message: 'Invalid Role',
                }
            });
        }

        /** user not found */
        if (!user) {
            return res.status(403).send({
                error: {
                    code: 'invalidRefreshToken',
                    message: 'Invalid Refresh Token',
                }
            });
        }

        /** not activated */
        if (!user.isActivated) {
            return res.status(400).send({
                error: {
                    code: 'deactivated',
                    message: 'User is not activated',
                }
            });
        }

        const {accessToken, refreshToken: newRefreshToken} = generateToken(user);
        return res.send({
            message: 'Token Refreshed',
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        console.log('err in refreshToken ❌', err);
        return res.status(403).send({
            error: {
                code: 'unknownError',
                message: 'Invalid Refresh Token',
                description: err.message,
            }
        });
    }
}

export const fetchUser = async (req, reply) => {
    console.log('fetchUser called 🔑', req.user);
    try {
        console.log('fetchUser: req.user -', req.user);
        const {userId, role} = req.user;
        let user;

        /** find user */
        if (role === 'Customer') {
            user = await Customer.findById(userId);
        } else if (role === 'DeliveryPartner') {
            user = await DeliveryPartner.findById(userId);
        } else {
            return reply.status(403).send({
                error: {
                    code: 'invalidRole',
                    message: 'Invalid Role'
                }
            });
        }

        /** user not found */
        if (!user) {
            return reply.status(404).send({
                error: {
                    code: 'userNotFound',
                    message: 'User not found'
                }
            });
        }

        console.log('user found ✅:', user);
        return reply.status(200).send({
            message: 'User fetched successfully',
            user,
        });
    } catch (err) {
        console.log('err in fetchUser ❌', err);
        return reply.status(500).send({
            error: {
                code: 'unknownError',
                message: 'An error occurred',
                description: err.message,
            }
        });
    }
}
