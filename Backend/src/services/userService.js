import db from "../models/index";
// hash password
import bcrypt from "bcryptjs";
// send email
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
// import token
import CommonUtils from "../utils/CommonUtils";
const { Op } = require("sequelize");
require("dotenv").config();
const salt = bcrypt.genSaltSync(10);
// build url email 
let buildUrlEmail = (token, userId) => {
  let result = `${process.env.URL_REACT}/verify-email?token=${token}&userId=${userId}`;
  return result;
};

// hàm hash password từ bcrypt
let hashUserPasswordFromBcrypt = async (password) => {
  try {
    let hashPassword = await bcrypt.hashSync(password, salt);
    return hashPassword;
  } catch (error) {
    throw error;
  }
};

// kiểm tra email đã tồn tại chưa
let checkUserEmail = async (userEmail) => {
  try {
    let user = await db.User.findOne({
      where: { email: userEmail },
    });
    return user ? true : false;
  } catch (error) {
    throw error;
  }
};

// hàm tạo mới người dùng
let handleCreateNewUser = async (data) => {
  try {
    if (!data.email || !data.lastName) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let check = await checkUserEmail(data.email);
    if (check === true) {
      return {
        errCode: 2,
        errMessage: "Email đã tồn tại, vui lòng thử email khác !",
      };
    }
    let hashPassword = await hashUserPasswordFromBcrypt(data.password);
    await db.User.create({
      email: data.email,
      password: hashPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      roleId: data.roleId,
      genderId: data.genderId,
      phonenumber: data.phonenumber,
      image: data.avatar,
      dob: data.dob,
      isActiveEmail: 0,
      statusId: "S1",
      usertoken: "",
    });
    return {
      errCode: 0,
      errMessage: "OK",
    };
  } catch (error) {
    throw error;
  }
};
// hàm xóa người dùng
let deleteUser = async (userId) => {
  try {
    if (!userId) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let foundUser = await db.User.findOne({
      where: { id: userId },
      raw: false,
    });
    if (!foundUser) {
      return {
        errCode: -1,
        errMessage: "Không tìm thấy user !",
      };
    }
    await foundUser.destroy();
    return {
      errCode: 0,
      errMessage: "OK",
    };
  } catch (error) {
    throw error;
  }
};

// hàm cập nhật dữ liệu người dùng
let updateUserData = async (data) => {
  try {
    if (!data.id || !data.genderId || !data.lastName) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let user = await db.User.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!user) {
      return {
        errCode: -1,
        errMessage: "Không tìm thấy user !",
      };
    }
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.address = data.address;
    user.genderId = data.genderId;
    user.phonenumber = data.phonenumber;
    user.dob = data.dob;
    user.roleId = data.roleId;
    if (data.image) {
      user.image = data.image;
    }
    await user.save();
    return {
      errCode: 0,
      errMessage: "OK",
    };
  } catch (error) {
    throw error;
  }
};

// xử lý đăng nhập
let handleLogin = async (data) => {
  try {
    if (!data.email || !data.password) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let userData = {};
    let checkEmail = await checkUserEmail(data.email);
    if (checkEmail === false) {
      return {
        errCode: -1,
        errMessage: `Email ${data.email} không tồn tại trong hệ thống, vui lòng thử lại !`,
      };
    }
    let user = await db.User.findOne({
      attributes: [
        "id",
        "email",
        "roleId",
        "lastName",
        "password",
        "firstName",
      ],
      where: { email: data.email, statusId: "S1" },
      raw: true,
    });
    if (!user) {
      return {
        errCode: -1,
        errMessage: `User không tồn tại trong hệ thống, vui lòng thử lại !`,
      };
    }
    let checkPassWord = await bcrypt.compareSync(data.password, user.password);
    if (checkPassWord === false)
      return {
        errCode: -1,
        errMessage: `Mật khẩu không chính xác, vui lòng thử lại !`,
      };
    userData.errCode = 0;
    userData.errMessage = "OK";
    delete user.password;
    userData.user = user;
    userData.accessToken = CommonUtils.encodeToken(user.id);
    return userData;
  } catch (error) {
    throw error;
  }
};
// xử lý đổi mật khẩu
let handleChangePassword = async (data) => {
  try {
    if (!data.id || !data.password || !data.oldpassword) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let user = await db.User.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!user) {
      return {
        errCode: -1,
        errMessage: `User không tồn tại trong hệ thống, vui lòng thử lại !`,
      };
    }
    let checkPassword = await bcrypt.compareSync(
      data.oldpassword,
      user.password,
    );
    if (checkPassword === false)
      return {
        errCode: -1,
        errMessage: `Mật khẩu cũ không chính xác, vui lòng thử lại !`,
      };
    user.password = await hashUserPasswordFromBcrypt(data.password);
    await user.save();
    return {
      errCode: 0,
      errMessage: "OK",
    };
  } catch (error) {
    throw error;
  }
};

