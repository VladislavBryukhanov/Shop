const sequelize = require('sequelize');
const User = require('../db/models/User');
const Cart = require('../db/models/Cart');
const Product = require('../db/models/Product');

module.exports.fetchShoppingCart = async (request, response) => {
    try {
        const productsIds = await Cart.findAll({
            attributes: ['ProductId'],
            where: { UserId: request.user.id }
        }).then(res =>
            res.map(prod => prod.ProductId));

        const { totalCost } = await Product.findOne({
            where: { id: productsIds },
            attributes: [[sequelize.fn('sum', sequelize.col('Products.price')), 'totalCost']],
            raw : true,
        });

        response.send({ productsIds, totalCost });
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};

module.exports.fetchCartProducts = async (request, response) => {
    const offset = Number(request.params['offset']);
    const limit = Number(request.params['limit']);

    try {
        const user = await User.findByPk(request.user.id);
        const cart = await user.getProducts({
            offset,
            limit
        });

        response.send(cart);
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};

module.exports.insertProduct = async (request, response) => {
    const ProductId = parseInt(request.body.productId);

    try {
        const user = await User.findByPk(request.user.id);
        const prod = await user.addProduct(ProductId);

        if (!prod) {
            response
                .status(400)
                .send('Such product already inside shopping cart');
        }

        response.sendStatus(201);
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};

module.exports.excludeProduct = async (request, response) => {
    const ProductId = parseInt(request.params.id);

    try {
        const user = await User.findByPk(request.user.id);
        const prod = await user.removeProduct(ProductId);

        if (!prod) {
            response
                .status(400)
                .send('Such product already excluded from shopping cart');
        }

        response.sendStatus(200);
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};
