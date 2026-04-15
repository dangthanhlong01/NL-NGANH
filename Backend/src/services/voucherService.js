import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

//==================TYPE VOUCHER====================//
let createNewTypeVoucher = async (data) => {
    try {
        if (!data.typeVoucher || !data.value || !data.maxValue || !data.minValue) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        await db.TypeVoucher.create({
            typeVoucher: data.typeVoucher,
            value: data.value,
            maxValue: data.maxValue,
            minValue: data.minValue
        })
        return ({ errCode: 0, errMessage: 'OK' })
    } catch (error) {
        throw (error)
    }
}

let getDetailTypeVoucherById = async (id) => {
    try {
        if (!id) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let res = await db.TypeVoucher.findOne({
            where: { id: id },
            include: [
                { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
            ],
            raw: true,
            nest: true
        })
        if (!res) {
            return ({ errCode: -1, errMessage: 'Không tìm thấy loại voucher này !' })
        }
        return ({ errCode: 0, data: res })
    } catch (error) {
        throw (error)
    }
}

let getAllTypeVoucher = async (data) => {
    try {
        let objectFilter = {
            include: [
                { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
            ],
            raw: true,
            nest: true
        }
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }
        let res = await db.TypeVoucher.findAndCountAll(objectFilter)
        return ({ errCode: 0, data: res.rows, count: res.count })
    } catch (error) {
        throw (error)
    }
}

let updateTypeVoucher = async (data) => {
    try {
        if (!data.id || !data.typeVoucher || !data.value || !data.maxValue || !data.minValue) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let typevoucher = await db.TypeVoucher.findOne({
            where: { id: data.id },
            raw: false
        })
        if (!typevoucher) {
            return ({ errCode: -1, errMessage: 'Không tìm thấy loại voucher này !' })
        }
        typevoucher.typeVoucher = data.typeVoucher
        typevoucher.value = data.value
        typevoucher.maxValue = data.maxValue
        typevoucher.minValue = data.minValue
        await typevoucher.save()
        return ({ errCode: 0, errMessage: 'OK' })
    } catch (error) {
        throw (error)
    }
}

let deleteTypeVoucher = async (data) => {
    try {
        if (!data.id) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let typevoucher = await db.TypeVoucher.findOne({
            where: { id: data.id },
            raw: false
        })
        if (!typevoucher) {
            return ({ errCode: -1, errMessage: 'Không tìm thấy loại voucher này !' })
        }
        await typevoucher.destroy()  
        return ({ errCode: 0, errMessage: 'OK' })
    } catch (error) {
        throw (error)
    }
}

let getSelectTypeVoucher = async () => {
    try {
        let res = await db.TypeVoucher.findAll({
            include: [
                { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
            ],
            raw: true,
            nest: true
        })
        return ({ errCode: 0, data: res })
    } catch (error) {
        throw (error)  
    }
}

//=======================VOUCHER===================//
let createNewVoucher = async (data) => {
    try {
        if (!data.fromDate || !data.toDate || !data.typeVoucherId || !data.amount || !data.codeVoucher) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        await db.Voucher.create({
            fromDate: data.fromDate,
            toDate: data.toDate,
            typeVoucherId: data.typeVoucherId,
            amount: data.amount,
            codeVoucher: data.codeVoucher
        })
        return ({ errCode: 0, errMessage: 'OK' })
    } catch (error) {
        throw (error)
    }
}

let getDetailVoucherById = async (id) => {
    try {
        if (!id) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let res = await db.Voucher.findOne({ where: { id: id } })
        if (!res) {
            return ({ errCode: -1, errMessage: 'Không tìm thấy voucher này !' })
        }
        return ({ errCode: 0, data: res })
    } catch (error) {
        throw (error)
    }
}

let getAllVoucher = async (data) => {
    try {
        let objectFilter = {
            include: [
                {
                    model: db.TypeVoucher, as: 'typeVoucherOfVoucherData',
                    include: [
                        { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
                    ]
                }
            ],
            raw: true,
            nest: true
        }
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }
        let res = await db.Voucher.findAndCountAll(objectFilter)

        //   Promise.all thay vì for loop
        await Promise.all(
            res.rows.map(async (item) => {
                let voucherUsed = await db.VoucherUsed.findAll({
                    where: { voucherId: item.id, status: 1 }
                })
                item.usedAmount = voucherUsed.length
            })
        )
        return ({ errCode: 0, data: res.rows, count: res.count })
    } catch (error) {
        throw (error)
    }
}

let updateVoucher = async (data) => {
    try {
        if (!data.id || !data.fromDate || !data.toDate || !data.typeVoucherId || !data.amount || !data.codeVoucher) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let voucher = await db.Voucher.findOne({ where: { id: data.id }, raw: false })
        if (!voucher) {
            return ({ errCode: -1, errMessage: 'Không tìm thấy voucher này !' })
        }
        voucher.fromDate = data.fromDate
        voucher.toDate = data.toDate
        voucher.typeVoucherId = data.typeVoucherId
        voucher.amount = data.amount
        voucher.codeVoucher = data.codeVoucher
        await voucher.save()
        return ({ errCode: 0, errMessage: 'OK' })
    } catch (error) {
        throw (error)
    }
}

let deleteVoucher = async (data) => {
    try {
        if (!data.id) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let voucher = await db.Voucher.findOne({ where: { id: data.id }, raw: false })
        if (!voucher) {
            return ({ errCode: -1, errMessage: 'Không tìm thấy voucher này !' })
        }
        await voucher.destroy()
        return ({ errCode: 0, errMessage: 'OK' })
    } catch (error) {
        throw (error)
    }
}

let saveUserVoucher = async (data) => {
    try {
        if (!data.voucherId || !data.userId) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let voucherused = await db.VoucherUsed.findOne({
            where: { voucherId: data.voucherId, userId: data.userId },
            raw: false
        })
        if (voucherused) {
            return ({ errCode: 2, errMessage: 'Đã lưu voucher này trong kho!' })
        }
        await db.VoucherUsed.create({
            voucherId: data.voucherId,
            userId: data.userId
        })
        return ({ errCode: 0, errMessage: 'OK' })  
    } catch (error) {
        throw (error)
    }
}

let getAllVoucherByUserId = async (data) => {
    try {
        if (!data.id) {
            return ({ errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' })
        }
        let objectFilter = {
            where: { userId: data.id, status: 0 }
        }
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }
        let res = await db.VoucherUsed.findAndCountAll(objectFilter)

        //   Promise.all thay vì for loop
        await Promise.all(
            res.rows.map(async (item) => {
                const [voucherData, voucherUsedCount] = await Promise.all([
                    db.Voucher.findOne({
                        where: { id: item.voucherId },
                        include: [
                            {
                                model: db.TypeVoucher, as: 'typeVoucherOfVoucherData',
                                include: [
                                    { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
                                ]
                            }
                        ],
                        raw: true,
                        nest: true
                    }),
                    db.VoucherUsed.findAll({
                        where: { voucherId: item.voucherId, status: 1 }
                    })
                ])
                item.voucherData = voucherData
                item.voucherData.usedAmount = voucherUsedCount.length
            })
        )
        return ({ errCode: 0, data: res.rows, count: res.count })
    } catch (error) {
        throw (error)
    }
}

module.exports = {
    createNewTypeVoucher,
    getDetailTypeVoucherById,
    getAllTypeVoucher,
    updateTypeVoucher,
    deleteTypeVoucher,
    createNewVoucher,
    getDetailVoucherById,
    getAllVoucher,
    updateVoucher,
    deleteVoucher,
    getSelectTypeVoucher,
    saveUserVoucher,
    getAllVoucherByUserId
}