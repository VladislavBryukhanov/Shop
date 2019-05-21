const Product = require('../db/models/Product');
const Category = require('../db/models/Category');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const sharp = require('sharp');
const { productFileSizes } = require('../common/constants');

module.exports.fetchProducts = async (request, response) => {
    const offset = Number(request.params['offset']);
    const limit = Number(request.params['limit']);

    try {
        const product = await Product.findAndCountAll({
            offset,
            limit,
            include: [
                { model: Category }
            ]
        });
        response.send(product);
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};

module.exports.createProduct = async (request, response) => {
    const { file } = request;

    try {
        if (file) {
            request.body.previewPhoto = await savePreviewWithThumbnail(file);
        }

        const product = await Product.create(request.body);
        response.send(product);
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};

module.exports.updateProduct = async (request, response) => {
    const { id } = request.body;
    const { file } = request;

    try {
        if (file) {
            request.body.previewPhoto = await savePreviewWithThumbnail(file);
            await deletePreviewPhoto(id);
        }

        await Product.update(
            request.body,
            { where: { id } }
        );
        response.sendStatus(200);
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};

module.exports.deleteProduct = async (request, response) => {
    const id = request.params['id'];

    try {
        await deletePreviewPhoto(id);
        await Product.destroy({ where: { id }});
        response.sendStatus(200);
    } catch (err) {
        response
            .status(500)
            .send(err.message);
    }
};

const savePreviewWithThumbnail = (file) => {
    const dirPath = path.join( __dirname, `/../public/preview_photo/`);
    const fileName = uuid.v1() + path.extname(file.originalname);

    const fileResizing = sharp(file.buffer)
        .resize(null, productFileSizes.thumbnail.height)
        .toFile(`${dirPath}/thumbnail/${fileName}`);

    const fileSaving = new Promise((resolve, reject) => {
        fs.writeFile(
            dirPath + fileName,
            file.buffer,
            (err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            }
        );
    });

    return Promise.all([fileResizing, fileSaving])
        .then(() => fileName);
};

const deletePreviewPhoto = async (id) => {
    const product = await Product.findByPk(id);
    const { previewPhoto } = product;

    if (previewPhoto) {
        const dirPath = path.join( __dirname, `/../public/preview_photo/`);
        const files = [
            dirPath + previewPhoto,
            `${dirPath}/thumbnail/${previewPhoto}`
        ];

        files.forEach(file => {
            fs.unlink(file, (err) => err && console.error(err));
        });
    }
};
