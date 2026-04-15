import db from "../models/index";
// ham du doan
import jsrecommender from "js-recommender";
require("dotenv").config();
const { Op, or } = require("sequelize");

// Ham sap xep
function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.slice(1);
  }
  // -1 a dung truoc b, 1 b dung truoc a
  return function (a, b) {
    var result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

// sap xep nhieu thuoc tinh cung luc
function dynamicSortMultiple() {
  var props = arguments;
  return function (obj1, obj2) {
    var i = 0,
      result = 0,
      numberOffProperties = props.length;
    // result === 0 so sanh, result != dung so sanh
    while (result === 0 && i < numberOffProperties) {
      result = dynamicSort(props[i])(obj1, obj2);
      i++;
    }
    return result;
  };
}

// Hàm tạo sản phẩm mới
let createNewProduct = async (data) => {
  try {
    if (!data.categoryId || !data.brandId || !data.image || !data.nameDetail) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let product = await db.Product.create({
      name: data.name,
      contentHTML: data.contentHTML,
      contentMarkdown: data.contentMarkdown,
      statusId: "S1",
      categoryId: data.categoryId,
      madeby: data.madeby,
      material: data.material,
      brandId: data.brandId,
    });

    let productdetail = await db.ProductDetail.create({
      productId: product.id,
      description: data.description,
      originalPrice: data.originalPrice,
      discountPrice: data.discountPrice,
      nameDetail: data.nameDetail,
    });

    await db.ProductImage.create({
      productdetailId: productdetail.id,
      image: data.image,
    });

    await db.ProductDetailSize.create({
      productdetailId: productdetail.id,
      width: data.width,
      height: data.height,
      sizeId: data.sizeId,
      weight: data.weight,
    });
    return {
      errCode: 0,
      errMessage: "OK",
    };
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách sản phẩm cho admin
let getAllProductAdmin = async (data) => {
  try {
    let objectFilter = {
      include: [
        {
          model: db.Allcode,
          as: "brandData",
          attributes: ["value", "code"]
        },
        {
          model: db.Allcode,
          as: "categoryData",
          attributes: ["value", "code"],
        },
        {
          model: db.Allcode,
          as: "statusData",
          attributes: ["value", "code"],
        },
        {
          model: db.ProductDetail,
          as: "productDetailData",
          include: [
            { model: db.ProductDetailSize, as: "productDetailSizeData" },
            { model: db.ProductImage, as: "productImageData" },
          ],
        },
      ],
      raw: false,
      nest: true,
    };
    // Phân trang
    if (data.limit && data.offset) {
      objectFilter.limit = +data.limit;
      objectFilter.offset = +data.offset;
    }
    // Lọc theo danh mục và thương hiệu
    if (data.categoryId && data.categoryId !== "ALL") {
      objectFilter.where = {
        categoryId: data.categoryId
      }
    }
    // Lọc theo thương hiệu
    if (data.brandId && data.brandId !== "ALL") {
      objectFilter.where = {
        ...objectFilter.where,
        brandId: data.brandId
      }
    }
    // Sắp xếp theo tên
    if (data.sortName === "true") objectFilter.order = [["name", "ASC"]];
    // Tìm kiếm theo tên sản phẩm
    if (data.keyword !== "") {
      objectFilter.where = {
        ...objectFilter.where,
        name: { [Op.substring]: data.keyword },
      }
    }
    let res = await db.Product.findAndCountAll(objectFilter);
    let rows = res.rows.map((product) => {
      let productObj = product.toJSON(); // doi qua json de co the them truong moi
      productObj.price = product.productDetailData?.[0]?.discountPrice ?? 0;

      productObj.productDetail = productObj.productDetailData.map((detail) => {
        // chuyen lai truong moi de giong voi ben client
        detail.productDetailSize = detail.productDetailSizeData;
        detail.productImage = detail.productImageData;
        delete detail.productDetailSizeData;
        delete detail.productImageData;
        detail.productImage = detail.productImage.map((img) => {
          if (img.image) {
            img.image = Buffer.from(img.image, 'base64').toString('binary');
          }
          return img;
        })
        return detail;
      })
      return productObj;
    });
    if (data.sortPrice && data.sortPrice === "true") {
      rows.sort(dynamicSortMultiple("price"));
    }
    return ({
      errCode: 0,
      data: rows,
      count: res.count,
    });
  } catch (error) {
    throw (error);
  }
};

// Lấy danh sách sản phẩm cho người dùng
let getAllProductUser = async (data) => {
  try {
    let objectFilter = {
      where: { statusId: "S1" },
      include: [
        { model: db.Allcode, as: "brandData", attributes: ["value", "code"] },
        {
          model: db.Allcode,
          as: "categoryData",
          attributes: ["value", "code"],
        },
        {
          model: db.Allcode,
          as: "statusData",
          attributes: ["value", "code"],
        },
        {
          model: db.ProductDetail, as: "productDetailData",
          include: [
            { model: db.ProductDetailSize, as: "productDetailSizeData" },
            { model: db.ProductImage, as: "productImageData" }
          ]
        }
      ],
      raw: false,
      nest: true,
    };
    if (data.limit && data.offset) {
      objectFilter.limit = +data.limit;
      objectFilter.offset = +data.offset;
    }
    // Lọc theo danh mục
    if (data.categoryId && data.categoryId !== "ALL")
      objectFilter.where = { ...objectFilter.where, categoryId: data.categoryId };
    // Lọc theo thương hiệu
    if (data.brandId && data.brandId !== "ALL")
      objectFilter.where = { ...objectFilter.where, brandId: data.brandId };
    // Sắp xếp theo tên
    if (data.sortName === "true") objectFilter.order = [["name", "ASC"]];
    // Tìm kiếm theo tên sản phẩm
    if (data.keyword !== "")
      objectFilter.where = {
        ...objectFilter.where,
        name: { [Op.substring]: data.keyword },
      };

    let res = await db.Product.findAndCountAll(objectFilter);
    let rows = res.rows.map((product) => {
      let productObj = product.toJSON();
      productObj.price = productObj.productDetailData?.[0]?.discountPrice ?? 0;

      productObj.productDetail = productObj.productDetailData.map((detail) => {
        detail.productDetailSize = detail.productDetailSizeData;
        detail.productImage = detail.productImageData;
        delete detail.productDetailSizeData;
        delete detail.productImageData;

        detail.productImage = detail.productImage.map((img) => {
          if (img.image) {
             img.image = Buffer.from(img.image, 'base64').toString('binary');
          }
          return img;
        })
        return detail;
      })
      delete productObj.productDetailData;
      return productObj;
    })
    if (data.sortPrice && data.sortPrice === "true") {
      rows.sort(dynamicSortMultiple("price"));
    }
    return ({
      errCode: 0,
      data: rows,
      count: res.count,
    });
  } catch (error) {
    throw (error);
  }
};

// Đổi trạng thái sản phẩm thành không hoạt động
let UnactiveProduct = async (data) => {
  try {
    if (!data.id) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      }
    }
    let product = await db.Product.findOne({
      where: { id: data.id },
      raw: false,
    })
    if (!product) {
      return {
        errCode: -1,
        errMessage: "Sản phẩm không tồn tại !",
      }
    }
    product.statusId = "S2";
    await product.save();
    return {
      errCode: 0,
      errMessage: "OK",
    }
  } catch (error) {
    throw error;
  }
}

// Đổi trạng thái sản phẩm thành hoạt động
let ActiveProduct = async (data) => {
  try {
    if (!data.id) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let product = await db.Product.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!product) {
      return ({
        errCode: -1,
        errMessage: `Sản phẩm không tồn tại!`,
      });
    }
    product.statusId = "S1";
    await product.save();
    return ({
      errCode: 0,
      errMessage: "OK",
    });
  } catch (error) {
    throw (error);
  }
};

