import {Branch, Customer, DeliveryPartner, Order} from "../../models/index.js";

export const createOrder = async (req, res) => {
    try {
        const {userId} = req.user;
        const {items, branch, totalPrice} = req.body;

        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);

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
                description: err,
            }
        });
    }
}

export const confirmOrder = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {userId} = req.user;
        const {deliveryPersonLocation} = req.body;

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

        const updatedOrder = await order.save();

        return res.status(200).send({
            message: 'Order successfully confirmeed',
            updatedOrder,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to confirm order',
                description: err,
            }
        });
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {userId} = req.user;
        const {status, deliveryPersonLocation} = req.body;

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
        return res.status(200).send({
            message: 'Order successfully updated',
            updatedOrder,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to update order status',
                description: err,
            }
        });
    }
}

export const getOrders = (req, res) => {

}
