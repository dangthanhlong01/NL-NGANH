import db from "../models/index";
import { Op } from 'sequelize';

// tao phong chat moi khi nguoi dung vao trang chat, neu da co phong thi khong tao nua
let createNewRoom = async (data) => {
    try {
        if (!data.userId1) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộcs !'
            })
        }
        let userAdmin = await db.User.findOne({
            where: { email: 'chat@gmail.com' }
        })
        if (!userAdmin) {
            return {
                errCode: -1,
                errMessage: 'Không tìm thấy tài khoản admin'
            }
        }
        let room = await db.RoomMessage.findOne({ where: { userOne: data.userId1 } })
        if (room) {
            return {
                errCode: 2,
                errMessage: 'Đã có phòng'
            }
        }
        await db.RoomMessage.create({
            userOne: data.userId1,
            userTwo: userAdmin.id
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}

//  gui tin nhan moi
let sendMessage = async (data) => {
    try {
        if (!data.userId || !data.roomId || !data.text) {
            return ({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộcs !'
            })
        }
        let room = await db.RoomMessage.findOne({ where: { id: data.roomId } })
        if (!room) {
            return { errCode: -1, errMessage: 'Phòng chat không tồn tại!' }
        }
            await db.Message.create({
            text: data.text,
            userId: data.userId,
            roomId: data.roomId,
            unRead: true
        })
        return ({
            errCode: 0,
            errMessage: 'OK'
        })
    } catch (error) {
        throw (error)
    }
}

/// load tat ca tin nhan trong phong chat
// loadMessage
let loadMessage = async (data) => {
  try {
    if (!data.roomId || !data.userId) {
      return { 
        errCode: 1, 
        errMessage: 'Thiếu tham số bắt buộc!' 
      }
    }

    // Đánh dấu đã đọc tin nhắn của user khác
    await db.Message.update(
      { unRead: false },
      {
        where: {
          roomId: data.roomId,
          userId: { [Op.not]: data.userId }
        }
      }
    )

    // Lấy tất cả tin nhắn trong phòng
    let messages = await db.Message.findAll({
      where: { roomId: data.roomId },
      include: [{
        model: db.User,
        as: 'userData', 
        attributes: ['id', 'firstName', 'lastName', 'image']
      }],
      raw: false,
      nest: true,
    })

    // Convert ảnh
    messages = messages.map(msg => {
      let msgData = msg.toJSON()
      if (msgData.userData?.image) {
        msgData.userData.image = Buffer.from(msgData.userData.image, 'base64').toString('binary');  
      }
      return msgData
    })

    return { 
      errCode: 0, 
      data: messages 
    }
  } catch (error) {
    throw error
  }
}

// load tat ca phong chat cua nguoi dung
let listRoomOfUser = async (userId) => {
  try {
    if (!userId) {
      return {
        errCode: 1,
        errMessage: 'Thiếu tham số bắt buộc !'
      }
    }
    let room = await db.RoomMessage.findAll({
      where: { userOne: userId }
    })
    await Promise.all(
      room.map(async (item) => {
        const [messageData, userOneData, userTwoData] = await Promise.all([
          db.Message.findAll({ where: { roomId: item.id } }),
          db.User.findOne({ where: { id: item.userOne } }),
          db.User.findOne({ where: { id: item.userTwo } }),
        ])

        item.messageData = messageData

        // convert image from buffer to binary string
        if (userOneData && userOneData.image) {
          userOneData.image = Buffer.from(userOneData.image, 'base64').toString('binary')
        }
        item.userOneData = userOneData

         // convert image from buffer to binary string
        if (userTwoData && userTwoData.image) {
          userTwoData.image = Buffer.from(userTwoData.image, 'base64').toString('binary')
        }
        item.userTwoData = userTwoData
      })
    )
    return {
      errCode: 0,
      data: room
    }
  } catch (error) {
    throw error
  }
}

// load tat ca phong chat cua admin
let listRoomOfAdmin = async () => {
  try {
    let user = await db.User.findOne({ 
      where: { email: 'chat@gmail.com' } 
    })

  
    if (!user) {
      return {
        errCode: -1,
        errMessage: 'Không tìm thấy tài khoản admin chat !'
      }
    }

    let room = await db.RoomMessage.findAll({
      where: { userTwo: user.id }
    })


    await Promise.all(
      room.map(async (item) => {
        const [messageData, userOneData, userTwoData] = await Promise.all([
          db.Message.findAll({ where: { roomId: item.id } }),
          db.User.findOne({ where: { id: item.userOne } }),
          db.User.findOne({ where: { id: item.userTwo } }),
        ])

        item.messageData = messageData

       
        if (userOneData && userOneData.image) {
          userOneData.image = Buffer.from(userOneData.image, 'base64').toString('binary')
        }
        item.userOneData = userOneData

        
        if (userTwoData && userTwoData.image) {
          userTwoData.image = Buffer.from(userTwoData.image, 'base64').toString('binary')
        }
        item.userTwoData = userTwoData
      })
    )

    return {
      errCode: 0,
      data: room
    }
  } catch (error) {
    throw error 
  }
}
module.exports = {
    createNewRoom: createNewRoom,
    sendMessage: sendMessage,
    loadMessage: loadMessage,
    listRoomOfUser: listRoomOfUser,
    listRoomOfAdmin: listRoomOfAdmin
}