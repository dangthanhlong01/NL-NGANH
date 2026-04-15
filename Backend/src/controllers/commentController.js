import commentService from '../services/commentService'


// tao review moi
let createNewReview = async (req, res) => {
    try {
        let data = await commentService.createNewReview(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// lay tat ca review cua san pham
let getAllReviewByProductId = async (req, res) => {
    try {

        let data = await commentService.getAllReviewByProductId(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

//  tra loi review
let ReplyReview = async (req, res) => {
    try {

        let data = await commentService.ReplyReview(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// xoa review
let deleteReview = async (req, res) => {
    try {

        let data = await commentService.deleteReview(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// tao comment moi
let createNewComment = async (req, res) => {
    try {
        let data = await commentService.createNewComment(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// lay tat ca comment cua bai viet
let getAllCommentByBlogId = async (req, res) => {
    try {

        let data = await commentService.getAllCommentByBlogId(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// tra loi comment
let ReplyComment = async (req, res) => {
    try {

        let data = await commentService.ReplyComment(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// xoa comment
let deleteComment = async (req, res) => {
    try {

        let data = await commentService.deleteComment(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let checkUserBoughtProduct = async (req, res) => {
    try {
        let result = await commentService.checkUserBoughtProduct(  
            req.query.userId, 
            req.query.productId
        )
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ errCode: -1, errMessage: 'Lỗi server' })
    }
}
module.exports = {
    createNewReview: createNewReview,
    getAllReviewByProductId: getAllReviewByProductId,
    ReplyReview: ReplyReview,
    deleteReview: deleteReview,
    createNewComment:createNewComment,
    getAllCommentByBlogId:getAllCommentByBlogId,
    deleteComment:deleteComment,
    ReplyComment:ReplyComment,
    checkUserBoughtProduct: checkUserBoughtProduct
}