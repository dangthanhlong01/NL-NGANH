'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderDetail extends Model {
        static associate(models) {
              OrderDetail.belongsTo(models.ProductDetail, { foreignKey: 'productId' })
        }
    };
    OrderDetail.init({
        orderId: DataTypes.INTEGER,
        productId: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        realPrice: DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'OrderDetail',
    });
    return OrderDetail;
};