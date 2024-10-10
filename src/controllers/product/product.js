import {Category, Product} from "../../models/index.js";

export const getProductsByCategoryId = async (req, res) => {
    console.log('getProductsByCategoryId 🔑 called with categoryId:', req.query.categoryId);
    try {
        const {categoryId} = req.query;

        if (!categoryId) {
            return res.status(400).send({
                error: {
                    code: 'invalidCategoryId',
                    message: 'CategoryId is required'
                }
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send({
                error: {
                    code: 'categoryNotFound',
                    message: 'Category not found'
                }
            });
        }

        const products = await Product.find({category: categoryId})
            .select('-category')    // meaning - skip category object from product object in response
            .exec();

        console.log(`products fetched for ${category.name} ✅`, products);
        return res.send({
            message: `Successfully fetched products for ${category.name}`,
            category,
            products,
        });
    } catch (err) {
        return res.status(500).send({
            error: {
                code: 'unknownError',
                message: 'Failed to fetch categories',
                description: err.message,
            }
        });
    }
}
