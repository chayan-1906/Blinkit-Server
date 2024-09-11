import {Category} from "../../models/index.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.send({
            message: 'Successfully fetched categories',
            categories,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to fetch categories',
                description: err,
            }
        });
    }
}
