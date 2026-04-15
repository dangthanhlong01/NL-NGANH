import supplierService from '../services/supplierService';

let createNewSupplier = async (req, res) => {
    try {
        let data = await supplierService.createNewSupplier(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let getDetailSupplierById = async (req, res) => {
    try {
        let data = await supplierService.getDetailSupplierById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let getAllSupplier = async (req, res) => {
    try {
        let data = await supplierService.getAllSupplier(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let updateSupplier = async (req, res) => {
    try {
        let data = await supplierService.updateSupplier(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ phía máy chủ'
        })
    }
}
let deleteSupplier = async (req, res) => {
    try {
        let data = await supplierService.deleteSupplier(req.body);
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
    createNewSupplier:createNewSupplier,
    getDetailSupplierById:getDetailSupplierById,
    getAllSupplier:getAllSupplier,
    updateSupplier:updateSupplier,
    deleteSupplier:deleteSupplier
}