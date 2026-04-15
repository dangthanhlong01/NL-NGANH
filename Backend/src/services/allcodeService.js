//Service này sẽ xử lý các logic liên quan đến mã code
import db from "../models/index";
const { Op } = require("sequelize");

// Hàm tạo ra mã code mới
let handleCreateNewAllCode = async (data) => {
  try {
    if (!data.type || !data.value || !data.code) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let code = await db.Allcode.findOne({
      where: {
        code: data.code,
      },
    });
    if (code) {
      return {
        errCode: 2,
        errMessage: "Mã code đã tồn tại !",
      };
    }
    await db.Allcode.create({
      type: data.type,
      code: data.code,
      value: data.value,
    });
    return {
      errCode: 0,
      errMessage: "OK",
    };
  } catch (error) {
    throw error;
  }
};

// Hàm lấy tất cả mã code theo loại
let getAllCodeService = async (typeInput) => {
  try {
    if (!typeInput) {
      return {
        errCode: 1,
        errMessage: "Tham số bắt buộc bị thiếu !",
      };
    }
    let allcode = await db.Allcode.findAll({
      where: {
        type: typeInput,
      },
    });
    return {
      errCode: 0,
      data: allcode,
    };
  } catch (error) {
    throw error;
  }
};

// Hàm cập nhật mã code
let handleUpdateAllCode = async (data) => {
  try {
    if (!data.id || !data.value || !data.code) {
      return {
        errCode: 1,
        errMessage: "Tham số bắt buộc bị thiếu !",
      };
    }
    let code = await db.Allcode.findOne({
      where: {
        id: data.id,
      },
      raw: false,
    });
    if (code) {
      code.value = data.value;
      code.code = data.code;
      await code.save();
      return {
        errCode: 0,
        errMessage: "OK",
      };
    }
    return {
      errCode: -1,
      errMessage: "Không tìm thấy mã code !",
    };
  } catch (error) {
    throw error;
  }
};

// Hàm lấy chi tiết mã code theo id
let getDetailAllCodeById = async (id) => {
  try {
    if (!id) {
      return {
        errCode: 1,
        errMessage: "Tham số bắt buộc bị thiếu",
      };
    }
    let code = await db.Allcode.findOne({
      where: {
        id: id,
      },
    });
    if (code) {
      return {
        errCode: 0,
        data: code,
      };
    }
    return {
      errCode: -1,
      errMessage: "Không tìm thấy mã code !",
    };
  } catch (error) {
    throw error;
  }
};

// Hàm xóa mã code
let handleDeleteAllCode = async (id) => {
  try {
    if (!id) {
      return {
        errCode: 1,
        errMessage: "Tham số bắt buộc bị thiếu: id !",
      };
    }
    let code = await db.Allcode.findOne({
      where: {
        id: id,
      },
      raw: false,
    });
    if (code) {
      await code.destroy();
      return {
        errCode: 0,
        errMessage: "Mã code đã được xóa thành công !",
      };
    }
    return {
      errCode: -1,
      errMessage: "Không tìm thấy mã code !",
    };
  } catch (error) {
    throw error;
  }
};

// Hàm lấy danh sách mã code với phân trang và tìm kiếm
let getListAllCodeService = async (data) => {
  try {
    if (!data.type) {
      return {
        errCode: 1,
        errMessage: "Tham số bắt buộc bị thiếu: type !",
      };
    }
    // tao filter theo type
    let filter = {
      where: {
        type: data.type,
      },
    };
    // them phan trang (neu co)
    if (data.limit && data.offset) {
      filter.limit = +data.limit; // dau + chuyen string thanh number
      filter.offset = +data.offset;
    }
    // them tim kiem (neu co)
    if (data.keyword != "") {
      filter.where.value = {
        [Op.substring]: data.keyword,
      };
    }
    // lay du lieu tu database va dem tong so ban ghi
    let result = await db.Allcode.findAndCountAll(filter);
    return {
      errCode: 0,
      data: result.rows, // mang data
      count: result.count, // tong so ban ghi
    };
  } catch (error) {
    throw error;
  }
};

// Hàm lấy tất cả danh mục blog
let getAllCategoryBlog = async (typeInput) => {
  try {
    if (!typeInput) {
      return {
        errCode: 1,
        errMessage: "Tham số bắt buộc bị thiếu !",
      };
    }
    let allcode = await db.Allcode.findAll({
      where: {
        type: typeInput,
      },
      raw: true,
    });
    await Promise.all(
  allcode.map(async (item) => {
    let blog = await db.Blog.findAll({ where: { subjectId: item.code } })
    item.countPost = blog.length
  })
)
    return {
      errCode: 0,
      data: allcode,
    };
  } catch (error) {
    throw error;
  }
};
module.exports = {
  handleCreateNewAllCode: handleCreateNewAllCode,
  getAllCodeService: getAllCodeService,
  handleUpdateAllCode: handleUpdateAllCode,
  getDetailAllCodeById: getDetailAllCodeById,
  handleDeleteAllCode: handleDeleteAllCode,
  getListAllCodeService: getListAllCodeService,
  getAllCategoryBlog: getAllCategoryBlog,
};
