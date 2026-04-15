import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

// tao nha cung cap moi
let createNewSupplier = async (data) => {
        try {
            if (!data.name || !data.address || !data.phonenumber || !data.email) {
                return({
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt buộc !'
                })
            }  
                await db.Supplier.create({
                    name: data.name,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    email: data.email,
                })
                return ({
                    errCode: 0,
                    errMessage: 'OK'
                })
        } catch (error) {
            throw (error)
        }
    
}

// lay chi tiet nha cung cap theo id
let getDetailSupplierById = async (id) => {
    
        try {
            if (!id) {
                return ({
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt buộc !'
                })
            }
                let res = await db.Supplier.findOne({
                    where: { id: id }
                  
                })
                return ({
                    errCode: 0,
                    data: res
                })
        } catch (error) {
            throw (error)
        }  
}

// lay tat ca nha cung cap
let getAllSupplier = async (data) => {
        try {
            let objectFilter = {}
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }
            if(data.keyword && data.keyword !== '') objectFilter.where = {...objectFilter.where, name: {[Op.substring]: data.keyword  } }
            let res = await db.Supplier.findAndCountAll(objectFilter)    
            return ({
                errCode: 0,
                data: res.rows,
                count: res.count
            })
        } catch (error) {
            throw (error)
        }
}

// cap nhat nha cung cap
let updateSupplier = async (data) => {
        try {
            if (!data.id ||!data.name || !data.address || !data.phonenumber || !data.email) {
                return ({
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt  !'
                })
            }  
                let supplier = await db.Supplier.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (!supplier) {
                    return {
                        errCode: -1,
                        errMessage: 'Không tìm thấy nhà cung cấp !'
                    }
                }
                    supplier.name = data.name;
                    supplier.address = data.address;
                    supplier.phonenumber = data.phonenumber;
                    supplier.email = data.email;
                    await supplier.save()
                    return ({
                        errCode: 0,
                        errMessage: 'OK'
                    })
        } catch (error) {
            throw (error)
        }
}

// xoa nha cung cap
let deleteSupplier = async (data) => {
        try {
            if (!data.id) {
                return ({
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt buộc !'
                })
            }  
                let supplier = await db.Supplier.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (!supplier) {
                    return {
                        errCode: -1,
                        errMessage: 'Không tìm thấy nhà cung cấp !'
                    }
                }
                    await supplier.destroy();
                    return ({
                        errCode: 0,
                        errMessage: 'OK'
                    })          
        } catch (error) {
            throw (error)
        }
}
module.exports = {
    createNewSupplier: createNewSupplier,
    getDetailSupplierById:getDetailSupplierById,
    getAllSupplier:getAllSupplier,
    updateSupplier:updateSupplier,
    deleteSupplier:deleteSupplier
}