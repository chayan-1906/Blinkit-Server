import {Branch, Customer, DeliveryPartner, Order} from "../../models/index.js";

export const createOrder = async (req, res) => {
    try {
        const {userId} = req.user;
        const {items, branch, totalPrice} = req.body;

        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);

        // console.log('deliveryPartner location:', customerData.liveLocation);
        // console.log('branchData location:', branchData.liveLocation);

        if (!customerData) {
            return res.status(404).send({
                error: {
                    code: 'customerNotFound',
                    message: 'Customer not found'
                }
            });
        }

        const newOrder = new Order({
            customer: userId,
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count,
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || 'No address available',
            },
            pickupLocation: {
                latitude: branchData.liveLocation.latitude,
                longitude: branchData.liveLocation.longitude,
                address: branchData.address || 'No address available',
            },
        });

        const savedOrder = await newOrder.save();

        return res.status(201).send({
            message: 'Order successfully created',
            savedOrder,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to create order',
                description: err.message,
            }
        });
    }
}

export const confirmOrder = async (req, res) => {
    try {
        const {orderId} = req.query;
        const {userId} = req.user;
        const {deliveryPersonLocation} = req.body;

        console.log(orderId);

        const deliveryPartner = await DeliveryPartner.findById(userId);
        if (!deliveryPartner) {
            return res.status(404).send({
                error: {
                    code: 'deliveryPartnerNotFound',
                    message: 'Delivery Partner not found'
                }
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send({
                error: {
                    code: 'orderNotFound',
                    message: 'Order not found'
                }
            });
        }
        if (order.status !== 'available') {
            return res.status(400).send({
                error: {
                    code: 'notAvailable',
                    message: 'Order is not available'
                }
            });
        }

        order.status = 'confirmed';

        order.deliveryPartner = userId;
        order.deliveryPartnerLocation = {
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation?.longitude,
            address: deliveryPersonLocation?.address || '',
        };

        req.server.io.to(orderId).emit('orderConfirmed', order);

        const updatedOrder = await order.save();

        return res.status(200).send({
            message: 'Order successfully confirmed',
            updatedOrder,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to confirm order',
                description: err.message,
            }
        });
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const {orderId} = req.query;
        const {userId} = req.user;
        const {status, deliveryPersonLocation} = req.body;

        if (!['available', 'confirmed', 'arriving', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).send({
                error: {
                    code: 'invalidStatus',
                    message: 'Order status is invalid'
                }
            });
        }

        const deliveryPartner = await DeliveryPartner.findById(userId);
        if (!deliveryPartner) {
            return res.status(404).send({
                error: {
                    code: 'deliveryPartnerNotFound',
                    message: 'Delivery Partner not found'
                }
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send({
                error: {
                    code: 'orderNotFound',
                    message: 'Order not found'
                }
            });
        }
        if (['cancelled', 'delivered'].includes(order.status)) {
            return res.status(400).send({
                error: {
                    code: 'cantUpdated',
                    message: 'Order can\'t be updated'
                }
            });
        }
        if (order.deliveryPartner.toString() !== userId) {
            return res.status(403).send({
                error: {
                    code: 'invalidDeliveryPartner',
                    message: 'Someone else already assigned for delivery'
                }
            });
        }

        order.status = status;
        order.deliveryPartnerLocation = deliveryPersonLocation;

        const updatedOrder = await order.save();

        req.server.io.to(orderId).emit('liveTrackingUpdates', order);

        return res.status(200).send({
            message: 'Order successfully updated',
            updatedOrder,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to update order status',
                description: err.message,
            }
        });
    }
}

export const getOrders = async (req, res) => {
    try {
        const {status, customerId, deliveryPartnerId, branchId} = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }
        if (customerId) {
            query.customer = customerId;
        }
        if (deliveryPartnerId) {
            query.deliveryPartner = deliveryPartnerId;
        }
        if (branchId) {
            query.branch = branchId;
        }

        const orders = await Order.find(query).populate('customer branch items.item deliveryPartner');
        return res.status(200).send({
            message: 'Orders successfully fetched',
            count: orders.length,
            orders,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to fetch orders',
                description: err.message,
            }
        });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const {orderId} = req.query;

        if (!orderId) {
            return res.status(400).send({
                error: {
                    code: 'invalidOrderId',
                    message: 'OrderId is required'
                }
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send({
                error: {
                    code: 'orderNotFound',
                    message: 'Order not found'
                }
            });
        }

        return res.status(200).send({
            message: 'Order successfully fetched',
            order,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to fetch order',
                description: err.message,
            }
        });
    }
}
