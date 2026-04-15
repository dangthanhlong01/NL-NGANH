import productService from '../services/productService';

// Hàm tạo mới sản phẩm
let createNewProduct = async (req, res) => {
    try {
        let data = await productService.createNewProduct(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy tất cả sản phẩm cho admin
let getAllProductAdmin = async (req, res) => {
    try {
        let data = await productService.getAllProductAdmin(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy tất cả sản phẩm cho user
let getAllProductUser = async (req, res) => {
    try {
        let data = await productService.getAllProductUser(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm vô hiệu hóa sản phẩm
let UnactiveProduct = async (req, res) => {
    try {
        let data = await productService.UnactiveProduct(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm kích hoạt sản phẩm
let ActiveProduct = async (req, res) => {
    try {
        let data = await productService.ActiveProduct(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy chi tiết sản phẩm theo ID
let getDetailProductById = async (req, res) => {
    try {
        let data = await productService.getDetailProductById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm cập nhật sản phẩm
let updateProduct = async (req, res) => {
    try {
        let data = await productService.updateProduct(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy tất cả chi tiết sản phẩm theo ID
let getAllProductDetailById = async (req, res) => {
    try {
        let data = await productService.getAllProductDetailById(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy tất cả hình ảnh chi tiết sản phẩm theo ID
let getAllProductDetailImageById = async (req, res) => {
    try {
        let data = await productService.getAllProductDetailImageById(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm tạo mới chi tiết sản phẩm
let createNewProductDetail = async (req, res) => {
    try {
        let data = await productService.createNewProductDetail(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm cập nhật chi tiết sản phẩm
let updateProductDetail = async (req, res) => {
    try {
        let data = await productService.updateProductDetail(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy chi tiết sản phẩm theo ID
let getDetailProductDetailById = async (req, res) => {
    try {
        let data = await productService.getDetailProductDetailById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm tạo mới hình ảnh chi tiết sản phẩm
let createNewProductDetailImage = async (req, res) => {
    try {
        let data = await productService.createNewProductDetailImage(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy chi tiết hình ảnh sản phẩm theo ID
let getDetailProductImageById = async (req, res) => {
    try {
        let data = await productService.getDetailProductImageById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm cập nhật hình ảnh chi tiết sản phẩm
let updateProductDetailImage = async (req, res) => {
    try {
        let data = await productService.updateProductDetailImage(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm xóa hình ảnh chi tiết sản phẩm
let deleteProductDetailImage = async (req, res) => {
    try {
        let data = await productService.deleteProductDetailImage(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm xóa chi tiết sản phẩm
let deleteProductDetail = async (req, res) => {
    try {
        let data = await productService.deleteProductDetail(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy tất cả chi tiết kích thước sản phẩm theo ID
let getAllProductDetailSizeById = async (req, res) => {
    try {
        let data = await productService.getAllProductDetailSizeById(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm tạo mới chi tiết kích thước sản phẩm
let createNewProductDetailSize = async (req, res) => {
    try {
        let data = await productService.createNewProductDetailSize(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy chi tiết kích thước sản phẩm theo ID
let getDetailProductDetailSizeById = async (req, res) => {
    try {
        let data = await productService.getDetailProductDetailSizeById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm cập nhật chi tiết kích thước sản phẩm
let updateProductDetailSize = async (req, res) => {
    try {
        let data = await productService.updateProductDetailSize(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm xóa chi tiết kích thước sản phẩm
let deleteProductDetailSize = async (req, res) => {
    try {
        let data = await productService.deleteProductDetailSize(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy sản phẩm nổi bật
let getProductFeature = async (req, res) => {
    try {
        let data = await productService.getProductFeature(req.query.limit);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy sản phẩm mới nhất
let getProductNew = async (req, res) => {
    try {
        let data = await productService.getProductNew(req.query.limit);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy sản phẩm trong giỏ hàng
let getProductShopCart = async (req, res) => {
    try {
        let data = await productService.getProductShopCart(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// Hàm lấy sản phẩm gợi ý
let getProductRecommend = async (req, res) => {
    try {
        let data = await productService.getProductRecommend(req.query);
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
    createNewProduct: createNewProduct,
    getAllProductAdmin: getAllProductAdmin,
    getAllProductUser: getAllProductUser,
    UnactiveProduct: UnactiveProduct,
    ActiveProduct: ActiveProduct,
    getDetailProductById: getDetailProductById,
    updateProduct: updateProduct,
    getAllProductDetailById: getAllProductDetailById,
    getAllProductDetailImageById: getAllProductDetailImageById,
    createNewProductDetail: createNewProductDetail,
    updateProductDetail: updateProductDetail,
    getDetailProductDetailById: getDetailProductDetailById,
    createNewProductDetailImage: createNewProductDetailImage,
    getDetailProductImageById: getDetailProductImageById,
    updateProductDetailImage: updateProductDetailImage,
    deleteProductDetailImage: deleteProductDetailImage,
    deleteProductDetail: deleteProductDetail,
    getAllProductDetailSizeById: getAllProductDetailSizeById,
    createNewProductDetailSize: createNewProductDetailSize,
    getDetailProductDetailSizeById: getDetailProductDetailSizeById,
    updateProductDetailSize: updateProductDetailSize,
    deleteProductDetailSize: deleteProductDetailSize,
    getProductFeature: getProductFeature,
    getProductNew: getProductNew,
    getProductShopCart: getProductShopCart,
    getProductRecommend: getProductRecommend
}