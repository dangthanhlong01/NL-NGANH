import jwt, { verify } from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models";
dotenv.config();

const secretString = process.env.JWT_SECRET;
// Middleware xác thực token cho người dùng
const middlewaresController = {
    // Middleware xác thực token cho người dùng
    verifyTokenUser: (req, res, next) =>{
        const token = req.headers.authorization;
        if (!token){
            return res.status(401).json({
                status: false,
                message: 'Bạn không được xác thực !',
                refresh: true
            })
        }
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, secretString, async (err, payLoad) =>{
                if (err){
                    return res.status(403).json({
                        status: false,
                        message: 'Token không hợp lệ !',
                        refresh: true
                    })
                }
                const user = await db.User.findOne({
                    where: {id: payLoad.sub}
                })
                if (!user){
                    return res.status(404).json({
                        status: false,
                        message: 'Người dùng không tồn tại !',
                        refresh: true
                    })
                }
                req.user = user;
                next();
            })
        
    },

// Middleware xác thực token cho admin
    verifyTokenAdmin: (req, res, next) => {
        const token = req.headers.authorization;
        if (!token){
            return res.status(401).json({
                status: false,
                message: 'Bạn không được xác thực !',
                refresh: true
            })
        }
        const accessToken = token.split(' ')[1];
        jwt.verify(accessToken, secretString, async (err, payLoad) => {
            if (err){
                return res.status(403).json({
                    status: false,
                    message: 'Token không hợp lệ !',
                    refresh: true
                })
            }
            const user = await db.User.findOne({
                where: {id: payLoad.sub}
            })
            if (!user){
                return res.status(404).json({
                    status: false,
                    message: 'Người dùng không tồn tại !',
                    refresh: true
                })
            }
            if(user.roleId == 'R4' || user.roleId == 'R1'){
                req.user = user;
                next();
            }else{
                return res.status(403).json({
                status: false,
                message: 'Bạn không có quyền truy cập !',
                refresh: true
            })
            }
            
        })
    }
}

module.exports = middlewaresController;