// hàm lấy tất cả người dùng
let getAllUser = async (data) => {
  try {
    let filter = {
      where: { statusId: "S1" },
      attributes: {
        exclude: ["password", "image"],
      },
      include: [
        { model: db.Allcode, as: "roleData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "genderData", attributes: ["value", "code"] },
      ],
      raw: true,
      nest: true,
    };
    if (data.limit && data.offset) {
      filter.limit = +data.limit;
      filter.offset = +data.offset;
    }
    if (data.keyword !== "") {
      filter.where = {
        ...filter.where,
        phonenumber: {
          [Op.substring]: data.keyword,
        },
      };
    }
    let result = await db.User.findAndCountAll(filter);
    return {
      errCode: 0,
      data: result.rows,
      count: result.count,
    };
  } catch (error) {
    throw error;
  }
};
// hàm lấy chi tiết người dùng theo id
let getDetailUserById = async (userId) => {
  try {
    if (!userId) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let user = await db.User.findOne({
      where: { id: userId, statusId: "S1" },
      attributes: {
        exclude: ["password"],
      },
      include: [
        { model: db.Allcode, as: "roleData", attributes: ["value", "code"] },
        { model: db.Allcode, as: "genderData", attributes: ["value", "code"] },
      ],
      raw: true,
      nest: true,
    });
    if (!user) {
      return {
        errCode: -1,
        errMessage: "Không tìm thấy user !",
      };
    }
    if (user.image) {
      user.image = Buffer.from(user.image, "base64").toString("binary");
    }
    return {
      errCode: 0,
      data: user,
    };
  } catch (error) {
    throw error;
  }
};

// hàm lấy chi tiết người dùng theo email
let getDetailUserByEmail = async (email) => {
  try {
    if (!email) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      };
    }
    let user = await db.User.findOne({
      where: { email: email, statusId: "S1" },
      attributes: {
        exclude: ["password"],
      },
    });
    if (!user) {
      return {
        errCode: -1,
        errMessage: "Không tìm thấy user !",
      };
    }
    return {
      errCode: 0,
      data: user,
    };
  } catch (error) {
    throw error;
  }
};
// hàm gửi mã xác thực người dùng qua email
let handleSendVerifyEmailUser = async (data) => {
    try {
      if (!data.id) {
        return ({
          errCode: 1,
          errMessage: "Thiếu tham số bắt buộc !",
        });
      } 
        let user = await db.User.findOne({
          where: { id: data.id },
          attributes: {
            exclude: ["password"],
          },
          raw: false,
        });

        if (!user) {
          return ({
            errCode: -1,
            errMessage: "Không tìm thấy user !",
          })
        }
        let token = uuidv4();
          user.usertoken = token;
          await emailService.sendSimpleEmail({
            firstName: user.firstName,
            lastName: user.lastName,
            redirectLink: buildUrlEmail(token, user.id),
            email: user.email,
            type: "verifyEmail",
          });
          await user.save();
        return ({
          errCode: 0,
          errMessage: "OK",
        });
    } catch (error) {
      throw error;
    }
};
// hàm xác thực email người dùng
let handleVerifyEmailUser = async (data) => {
  try {
    if (!data.token || ! data.id){
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !",
      }
    }
    let user = await db.User.findOne({
      where: {
        id: data.id,
        usertoken: data.token
      }, raw: false
    })
    if(!user){
      return {
        errCode: -1,
        errMessage: "Không tìm thấy user !",
      }
    }
    user.isActiveEmail = 1;
      user.usertoken = "";
      await user.save();
      return {
        errCode: 0,
        errMessage: "OK"
      }
  } catch (error){
    throw error;
  }
}

