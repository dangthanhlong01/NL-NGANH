import addressUserService from '../services/addressUserService';

// tao moi dia chi user
let createNewAddressUser = async (req, res) => {
    try {
        let data = await addressUserService.createNewAddressUser(req.body);
        return res.status(200).json(data);
    } catch (error){
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// lay tat ca dia chi user theo id
let getAllAddressUserByUserId = async (req, res)=>{
    try {
        let data = await addressUserService.getAllAddressUserByUserId(req.query.userId);
        return res.status(200).json(data);
    } catch (error){
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        });
    }
}

// xoa dia chi user
let deleteAddressUser = async (req, res) =>{
    try {
        let data = await addressUserService.deleteAddressUser(req.body);
        return res.status(200).json(data);
    } catch (error){
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        });
    }
}

// sua chi chi user
let editAddressUser = async (req, res) => {
    try {
        let data = await addressUserService.editAddressUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}

// lay chi tiet dia chi user theo id
let getDetailAddressUserById = async (req, res) => {
    try {
        let data = await addressUserService.getDetailAddressUserById(req.query.id);
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
    createNewAddressUser: createNewAddressUser,
    getAllAddressUserByUserId: getAllAddressUserByUserId,
    deleteAddressUser: deleteAddressUser,
    editAddressUser: editAddressUser,
    getDetailAddressUserById: getDetailAddressUserById
}