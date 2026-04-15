import db from "../models/index";


let addShopCart = async (data) => {
    try {
        if (!data.userId || !data.productdetailsizeId || !data.quantity) {
            return {
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            }
        }

        let cart = await db.ShopCart.findOne({
            where: { userId: data.userId, productdetailsizeId: data.productdetailsizeId, statusId: 0 },
            raw: false
        })

        if (cart) {
            let res = await db.ProductDetailSize.findOne({ where: { id: data.productdetailsizeId } })
            if (res) {
                let [receiptDetail, orderDetail] = await Promise.all([
                    db.ReceiptDetail.findAll({ where: { productDetailSizeId: res.id } }),
                    db.OrderDetail.findAll({ where: { productId: res.id } })
                ])

                let quantity = 0
                for (let j = 0; j < receiptDetail.length; j++) {
                    quantity = quantity + receiptDetail[j].quantity
                }

                const orders = await Promise.all(
                    orderDetail.map(od => db.OrderProduct.findOne({ where: { id: od.orderId } }))
                )
                for (let k = 0; k < orderDetail.length; k++) {
                    if (orders[k].statusId != 'S7') {
                        quantity = quantity - orderDetail[k].quantity
                    }
                }

                res.stock = quantity
            }

            if (data.type === "UPDATE_QUANTITY") {
                if (+data.quantity > res.stock) {
                    return {
                        errCode: 2,
                        errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                        quantity: res.stock
                    }
                } else {
                    cart.quantity = +data.quantity
                    await cart.save()
                }
            } else {
                if ((+cart.quantity + (+data.quantity)) > res.stock) {
                    return {
                        errCode: 2,
                        errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                        quantity: res.stock
                    }
                } else {
                    cart.quantity = +cart.quantity + (+data.quantity)
                    await cart.save()
                }
            }

        } else {
            let res = await db.ProductDetailSize.findOne({ where: { id: data.productdetailsizeId } })
            if (!res) {
                return {
                    errCode: -1,
                    errMessage: "Size sản phẩm không tồn tại !",
                }
            }

            let [receiptDetail, orderDetail] = await Promise.all([
                db.ReceiptDetail.findAll({ where: { productDetailSizeId: res.id } }),
                db.OrderDetail.findAll({ where: { productId: res.id } })
            ])

            let quantity = 0
            for (let j = 0; j < receiptDetail.length; j++) {
                quantity = quantity + receiptDetail[j].quantity
            }

            const orders = await Promise.all(
                orderDetail.map(od => db.OrderProduct.findOne({ where: { id: od.orderId } }))
            )
            for (let k = 0; k < orderDetail.length; k++) {
                if (orders[k].statusId != 'S7') {
                    quantity = quantity - orderDetail[k].quantity
                }
            }

            res.stock = quantity

            if (data.quantity > res.stock) {
                return {
                    errCode: 2,
                    errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                    quantity: res.stock
                }
            } else {
                await db.ShopCart.create({
                    userId: data.userId,
                    productdetailsizeId: data.productdetailsizeId,
                    quantity: data.quantity,
                    statusId: 0
                })
            }
        }

        return {
            errCode: 0,
            errMessage: 'OK'
        }

    } catch (error) {
        throw error
    }
}
let getAllShopCartByUserId = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            }
        }

        let res = await db.ShopCart.findAll({
            where: { userId: id, statusId: 0 }
        })

        res = await Promise.all(res.map(async (item) => {
            item.productdetailsizeData = await db.ProductDetailSize.findOne({
                where: { id: item.productdetailsizeId },
                include: [
                    { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] },
                ],
                raw: true,
                nest: true
            })

            item.productDetail = await db.ProductDetail.findOne({
                where: { id: item.productdetailsizeData.productdetailId }
            })

            item.productDetailImage = await db.ProductImage.findAll({
                where: { productdetailId: item.productDetail.id }
            })

            if (item.productDetailImage && item.productDetailImage.length > 0) {
                item.productDetailImage = item.productDetailImage.map((img) => {
                    img.image = Buffer.from(img.image, 'base64').toString('binary')
                    return img
                })
            }

            item.productData = await db.Product.findOne({
                where: { id: item.productDetail.productId }
            })
            return item
        }))
        return {
            errCode: 0,
            data: res
        }
    } catch (error) {
        throw error
    }
}

let deleteItemShopCart = async (data) => {
        try {
            if (!data.id) {
                return {
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt buộc !'
                }
            }  
                let res = await db.ShopCart.findOne({ where: { id: data.id, statusId: 0 }, raw: false })
                if (!res) {
                    return {
                        errCode: -1,
                        errMessage: "Sản phẩm không tồn tại trong giỏ hàng !",
                    }
                }
                    await res.destroy()
                    return ({
                        errCode: 0,
                        errMessage: 'OK'
                    }) 
        } catch (error) {
            throw (error)
        }
}
module.exports = {
    addShopCart: addShopCart,
    getAllShopCartByUserId: getAllShopCartByUserId,
    deleteItemShopCart: deleteItemShopCart
}