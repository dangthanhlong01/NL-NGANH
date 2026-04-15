//Service này sẽ xử lý các logic liên quan đến địa chỉ người dùng
import db from "../models/index";

//Tạo mới địa chỉ người dùng
let createNewAddressUser = async (data) => {
  try {
    if (!data.userId) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc: userId !",
      };
    }
    await db.AddressUser.create({
      userId: data.userId,
      shipName: data.shipName,
      shipPhonenumber: data.shipPhonenumber,
      shipAdress: data.shipAdress,
      shipEmail: data.shipEmail,
    });
    return {
      errCode: 0,
      errMessage: "Ok",
    };
  } catch (error) {
    throw error;
  }
};

//Lấy tất cả địa chỉ người dùng theo userId
let getAllAddressUserByUserId = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'khong co tham so  !'
                })
            } else {
                let res = await db.AddressUser.findAll({
                    where: { userId: userId }

                })
                resolve({
                    errCode: 0,
                    data: res
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Xóa địa chỉ người dùng
let deleteAddressUser = async (data) => {
  try {
    if (!data.id) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc: id !",
      };
    }
    let addressUser = await db.AddressUser.findOne({
      where: {
        id: data.id,
      },
      raw: false
    });
    if (addressUser) {
      await addressUser.destroy();
      return {
        errCode: 0,
        errMessage: "Ok",
      };
    }
    return {
      errCode: -1,
      errMessage: "Địa chỉ người dùng không tồn tại",
    };
  } catch (error) {
    throw error;
  }
};

// Sửa địa chỉ người dùng
let editAddressUser = async (data) => {
  try {
    if (!data.id || !data.userId) {
      return {
        errCode: 1,
        errMessage: "Thiếu id hoặc userId!",
      };
    }

    let addressUser = await db.AddressUser.findOne({
      where: { id: data.id },
      raw: false,
    });

    if (addressUser) {
      if (data.shipName !== undefined) {
        addressUser.shipName = data.shipName;
      }

      if (data.shipPhonenumber !== undefined) {
        addressUser.shipPhonenumber = data.shipPhonenumber;
      }

      if (data.shipAddress !== undefined) {
        addressUser.shipAddress = data.shipAddress;
      }

      if (data.shipEmail !== undefined) {
        addressUser.shipEmail = data.shipEmail;
      }

      await addressUser.save();

      return {
        errCode: 0,
        errMessage: "OK",
      };
    }

    return {
      errCode: -1,
      errMessage: "Địa chỉ người dùng không tồn tại",
    };
  } catch (error) {
    throw error;
  }
};


// Lấy chi tiết địa chỉ người dùng theo id
let getDetailAddressUserById = async (id) => {
  try {
    if (!id) {
      return {
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc: id !",
      };
    }
    let detailAddressUser = await db.AddressUser.findOne({
      where: { id: id },
    });
    if (!detailAddressUser) {
      return {
        errCode: -1,
        errMessage: "Địa chỉ người dùng không tồn tại",
      };
    }
    return {
      errCode: 0,
      data: detailAddressUser,
    };
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createNewAddressUser: createNewAddressUser,
  getAllAddressUserByUserId: getAllAddressUserByUserId,
  deleteAddressUser: deleteAddressUser,
  editAddressUser: editAddressUser,
  getDetailAddressUserById: getDetailAddressUserById,
};
