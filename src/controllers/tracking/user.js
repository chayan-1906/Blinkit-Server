import {Customer, DeliveryPartner} from "../../models/index.js";

export const updateUser = async (req, res) => {
    try {
        const {userId} = req.user;
        const updateData = req.body;

        const user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);

        if (!user) {
            return reply.status(404).send({
                error: {
                    code: 'userNotFound',
                    message: 'User not found'
                }
            });
        }

        let userModel;
        if (user.role === 'Customer') {
            userModel = Customer;
        } else if (user.role === 'DeliveryPartner') {
            userModel = DeliveryPartner;
        } else {
            return res.status(400).send({
                error: {
                    code: 'invalidRole',
                    message: 'Invalid Role',
                }
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {$set: updateData},
            {new: true, runValidators: true},
        );

        if (!updatedUser) {
            return reply.status(404).send({
                error: {
                    code: 'userNotFound',
                    message: 'User not found'
                }
            });
        }

        return res.send({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        return res.status(403).send({
            error: {
                code: 'unknownError',
                message: 'Failed to update user',
                description: err,
            }
        })
    }
}