// Lấy chi tiết sản phẩm theo id
let getDetailProductById = async (id) => {
  try {
    if (!id) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let [res, product] = await Promise.all([
      db.Product.findOne({
        where: { id: id },
        include: [
          {
            model: db.Allcode,
            as: "brandData",
            attributes: ["value", "code"],
          },
          {
            model: db.Allcode,
            as: "categoryData",
            attributes: ["value", "code"],
          },
          {
            model: db.Allcode,
            as: "statusData",
            attributes: ["value", "code"],
          },
          {
            model: db.ProductDetail,
            as: "productDetailData",
            include: [
              {
                model: db.ProductDetailSize,
                as: "productDetailSizeData",
                include: [
                  { model: db.Allcode, as: "sizeData", attributes: ["value", "code"] }
                ]
              },
              { model: db.ProductImage, as: "productImageData" },
            ]
          }
        ],
        raw: false,
        nest: true,
      }),
      db.Product.findOne({ where: { id }, raw: false }),
    ]);
    if (!res || !product) {
      return {
        errCode: -1,
        errMessage: "Sản phẩm không tồn tại !",
      };
    }
    // tang view len 1
    product.view = product.view + 1;
    await product.save();

    let resObj = res.toJSON();
    // xu ly du lieu de giong ben client
    resObj.productDetail = await Promise.all(
      resObj.productDetailData.map(async (detail) => {
        // doi truong moi de giong ben client
        detail.productImage = detail.productImageData;
        detail.productDetailSize = detail.productDetailSizeData;
        // xoa truong ko can thiet
        delete detail.productImageData;
        delete detail.productDetailSizeData;

        // chuyen anh tu binary sang string
        detail.productImage = detail.productImage.map((img) => {
          if (img.image) {
             img.image = Buffer.from(img.image, 'base64').toString('binary');
          }
          return img;
        });
        // tinh stock cho tung size

        detail.productDetailSize = await Promise.all(
          detail.productDetailSize.map(async (size) => {
            const [receiptDetails, orderDetails] = await Promise.all([
              db.ReceiptDetail.findAll({
                where: {
                  productDetailSizeId: size.id
                }
              }),
              db.OrderDetail.findAll({
                where: { productId: size.id, }
              }),
            ]);
            // tong nhap kho
            let quantity = receiptDetails.reduce((sum, r) => sum + r.quantity, 0);
            await Promise.all(
              orderDetails.map(async (orderDetail) => {
                let order = await db.OrderProduct.findOne({
                  where: { id: orderDetail.orderId }
                });
                if (order.statusId != "S7") {
                  quantity = quantity - orderDetail.quantity;
                }
              })
            );
            size.stock = quantity;
            return size;
          })
        )
        return detail;
      })
    );
    delete resObj.productDetailData;
    return {
      errCode: 0,
      data: resObj,
    }
  } catch (error) {
    throw error;
  }
};

