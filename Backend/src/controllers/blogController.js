import blogService from '../services/blogService';


// Tạo mới một bài viết
let createNewBlog = async (req, res) => {
    try {
        let data = await blogService.createNewBlog(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Lấy chi tiết bài viết theo ID
let getDetailBlogById = async (req, res) => {
    try {
        let data = await blogService.getDetailBlogById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Lấy tất cả bài viết
let getAllBlog = async (req, res) => {
    try {
        let data = await blogService.getAllBlog(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Cập nhật bài viết
let updateBlog = async (req, res) => {
    try {
        let data = await blogService.updateBlog(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Cập nhật bài viết
let deleteBlog = async (req, res) => {
    try {
        let data = await blogService.deleteBlog(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

//  Lấy bài viết nổi bật
let getFeatureBlog = async (req, res) => {
    try {
        let data = await blogService.getFeatureBlog(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

//  Lấy bài viết mới nhất
let getNewBlog = async (req, res) => {
    try {
        let data = await blogService.getNewBlog(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
module.exports = {
    createNewBlog: createNewBlog,
    getDetailBlogById: getDetailBlogById,
    getAllBlog: getAllBlog,
    updateBlog: updateBlog,
    deleteBlog: deleteBlog,
    getFeatureBlog:getFeatureBlog,
    getNewBlog:getNewBlog
}