'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class AddressUser extends Model {
        
        static associate(models) {

        }
    };
    AddressUser.init({
        userId: DataTypes.INTEGER,
        shipName: DataTypes.STRING,
        shipAdress: DataTypes.STRING,
        shipEmail: DataTypes.STRING,
        shipPhonenumber: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'AddressUser',
    });
    return AddressUser;
};