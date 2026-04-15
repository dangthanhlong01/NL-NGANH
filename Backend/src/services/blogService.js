import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

// Tạo mới một bài viết
let createNewBlog = async (data) => {
    try {
        if (!data.title || !data.contentMarkdown || !data.contentHTML || !data.image || !data.subjectId || !data.userId) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        await db.Blog.create({
            shortdescription: data.shortdescription,
            title: data.title,
            subjectId: data.subjectId,
            statusId: 'S1',
            image: data.image,
            contentMarkdown: data.contentMarkdown,
            contentHTML: data.contentHTML,
            userId: data.userId,
            view: 0
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}

// Lấy chi tiết bài viết theo ID
let getDetailBlogById = async (id) => {
    try {
        if (!id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let blog = await db.Blog.findOne({
            where: { id: id },
            raw: false,
        })
        if (!blog) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy blog !'
            }
        }
        blog.view = blog.view + 1;
        await blog.save()
        let res = await db.Blog.findOne({
            where: { id: id },
            include: [
                { model: db.Allcode, as: 'subjectData', attributes: ['value', 'code'] },

            ],
            raw: true,
            nest: true
        })
        res.userData = await db.User.findOne({ where: { id: res.userId } })

        if (res && res.image) {
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

// Lấy tất cả bài viết với phân trang và lọc theo chủ đề hoặc từ khóa
let getAllBlog = async (data) => {
    try {
        let objectFilter = {
            where: { statusId: 'S1' },
            include: [
                { model: db.Allcode, as: 'subjectData', attributes: ['value', 'code'] },

            ],
            raw: true,
            nest: true
        }
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }
        if (data.subjectId && data.subjectId !== '') {

            objectFilter.where = { ...objectFilter.where, subjectId: data.subjectId }
        }
        if (data.keyword && data.keyword !== '') objectFilter.where = { ...objectFilter.where, title: { [Op.substring]: data.keyword } }
        let res = await db.Blog.findAndCountAll(objectFilter)
        await Promise.all(
            res.rows.map(async (item) => {
                const [userData, commentData] = await Promise.all([
                    db.User.findOne({ where: { id: item.userId } }),
                    db.Comment.findAll({ where: { blogId: item.id } })
                ])
                item.userData = userData
                item.commentData = commentData
                if (item.image) {
                    item.image = Buffer.from(item.image).toString('utf8');
                }
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

// Cập nhật bài viết
let updateBlog = async (data) => {

    try {
        if (!data.id || !data.title || !data.contentMarkdown || !data.contentHTML || !data.image || !data.subjectId) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let blog = await db.Blog.findOne({
            where: { id: data.id },
            raw: false
        })
        if (!blog) {
            return ({
                errCode: -1,
                errMessage: 'Không tìm thấy blog !'
            })
        }
        blog.title = data.title;
        blog.contentMarkdown = data.contentMarkdown;
        blog.contentHTML = data.contentHTML;
        blog.image = data.image;
        blog.subjectId = data.subjectId
        blog.shortdescription = data.shortdescription

        await blog.save()
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}

// Xóa bài viết
let deleteBlog = async (data) => {
    try {
        if (!data.id) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc !'
            })
        }
        let blog = await db.Blog.findOne({
            where: { id: data.id },
            raw: false,
        })

        if (!blog) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy blog !'
            }
        }
        await blog.destroy();
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}

// Lấy các bài viết nổi bật nhất theo lượt xem hoặc bài viết mới nhất theo ngày tạo
let getFeatureBlog = async (data) => {
    try {

        let res = await db.Blog.findAll({
            where: { statusId: 'S1' },
            include: [
                { model: db.Allcode, as: 'subjectData', attributes: ['value', 'code'] },

            ],
            order: [['view', 'DESC']],
            limit: +data.limit,
            raw: true,
            nest: true
        })
        await Promise.all(
            res.map(async (item) => {
                const [useData, commentData] = await Promise.all([
                    db.User.findOne({ where: { id: item.userId } }),
                    db.Comment.findAll({ where: { blogId: item.id } })
                ])
                item.userData = useData
                item.commentData = commentData
                if (item.image) {
                    item.image = Buffer.from(item.image).toString('utf8')
                }
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

// Lấy các bài viết nổi bật nhất theo lượt xem hoặc bài viết mới nhất theo ngày tạo
let getNewBlog = async (data) => {
    try {
        let res = await db.Blog.findAll({
            where: { statusId: 'S1' },
            include: [
                { model: db.Allcode, as: 'subjectData', attributes: ['value', 'code'] },

            ],
            order: [['createdAt', 'DESC']],
            limit: +data.limit,
            raw: true,
            nest: true
        })
        await Promise.all(
            res.map(async (item) => {
                const [useData, commentData] = await Promise.all([
                    db.User.findOne({ where: { id: item.userId } }),
                    db.Comment.findAll({ where: { blogId: item.id } })
                ])
                item.userData = useData
                item.commentData = commentData
                if (item.image) {
                    item.image = Buffer.from(item.image).toString('utf8')
                }
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
module.exports = {
    createNewBlog: createNewBlog,
    getDetailBlogById: getDetailBlogById,
    getAllBlog: getAllBlog,
    updateBlog: updateBlog,
    deleteBlog: deleteBlog,
    getFeatureBlog: getFeatureBlog,
    getNewBlog: getNewBlog
}