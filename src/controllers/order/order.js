import {Branch, Customer, Order} from "../../models/index.js";

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