// Cập nhật sản phẩm
let updateProduct = async (data) => {
  try {
    if (!data.id || !data.categoryId || !data.brandId) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let product = await db.Product.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!product) {
      return {
        errCode: -1,
        errMessage: "Sản phẩm không tồn tại !",
      }
    }
    product.name = data.name;
    product.material = data.material;
    product.madeby = data.madeby;
    product.brandId = data.brandId;
    product.categoryId = data.categoryId;
    product.contentMarkdown = data.contentMarkdown;
    product.contentHTML = data.contentHTML;
    await product.save();
    return ({
      errCode: 0,
      errMessage: "OK",
    });
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết tất cả sản phẩm theo id
let getAllProductDetailById = async (data) => {
  try {
    if (!data.id || !data.limit || !data.offset) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let productdetail = await db.ProductDetail.findAndCountAll({
      where: { productId: data.id },
      limit: +data.limit,
      offset: +data.offset,
      include: [
        {
          model: db.ProductImage,
          as: "productImageData",
        },
        {
          model: db.ProductDetailSize,
          as: "productDetailSizeData",
        },
      ],
      raw: false,
      nest: true,
    });
    let rows = productdetail.rows.map((detail) => {

      let detailObj = detail.toJSON();

      detailObj.productImageData = detailObj.productImageData.map((img) => {
        if (img.image) {
           img.image = Buffer.from(img.image, 'base64').toString('binary');
        }
        return img;
      });

      detailObj.productDetailSize = detailObj.productDetailSizeData;
      delete detailObj.productDetailSizeData;

      return detailObj;
    });
    return ({
      errCode: 0,
      data: rows,
      count: productdetail.count,
    });

  } catch (error) {
    throw error;
  }

};

// Lấy chi tiết tất cả ảnh sản phẩm theo id
let getAllProductDetailImageById = async (data) => {
  try {
    if (!data.id || !data.limit || !data.offset) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    const { rows, count } = await db.ProductImage.findAndCountAll({
      where: { productdetailId: data.id },
      limit: +data.limit,
      offset: +data.offset,
      raw: true,
    })
    rows.forEach((item) => {
      if (item.image) {
         item.image = Buffer.from(item.image, 'base64').toString('binary');
      }
    })
    return ({
      errCode: 0,
      data: rows,
      count: count,
    });
  } catch (error) {
    throw (error);
  }
};

// Tạo mới chi tiết sản phẩm
let createNewProductDetail = async (data) => {
  try {
    if (
      !data.image ||
      !data.nameDetail ||
      !data.originalPrice ||
      !data.discountPrice ||
      !data.id
    ) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let productdetail = await db.ProductDetail.create({
      productId: data.id,
      description: data.description,
      originalPrice: data.originalPrice,
      discountPrice: data.discountPrice,
      nameDetail: data.nameDetail,
    });
    await Promise.all([
      db.ProductImage.create({
        productdetailId: productdetail.id,
        image: data.image,
      }),
      db.ProductDetailSize.create({
        productdetailId: productdetail.id,
        width: data.width,
        height: data.height,
        sizeId: data.sizeId,
        weight: data.weight,
      }),
    ]);
    return ({
      errCode: 0,
      errMessage: "OK",
    });
  } catch (error) {
    throw (error);
  }
};

// Cập nhật chi tiết sản phẩm
let updateProductDetail = async (data) => {
  try {
    if (
      !data.nameDetail ||
      !data.originalPrice ||
      !data.discountPrice ||
      !data.id
    ) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let productDetail = await db.ProductDetail.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!productDetail) {
      return {
        errCode: -1,
        errMessage: "Sản phẩm không tồn tại !",
      }
    }
    productDetail.nameDetail = data.nameDetail;
    productDetail.originalPrice = data.originalPrice;
    productDetail.discountPrice = data.discountPrice;
    productDetail.description = data.description;
    await productDetail.save();
    return ({
      errCode: 0,
      errMessage: "OK",
    });
  } catch (error) {
    throw (error);
  }
};

