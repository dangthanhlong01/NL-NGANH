import receiptService from '../services/receiptService';

let createNewReceipt = async (req, res) => {
    try {
        let data = await receiptService.createNewReceipt(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let getDetailReceiptById = async (req, res) => {
    try {
        let data = await receiptService.getDetailReceiptById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let getAllReceipt = async (req, res) => {
    try {
        let data = await receiptService.getAllReceipt(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let updateReceipt = async (req, res) => {
    try {
        let data = await receiptService.updateReceipt(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let deleteReceipt = async (req, res) => {
    try {
        let data = await receiptService.deleteReceipt(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let createNewReceiptDetail = async (req, res) => {
    try {
        let data = await receiptService.createNewReceiptDetail(req.body);
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
    createNewReceipt:createNewReceipt,
    getDetailReceiptById:getDetailReceiptById,
    getAllReceipt:getAllReceipt,
    updateReceipt:updateReceipt,
    deleteReceipt:deleteReceipt,
    createNewReceiptDetail:createNewReceiptDetail
}