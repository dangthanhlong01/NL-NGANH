import db from "../models/index";
require('dotenv').config();

// tao review moi
// let createNewReview = async (data) => {
//     try {
//         if (!data.content || !data.productId || !data.userId || !data.star) {
//             return ({
//                 errCode: 1,
//                 errMessage: 'Thiếu tham số bắt buộc !'
//             })
//         }
//         await db.Comment.create({
//             content: data.content,
//             productId: data.productId,
//             userId: data.userId,
//             star: data.star,
//             image: data.image
//         })
//         return ({
//             errCode: 0,
//             errMessage: 'OK'
//         })

//     } catch (error) {
//         throw (error)
//     }
// }

// lay tat ca review cua san pham   
let getAllReviewByProductId = async (id) => {

    try {
        if (!id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let res = await db.Comment.findAll({
            where: {
                productId: id
            },
            raw: true
        })
        await Promise.all(
            res.map(async (item) => {
                const [childComment, user] = await Promise.all([
                    db.Comment.findAll({ where: { parentId: item.id } }),
                    db.User.findOne({
                        where: { id: item.userId },
                        attributes: { exclude: ['password'] }
                    })
                ])

                item.childComment = childComment
                if (item.image) {
                    item.image = Buffer.from(item.image).toString('utf8')
                }
                if (user && user.image) {
                    user.image = Buffer.from(user.image).toString('utf8')
                }
                item.user = user
            })
        )
        return ({
            errCode: 0,
            data: res
        })
    } catch (error) {
        throw (error)
    }

}

// tra loi review
let ReplyReview = async (data) => {

    try {
        if (!data.content || !data.productId || !data.userId || !data.parentId) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        await db.Comment.create({
            content: data.content,
            productId: data.productId,
            userId: data.userId,
            parentId: data.parentId
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })

    } catch (error) {
        throw (error)
    }

}

// xoa review
let deleteReview = async (data) => {
    try {
        if (!data.id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let review = await db.Comment.findOne({
            where: { id: data.id },
            raw: false
        })
        if (!review) {
            return ({
                errCode: -1,
                errMessage: 'Không tìm thấy review !'
            })
        }
        await db.Comment.destroy({
            where: { id: data.id }
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })

    } catch (error) {
        throw (error)
    }
}

// tao comment moi
let createNewComment = async (data) => {
    try {
        if (!data.content || !data.blogId || !data.userId) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        await db.Comment.create({
            content: data.content,
            blogId: data.blogId,
            userId: data.userId,
            image: data.image
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })

    } catch (error) {
        throw (error)
    }

}

// lay tat ca comment cua bai viet moi nhat
let getAllCommentByBlogId = async (id) => {
    try {
        if (!id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let res = await db.Comment.findAll({
            where: {
                blogId: id
            },
            order: [['createdAt', 'DESC']],
            raw: true
        })

        await Promise.all(
            res.map(async (item) => {
                const [childComment, user] = await Promise.all([
                    db.Comment.findAll({ where: { parentId: item.id } }),
                    db.User.findOne({
                        where: { id: item.userId },
                        attributes: { exclude: ['password'] }
                    })
                ])

                item.childComment = childComment

                if (item.image) {
                    item.image = Buffer.from(item.image).toString('utf8')
                }

                if (user && user.image) {
                    user.image = Buffer.from(user.image).toString('utf8')
                }

                item.user = user
            })
        )

        return ({
            errCode: 0,
            data: res
        })

    } catch (error) {
        throw (error)
    }
}

// tra loi comment
let ReplyComment = async (data) => {
    
        try {
            if (!data.content || !data.blogId || !data.userId || !data.parentId) {
                return ({
                    errCode: 1,
                    errMessage: 'Thiếu tham số bắt buộc !'
                })
            } 
                await db.Comment.create({
                    content: data.content,
                    blogId: data.blogId,
                    userId: data.userId,
                    parentId: data.parentId
                })
                return  ({
                    errCode: 0,
                    errMessage: 'OK'
                })
            
        } catch (error) {
            throw (error)
        }
}

// xoa comment
let deleteComment = async (data) => {
    try {
        if (!data.id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let comment = await db.Comment.findOne({
            where: { id: data.id },
            raw: false
        })
        if (!comment) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy comment !'
            }
        }
        await comment.destroy()
        return ({
            errCode: 0,
            errMessage: 'OK'
        })

    } catch (error) {
        throw error
    }
}
// Kiểm tra user đã mua sản phẩm chưa
let checkUserBoughtProduct = async (userId, productId) => {
    try {
        console.log('userId:', userId, typeof userId)
        console.log('productId:', productId, typeof productId)

        const addresses = await db.AddressUser.findAll({
            where: { userId: userId },
            attributes: ['id'],
            raw: true
        })
        console.log('Addresses:', addresses)

        if (!addresses || addresses.length === 0) {
            return { errCode: 2, errMessage: 'Bạn chưa mua sản phẩm này !' }
        }

        const addressIds = addresses.map(a => a.id)
        console.log('AddressIds:', addressIds)

        const orders = await db.OrderProduct.findAll({
            where: {
                addressUserId: addressIds,
                statusId: 'S6'
            },
            attributes: ['id'],
            raw: true
        })
         

        if (!orders || orders.length === 0) {
            return { errCode: 2, errMessage: 'Bạn chưa mua sản phẩm này !' }
        }

        const orderIds = orders.map(o => o.id)

        
        const productDetails = await db.ProductDetail.findAll({
            where: { productId: productId },
            attributes: ['id'],
            raw: true
        })
        console.log('ProductDetails:', productDetails)

        if (!productDetails || productDetails.length === 0) {
            return { errCode: 2, errMessage: 'Bạn chưa mua sản phẩm này !' }
        }
        const productDetailIds = productDetails.map(p => p.id)
        console.log('ProductDetailIds:', productDetailIds)

        // Bước 4: Kiểm tra OrderDetail
        const bought = await db.OrderDetail.findOne({
            where: {
                orderId: orderIds,
                productId: productDetailIds
            },
            raw: true
        })
         

        if (!bought) {
            return { errCode: 2, errMessage: 'Bạn chưa mua sản phẩm này !' }
        }

        return { errCode: 0, errMessage: 'OK' }

    } catch (error) {
        throw error
    }
}
let createNewReview = async (data) => {
    try {
        if (!data.content || !data.productId || !data.userId || !data.star) {
            return { errCode: 1, errMessage: 'Thiếu tham số bắt buộc !' }
        }

        // Thêm kiểm tra đã mua chưa
        let check = await checkUserBoughtProduct(data.userId, data.productId)
        if (check.errCode !== 0) return check

        // Kiểm tra đã đánh giá chưa
        let existed = await db.Comment.findOne({
            where: {
                productId: data.productId,
                userId: data.userId,
                parentId: null  // chỉ check review gốc, không check reply
            }
        })
        if (existed) {
            return { errCode: 3, errMessage: 'Bạn đã đánh giá sản phẩm này rồi !' }
        }

        await db.Comment.create({
            content: data.content,
            productId: data.productId,
            userId: data.userId,
            star: data.star,
            image: data.image
        })
        return { errCode: 0, errMessage: 'OK' }

    } catch (error) {
        throw error
    }
}
module.exports = {
    createNewReview: createNewReview,
    getAllReviewByProductId: getAllReviewByProductId,
    ReplyReview: ReplyReview,
    deleteReview: deleteReview,
    createNewComment: createNewComment,
    getAllCommentByBlogId: getAllCommentByBlogId,
    deleteComment: deleteComment,
    ReplyComment: ReplyComment,
    checkUserBoughtProduct: checkUserBoughtProduct
}