// Lấy chi tiết sản phẩm theo id
let getDetailProductDetailById = async (id) => {
  try {
    if (!id) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      }
    }
    let productdetail = await db.ProductDetail.findOne({
      where: { id: id },
      raw: true,
    })
    if (!productdetail) {
      return {
        errCode: -1,
        errMessage: "Sản phẩm không tồn tại !",
      }
    }
    return {
      errCode: 0,
      data: productdetail,
    }
  } catch (error) {
    throw error;
  }
}

// Tao moi chi tiet anh san pham
let createNewProductDetailImage = async (data) => {
  try {
    if (!data.id || !data.image || !data.caption) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      }
    }
    await db.ProductImage.create({
      productdetailId: data.id,
      caption: data.caption,
      image: data.image,
    })
    return {
      errCode: 0,
      errMessage: "OK",
    }
  } catch (error) {
    throw error;
  }
}

// Lấy chi tiết ảnh sản phẩm theo id
let getDetailProductImageById = async (id) => {
  try {
    if (!id) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let productdetailImage = await db.ProductImage.findOne({
      where: { id: id },
    });
    if (!productdetailImage) {
      return {
        errCode: -1,
        errMessage: "Ảnh sản phẩm không tồn tại !",
      }
    }

    productdetailImage.image = Buffer.from(productdetailImage.image, "base64",).toString("binary");
    return ({
      errCode: 0,
      data: productdetailImage,
    });
  } catch (error) {
    throw (error);
  }
};

// Cập nhật chi tiết ảnh sản phẩm
let updateProductDetailImage = async (data) => {
  try {
    if (!data.id || !data.caption || !data.image) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let productImage = await db.ProductImage.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!productImage) {
      return {
        errCode: -1,
        errMessage: "Ảnh sản phẩm không tồn tại !",
      }
    }
    productImage.caption = data.caption;
    productImage.image = data.image;
    await productImage.save();
    return ({
      errCode: 0,
      errMessage: "OK",
    });
  } catch (error) {
    throw (error);
  }
};

