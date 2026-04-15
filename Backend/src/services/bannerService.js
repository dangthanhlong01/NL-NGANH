import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

// Tạo banner mới
let createNewBanner = async (data) => {
    try {
        if (!data.image || !data.description || !data.name) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu thông tin bắt buộc !'
            })
        }
        await db.Banner.create({
            name: data.name,
            description: data.description,
            image: data.image,
            statusId: 'S1'
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })

    } catch (error) {
        throw (error)
    }
};

//Lay chi tiet banner
let getDetailBanner = async (id) => {
    try {
        if (!id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu thông tin bắt buộc !'
            })
        }
        let res = await db.Banner.findOne({
            where: { id: id },
        })
        if (!res) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy banner !'
            }
        }
        if (res.image) {
            res.image = Buffer.from(res.image).toString('utf8');
        }
        return ({
            errCode: 0,
            data: res 
        })

    } catch (error) {
        throw (error)
    }
}

// Lay tat ca banner
let getAllBanner = async (data) => {
    try {
        let objectFilter = {
            where: { statusId: 'S1' },
        }
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }
        if (data.keyword && data.keyword !== '') objectFilter.where = { ...objectFilter.where, name: { [Op.substring]: data.keyword } }
        let res = await db.Banner.findAndCountAll(objectFilter);
        res.rows.forEach(item => {
            if (item.image) {
                item.image = Buffer.from(item.image).toString('utf8');
            }
        })
        return ({
            errCode: 0,
            data: res.rows,
            count: res.count
        })
    } catch (error) {
        throw (error)
    }
}
// Cap nhat banner
let updateBanner = async (data) => {
    try {
        if (!data.id || !data.image || !data.description || !data.name) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let banner = await db.Banner.findOne({
            where: { id: data.id },
            raw: false,
        })
        if (!banner) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy banner !'
            }
        }
        banner.name = data.name;
        banner.description = data.description;
        banner.image = data.image;
        await banner.save()
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}

// Xoa banner
let deleteBanner = async (data) => {
    try {
        if (!data.id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu thông tin bắt buộc !'
            })
        }
        let banner = await db.Banner.findOne({
            where: { id: data.id },
            raw: false,
        })
        if (!banner) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy banner !'
            }
        }
        await banner.destroy();
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}
module.exports = {
    createNewBanner: createNewBanner,
    getDetailBanner: getDetailBanner,
    getAllBanner: getAllBanner,
    updateBanner: updateBanner,
    deleteBanner: deleteBanner
}