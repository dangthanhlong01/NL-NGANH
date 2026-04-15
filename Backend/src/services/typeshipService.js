import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

let createNewTypeShip = async (data) => {
    try {
        if (!data.type || !data.price) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        await db.TypeShip.create({
            type: data.type,
            price: data.price
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })

    } catch (error) {
        throw (error)
    }

}
let getDetailTypeshipById = async (id) => {
    try {
        if (!id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let res = await db.TypeShip.findOne({
            where: { id: id },
        })
        return ({
            errCode: 0,
            data: res
        })
    } catch (error) {
        throw (error)
    }
}
let getAllTypeship = async (data) => {
    try {
        let objectFilter = {}
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }
        if (data.keyword && data.keyword !== '') objectFilter.where = { ...objectFilter.where, type: { [Op.substring]: data.keyword } }
        let res = await db.TypeShip.findAndCountAll(objectFilter)

        return ({
            errCode: 0,
            data: res.rows,
            count: res.count
        })
    } catch (error) {
        throw (error)
    }

}
let updateTypeship = async (data) => {

    try {
        if (!data.id || !data.type || !data.price) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let typeship = await db.TypeShip.findOne({
            where: { id: data.id },
            raw: false
        })
        if (!typeship) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy loại ship !'
            }
        }
        typeship.type = data.type;
        typeship.price = data.price;
        await typeship.save()
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}
let deleteTypeship = async (data) => {
    try {
        if (!data.id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let typeship = await db.TypeShip.findOne({
            where: { id: data.id },
            raw: false
        })
        if (!typeship) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy loại ship !'
            }
        }
        const isUsed = await db.OrderProduct.findOne({ where: { typeShipId: data.id } })
        if (isUsed) {
            return {
                errCode: 2,
                errMessage: 'Loại ship đang được sử dụng, không thể xóa !'
            }
        }
        await typeship.destroy()
        return ({
            errCode: 0,
            errMessage: 'OK'
        })

    } catch (error) {
        throw (error)
    }
}
module.exports = {
    createNewTypeShip: createNewTypeShip,
    getDetailTypeshipById: getDetailTypeshipById,
    getAllTypeship: getAllTypeship,
    updateTypeship: updateTypeship,
    deleteTypeship: deleteTypeship
}