// Xóa chi tiết ảnh sản phẩm
let deleteProductDetailImage = async (data) => {
  try {
    if (!data.id) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let productImage = await db.ProductImage.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!productImage) {
      return {
        errCode: -1,
        errMessage: "Ảnh sản phẩm không tồn tại !",
      }
    }
    await productImage.destroy()
    return ({
      errCode: 0,
      errMessage: "OK",
    });

  } catch (error) {
    throw (error);
  }
};

// Lấy chi tiết size sản phẩm theo id
let getAllProductDetailSizeById = async (data) => {
  try {
    if (!data.id || !data.limit || !data.offset) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      });
    }
    let productsize = await db.ProductDetailSize.findAndCountAll({
      where: { productdetailId: data.id },
      limit: +data.limit,
      offset: +data.offset,
      include: [
        {
          model: db.Allcode,
          as: "sizeData",
          attributes: ["value", "code"],
        },
      ],
      raw: true,
      nest: true,
    });

    // Tính stock song song cho từng size
    let rows = await Promise.all(
      productsize.rows.map(async (size) => {
        const [receiptDetails, orderDetails] = await Promise.all([
          db.ReceiptDetail.findAll({
            where: {
              productDetailSizeId: size.id
            }
          }),
          db.OrderDetail.findAll({
            where: {
              productId: size.id
            }
          }),
        ]);
        // Tổng số lượng nhập kho
        let quantity = receiptDetails.reduce((sum, r) => sum + r.quantity, 0);
        // Trừ đi số lượng đã bán (trừ đi các đơn hàng chưa hoàn thành)
        await Promise.all(
          orderDetails.map(async (orderDetail) => {
            let order = await db.OrderProduct.findOne({
              where: { id: orderDetail.orderId }
            });
            if (order.statusId != "S7") {
              quantity = quantity - orderDetail.quantity;
            }
          })
        );
        size.stock = quantity;
        return size;
      })
    );
    return ({
      errCode: 0,
      data: rows,
      count: productsize.count,
    });
  } catch (error) {
    throw (error);
  }
};

// Tạo mới chi tiết size sản phẩm
let createNewProductDetailSize = async (data) => {
  try {
    if (!data.productdetailId || !data.sizeId) {
      return ({
        errCode: 1,
        errMessage: "Missing required parameter!",
      });
    }
    await db.ProductDetailSize.create({
      productdetailId: data.productdetailId,
      sizeId: data.sizeId,
      width: data.width,
      height: data.height,
      weight: data.weight,
    });
    return ({
      errCode: 0,
      errMessage: "OK",
    });
  } catch (error) {
    throw (error);
  }
};

// Lấy chi tiết size sản phẩm theo id
let getDetailProductDetailSizeById = async (id) => {
  try {
    if (!id) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let res = await db.ProductDetailSize.findOne({
      where: { id: id },
    });
    if (!res) {
      return {
        errCode: -1,
        errMessage: "Size không tồn tại !",
      }
    }

    return ({
      errCode: 0,
      data: res,
    });

  } catch (error) {
    throw (error);
  }
};

// Cập nhật chi tiết size sản phẩm
let updateProductDetailSize = async (data) => {
  try {
    if (!data.id || !data.sizeId) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let res = await db.ProductDetailSize.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!res) {
      return {
        errCode: -1,
        errMessage: "Chi tiết size sản phẩm không tồn tại !",
      }
    }
    res.sizeId = data.sizeId;
    res.width = data.width;
    res.height = data.height;
    res.weight = data.weight;
    await res.save();
    return ({
      errCode: 0,
      errMessage: "OK",
    });
  } catch (error) {
    throw error;
  }
};

// Xóa chi tiết size sản phẩm
let deleteProductDetailSize = async (data) => {
  try {
    if (!data.id) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let res = await db.ProductDetailSize.findOne({
      where: { id: data.id },
      raw: false,
    });

    if (!res) {
      return {
        errCode: -1,
        errMessage: "Chi tiết size sản phẩm không tồn tại !",
      }
    }
    await res.destroy();
    return {
      errCode: 0,
      errMessage: "OK",

    }
  } catch (error) {
    throw (error);
  }
};

