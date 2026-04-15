import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

// tao phieu nhap hang moi 
let createNewReceipt = async (data) => {
    try {
        if (!data.userId || !data.supplierId || !data.productDetailSizeId || !data.quantity || !data.price)
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
            let receipt = await db.Receipt.create({
                userId: data.userId,
                supplierId: data.supplierId

            })
                await db.ReceiptDetail.create({
                    receiptId: receipt.id,
                    productDetailSizeId: data.productDetailSizeId,
                    quantity: data.quantity,
                    price: data.price,
                }
                )
            return ({
                errCode: 0,
                errMessage: 'OK'
            })
    } catch (error) {
        throw (error)
    }
}

// tao chi tiet phieu nhap hang moi
let createNewReceiptDetail = async (data) => {
        try {
            if (!data.receiptId || !data.productDetailSizeId || !data.quantity
                || !data.price
            ) {
                return ({
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt buộc !'
                })
            }  
                await db.ReceiptDetail.create({
                    receiptId: data.receiptId,
                    productDetailSizeId: data.productDetailSizeId,
                    quantity: data.quantity,
                    price: data.price,
                }
                )

                return ({
                    errCode: 0,
                    errMessage: 'OK'
                })
          
        } catch (error) {
            throw (error)
        } 
}

// lay chi tiet phieu nhap hang theo id
let getDetailReceiptById = async (id) => {
    try {
        if (!id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let res = await db.Receipt.findOne({ where: { id: id } })
        if (!res) {
            return ({
                errCode: -1,
                errMessage: 'Không tìm thấy phiếu nhập !'
            })
        }
        res.receiptDetail = await db.ReceiptDetail.findAll({ where: { receiptId: id } })
        if (res.receiptDetail && res.receiptDetail.length > 0) {
            await Promise.all(
                res.receiptDetail.map(async (item) => {
                    let productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: item.productDetailSizeId },
                        include: [
                            { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] }
                        ],
                        raw: true,
                        nest: true
                    })
                    item.productDetailSizeData = productDetailSize
                    item.productDetailData = await db.ProductDetail.findOne({ 
                        where: { id: productDetailSize.productdetailId } 
                    })
                    item.productData = await db.Product.findOne({ 
                        where: { id: item.productDetailData.productId } 
                    })
                })
            )
        }
        return ({
            errCode: 0,
            data: res
        })
    } catch (error) {
        throw (error)
    }
}

// lay tat ca phieu nhap hang
let getAllReceipt = async (data) => {
    try {
        let objectFilter = {}
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }
        let res = await db.Receipt.findAndCountAll(objectFilter)
        await Promise.all(
            res.rows.map(async (item) => {
                const [userData, supplierData] = await Promise.all([
                    db.User.findOne({ where: { id: item.userId } }),
                    db.Supplier.findOne({ where: { id: item.supplierId } })
                ])
                item.userData = userData
                item.supplierData = supplierData
            })
        )
        return ({
            errCode: 0,
            data: res.rows,
            count: res.count
        })
    } catch (error) {
        throw (error)
    }
}

// cap nhat phieu nhap hang
let updateReceipt = async (data) => {
     
        try {
            if (!data.id || !data.date || !data.supplierId) {
                return ({
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt buộc !'
                })
            }  
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (!receipt) {
                    return {
                        errCode: -1,
                        errMessage: 'Không tìm thấy phiếu nhập !'
                    }
                }
                    receipt.supplierId = data.supplierId;
                    await receipt.save()
                    return ({
                        errCode: 0,
                        errMessage: 'OK'
                    })
        } catch (error) {
            throw (error)
        }
}

// xoa phieu nhap hang
let deleteReceipt = async (data) => {
    
        try {
            if (!data.id) {
                return  {
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                }
            }  
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (!receipt) {
                    return {
                        errCode: -1,
                        errMessage: 'Receipt not found !'
                    }
                }
                    await receipt.destroy()
                    return ({
                        errCode: 0,
                        errMessage: 'OK'
                    })
        } catch (error) {
            throw (error)
        }
    
}
module.exports = {
    createNewReceipt: createNewReceipt,
    getDetailReceiptById: getDetailReceiptById,
    getAllReceipt: getAllReceipt,
    updateReceipt: updateReceipt,
    deleteReceipt: deleteReceipt,
    createNewReceiptDetail: createNewReceiptDetail
}