// hàm gửi email khi quên mật khẩu
let handleSendEmailForgotPassword = async ( email ) =>{
  try {
    if (!email) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc !"
      }
    }
    let check = await checkUserEmail(email);
    if(check === false){
      return {
        errCode: -1,
        errMessage: "Không tìm thấy email, vui lòng thử lại !"
      }
    }
    let user = await db.User.findOne({
        where: {
          email: email
        },
        attributes: { exclude: ["password"]},
        raw: false
      })
      if(!user){
        return {
          errCode: -1,
          errMessage: "Không tìm thấy user !"
        }
      }
      let token = uuidv4();
      user.usertoken = token;
      await emailService.sendSimpleEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        redirectLink: `${process.env.URL_REACT}/verify/forgotpassword?token=${token}&userId=${user.id}`,
        email: user.email,
        type: 'forgotpassword'
      })
      await user.save();
      return {
        errCode: 0,
        errMessage: "OK"
      }
  } catch (error){
    throw error;
  }
}

// xử lí quên mật khẩu
let handleForgotPassword = async (data) => {
  try {
if (!data.id || !data.password || !data.token){
    return {
      errCode: 1,
      errMessage: 'Thiếu tham số bắt buộc !'
    }
  }
  let user = await db.User.findOne({
    where: {
      id: data.id,
      usertoken: data.token
    },
    attributes: {
      exclude: ["password"]
    }, raw: false

  })
  if (!user){
    return {
      errCode: -1,
      errMessage: 'không tìm thấy user !'
    }
  }
  user.password = await hashUserPasswordFromBcrypt(data.password);
  user.usertoken = ""
  await user.save();
  return{
    errCode: 0,
    errMessage: "OK"
  }
  } catch (error){
    throw error;
  }
}

// Kiểm tra số điện thoại và email có tồn tại chưa
let checkPhonenumberEmail = async (data) => {
    try {
      if(!data.phonenumber || !data.email) {
        return {
          isCheck: true,
          errCode: 1,
          errMessage: "Thiếu tham số bắt buộc"
        }
      }
      let phone = await db.User.findOne({
        where: { phonenumber: data.phonenumber },
      });
      let email = await db.User.findOne({
        where: { email: data.email },
      });
      if (phone) {
        return {
          isCheck: true,
          errMessage: "Số điện thoại đã tồn tại",
        };
      }
      if (email) {
       return {
          isCheck: true,
          errMessage: "Email đã tồn tại",
        };
      }

      return{
        isCheck: false,
        errMessage: "Hợp lệ",
      };
    } catch (error) {
      throw error;
    }
};
module.exports = {
  handleCreateNewUser: handleCreateNewUser,
  deleteUser: deleteUser,
  updateUserData: updateUserData,
  handleLogin: handleLogin,
  handleChangePassword: handleChangePassword,
  getAllUser: getAllUser,
  getDetailUserById: getDetailUserById,
  handleSendVerifyEmailUser: handleSendVerifyEmailUser,
  handleVerifyEmailUser: handleVerifyEmailUser,
  handleSendEmailForgotPassword: handleSendEmailForgotPassword,
  handleForgotPassword: handleForgotPassword,
  checkPhonenumberEmail: checkPhonenumberEmail,
  getDetailUserByEmail: getDetailUserByEmail,
};