// Xóa chi tiết sản phẩm
let deleteProductDetail = async (data) => {
  try {
    if (!data.id) {
      return ({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let productDetail = await db.ProductDetail.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!productDetail) {
      return {
        errCode: -1,
        errMessage: "Chi tiết sản phẩm không tồn tại !",
      }
    }
    await Promise.all([
      db.ProductImage.destroy({
        where: { productdetailId: data.id },
      }),
      db.ProductDetailSize.destroy({
        where: { productdetailId: data.id },
      })
    ]);
    await productDetail.destroy();

    return ({
      errCode: 0,
      errMessage: "OK",
    });

  } catch (error) {
    throw (error);
  }
};

// Lay san pham noi bat
let getProductFeature = async (limit) => {
  try {
    let res = await db.Product.findAll({
      include: [
        { model: db.Allcode, as: "brandData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "categoryData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "statusData", attributes: ["value", "code"] },
        {
          model: db.ProductDetail, as: "productDetailData",
          include: [
            { model: db.ProductDetailSize, as: "productDetailSizeData" },
            { model: db.ProductImage, as: "productImageData" }
          ],
        },
      ],
      limit: +limit,
      order: [["view", "DESC"]],
      raw: false,
      nest: true,
    });

    let rows = res.map((product) => {
      let productObj = product.toJSON();
      productObj.price = productObj.productDetailData?.[0]?.discountPrice ?? 0;

      productObj.productDetail = productObj.productDetailData.map((detail) => {
        detail.productDetailSize = detail.productDetailSizeData;
        detail.productImage = detail.productImageData;
        detail.productImage = detail.productImageData.map((img) => {
          if (img.image) {
            img.image = Buffer.from(img.image, 'base64').toString('binary');
          }
          return img
        })
        delete detail.productDetailSizeData;
        delete detail.productImageData;
        return detail;
      });
      delete productObj.productDetailData;
      return productObj;
    });
    return ({
      errCode: 0,
      data: rows,
    });
  } catch (error) {
    throw (error);
  }
};

// Lay san pham moi nhat
let getProductNew = async (limit) => {
  try {
    let res = await db.Product.findAll({
      include: [
        { model: db.Allcode, as: "brandData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "categoryData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "statusData", attributes: ["value", "code"] },
        {
          model: db.ProductDetail, as: "productDetailData",
          include: [
            { model: db.ProductDetailSize, as: "productDetailSizeData" },
            { model: db.ProductImage, as: "productImageData" }
          ],
        },
      ],
      limit: +limit,
      order: [["createdAt", "DESC"]],
      raw: false,
      nest: true,
    });

    let rows = res.map((product) => {
      let productObj = product.toJSON();
      productObj.price = productObj.productDetailData?.[0]?.discountPrice ?? 0;

      productObj.productDetail = productObj.productDetailData.map((detail) => {
        detail.productDetailSize = detail.productDetailSizeData;
        detail.productImage = detail.productImageData;
        detail.productImage = detail.productImageData.map((img) => {
          if (img.image) {

            img.image = Buffer.from(img.image, 'base64').toString('binary');
          }
          return img
        })
        delete detail.productDetailSizeData;
        delete detail.productImageData;
        return detail;
      });

      delete productObj.productDetailData;
      return productObj;
    });


    return ({
      errCode: 0,
      data: rows,
    });
  } catch (error) {
    throw (error);
  }
};

// Lấy sản phẩm trong giỏ hàng của người dùng
let getProductShopCart = async (data) => {
  try {
    if (!data.userId) {
      return ({
        errCode: 1,
        errMessage: "Thiếu thông tin bắt buộc!",
      });
    }
    // Lấy tất cả ShopCart của user
    let shopcart = await db.ShopCart.findAll({
      where: { userId: data.userId },
    });

    if (!shopcart || shopcart.length === 0) {
      return {
        errCode: 0,
        data: [],
      };
    }

    // Lấy tất cả productdetailSizeId trong shopcart
    let productDetailSizeIds = shopcart.map((item) => item.productdetailsizeId);

    // Query song song tất cả ProductDetailSize
    let productDetailSizes = await db.ProductDetailSize.findAll({
      where: { id: productDetailSizeIds },
    });

    // Lấy tất cả productDetailId từ productDetailSize
    let productDetailIds = productDetailSizes.map((item) => item.productdetailId);

    // Query song song tất cả ProductDetail
    let productDetails = await db.ProductDetail.findAll({
      where: { id: productDetailIds }
    });
    // Lấy tất cả productId
    let productIds = productDetails.map((item) => item.productId);
    // Query tất cả Product + include Allcode
    let products = await db.Product.findAll({
      where: { id: productIds },
      include: [
        { model: db.Allcode, as: "brandData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "categoryData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "statusData", attributes: ["value", "code"] },
        {
          model: db.ProductDetail, as: "productDetailData",
          include: [
            { model: db.ProductDetailSize, as: "productDetailSizeData" },
            { model: db.ProductImage, as: "productImageData" },
          ],
        },
      ],
      raw: false,
      nest: true,
    });
    let rows = products.map((product) => {
      let productObj = product.toJSON();

      productObj.price = productObj.productDetailData?.[0]?.discountPrice ?? 0;

      productObj.productDetail = productObj.productDetailData.map((detail) => {
        detail.productDetailSize = detail.productDetailSizeData;
        detail.productImage = detail.productImageData;
        delete detail.productDetailSizeData;
        delete detail.productImageData;

        detail.productImage = detail.productImage.map((img) => {
          if (img.image) {
            img.image = Buffer.from(img.image, 'base64').toString('binary');
          }
          return img;
        });
        return detail;
      });
      delete productObj.productDetailData;
      return productObj;
    });


    return ({
      errCode: 0,
      data: rows,
    });
  } catch (error) {
    throw (error);
  }
};
// Lấy sản phẩm được đề xuất cho người dùng
let getProductRecommend = async (data) => {
  try {
    if (!data.userId || !data.limit) {
      return ({
        errCode: 1,
        errMessage: "Thiếu thông tin bắt buộc!",
      });
    }
    // Khoi tao mang chua san pham de tra ve
    let recommender = new jsrecommender.Recommender();
    let table = new jsrecommender.Table();

    // Lấy tất cả đánh giá có sao của người dùng
    let rateList = await db.Comment.findAll({
      where: { star: { [Op.not]: null } },
    });
    // Tao bang danh gia voi userId la cot, productId la hang, star la gia tri
    rateList.forEach((rate) => {
    table.setCell(String(rate.productId), String(rate.userId), rate.star);
});

recommender.fit(table);
let predicted_table = recommender.transform(table);

let productIds = [];
for (let i = 0; i < predicted_table.columnNames.length; i++) {
    let user = predicted_table.columnNames[i];
    if (user !== String(data.userId)) continue; // ← đổi != thành !== và ép kiểu

    for (let j = 0; j < predicted_table.rowNames.length; j++) {
        let product = predicted_table.rowNames[j];
        if (Math.round(predicted_table.getCell(product, user)) > 3) {
            productIds.push(product);
            if (productIds.length >= +data.limit) break;
        }
    }
}
    if (productIds.length === 0) {
      return { errCode: 0, data: [] };
    }
    let products = await db.Product.findAll({
      where: { id: productIds },
      include: [
        { model: db.Allcode, as: "brandData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "categoryData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "statusData", attributes: ["value", "code"] },
        {
          model: db.ProductDetail, as: "productDetailData",
          include: [
            { model: db.ProductDetailSize, as: "productDetailSizeData" },
            { model: db.ProductImage, as: "productImageData" },
          ],
        },
      ],
      raw: false,
      nest: true,
    });
    let rows = products.map((product) => {
      let productObj = product.toJSON();
      productObj.price = productObj.productDetailData?.[0]?.discountPrice ?? 0;

      productObj.productDetail = productObj.productDetailData.map((detail) => {
        detail.productDetailSize = detail.productDetailSizeData;
        detail.productImage = detail.productImageData.map((img) => {
          if (img.image) {
            img.image = Buffer.from(img.image, 'base64').toString('binary');
          }
          return img;
        });
        delete detail.productDetailSizeData;
        delete detail.productImageData;
        return detail;
      });
      delete productObj.productDetailData;
      return productObj;
    });
    return ({
      errCode: 0,
      data: rows,
    });
  } catch (error) {
    throw (error);
  }
};
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
  getProductRecommend: getProductRecommend,
};
