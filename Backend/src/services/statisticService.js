const { Op } = require("sequelize");
import db from "../models/index";
import moment from 'moment'
// so sánh ngày
function compareDates(d1, d2) {
    var parts = d1.split('/');
    var num1 = Number(parts[2] + parts[1] + parts[0]);
    parts = d2.split('/');
    var num2 = Number(parts[2] + parts[1] + parts[0]);

    return num1 <= num2  // true: d1 nhỏ hơn hoặc bằng d2
    // false: d1 lớn hơn d2
}


let getCountCardStatistic = async () => {
    try {
        let countUser = await db.User.count({ where: { statusId: 'S1' } })
        let countProduct = await db.Product.count()
        let countReview = await db.Comment.count({
            where: {
                star: { [Op.gt]: 0, }
            }
        })
        let countOrder = await db.OrderProduct.count({
            where: {
                statusId: { [Op.ne]: 'S7', }
            }
        })
        let data = {
            countUser, countProduct, countReview, countOrder
        }
        return ({
            errCode: 0,
            data: data
        })
    } catch (error) {
        throw (error)
    }
}
let getCountStatusOrder = async (data) => {
    try {
        if (!data.oneDate || !data.twoDate) {
            return {
                errCode: 1,
                data: 'Thiếu tham số bắt buộc !'
            }
        }

        let statusOrder = await db.Allcode.findAll({
            where: { type: 'STATUS-ORDER' }
        })

        if (!statusOrder) {
            return { errCode: 2, data: 'Không tìm thấy status order' }
        }

        let orderProduct = await db.OrderProduct.findAll()

        //  Fix: dùng moment(Number(value)) để xử lý cả timestamp lẫn string
        let oneDate = moment(Number(data.oneDate)).isValid()
            ? moment(Number(data.oneDate))
            : moment(new Date(data.oneDate))

        let twoDate = moment(Number(data.twoDate)).isValid()
            ? moment(Number(data.twoDate))
            : moment(new Date(data.twoDate))

        orderProduct = orderProduct.filter(item => {
            if (!item.updatedAt) return false

            let itemDate = moment.utc(item.updatedAt).local()
            if (!itemDate.isValid()) return false

            if (data.type === "day") {
                // So sánh theo ngày
                let itemNum = Number(itemDate.format('YYYYMMDD'))
                let oneNum = Number(oneDate.format('YYYYMMDD'))
                let twoNum = Number(twoDate.format('YYYYMMDD'))
                return itemNum >= oneNum && itemNum <= twoNum

            } else if (data.type === "month") {
                // So sánh theo tháng + năm
                return (
                    itemDate.format('M') === oneDate.format('M') &&
                    itemDate.format('YYYY') === oneDate.format('YYYY')
                )

            } else {
                // So sánh theo năm
                return itemDate.format('YYYY') === oneDate.format('YYYY')
            }
        })

        let arrayLable = []
        let arrayValue = []

        for (let i = 0; i < statusOrder.length; i++) {
            arrayLable.push(statusOrder[i].value)
            arrayValue.push(
                orderProduct.filter(item => item.statusId === statusOrder[i].code).length
            )
        }

        return {
            errCode: 0,
            data: { arrayLable, arrayValue }
        }

    } catch (error) {
        console.error('getCountStatusOrder error:', error)
        throw error
    }
}

// tính tổng tiền sau khi đã trừ đi giảm giá
let totalPriceDiscount = (price, discount) => {
    const voucher = discount.voucherData.typeVoucherOfVoucherData
    if (!voucher) return price
    if (voucher.typeVoucher === "percent") {
        const discountAmount = (price * voucher.value) / 100
        return price - (discountAmount > voucher.maxValue ? voucher.maxValue : discountAmount)
    }
    return price - voucher.maxValue
}

function DaysOfMonth(thang, nam) {
    var mon = parseInt(thang, 10);
    var yar = parseInt(nam, 10);
    switch (mon) {
        case 2:
            if ((yar % 4 == 0 && yar % 100 != 0) || yar % 400 == 0)
                return 29;
            else
                return 28;
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        default:
            return 30;
    }
}


let getStatisticByMonth = async (data) => {

    try {
        if (!data.year) {
            return ({
                errCode: 1,
                data: 'Thiếu tham số bắt buộc !'
            })

        }
        let orderProduct = await db.OrderProduct.findAll(
            {
                where: { statusId: 'S6' },
                include: [
                    { model: db.TypeShip, as: 'typeShipData' },
                    { model: db.Voucher, as: 'voucherData' },
                    { model: db.Allcode, as: 'statusOrderData' },
                ],
                raw: true,
                nest: true
            }
        )
        await Promise.all(
            orderProduct.map(async (item) => {
                const [orderDetail, typeVoucher] = await Promise.all([
                    db.OrderDetail.findAll({ where: { orderId: item.id } }),
                    db.TypeVoucher.findOne({ where: { id: item.voucherData.typeVoucherId } })
                ])
                item.orderDetail = orderDetail
                item.voucherData.typeVoucherOfVoucherData = typeVoucher

                // Tính tổng tiền sản phẩm
                let totalprice = item.orderDetail.reduce((sum, detail) => {
                    return sum + (detail.realPrice * detail.quantity)
                }, 0)
                // Áp dụng voucher nếu có
                item.totalpriceProduct = item.voucherId
                    ? totalPriceDiscount(totalprice, item) + item.typeShipData.price
                    : totalprice + item.typeShipData.price
            })
        )
        // gom doanh thu theo thang
        let arrayMonthLable = []
        let arrayMonthValue = []
        for (let i = 1; i <= 12; i++) {
            arrayMonthLable.push("Th " + i)
            let price = orderProduct
                .filter(item =>
                    moment(item.updatedAt).format('YYYY') === data.year &&
                    +moment(item.updatedAt).format('MM') === i
                )
                .reduce((sum, item) => sum + item.totalpriceProduct, 0)
            arrayMonthValue.push(price)
        }
        return ({
            errCode: 0,
            data: {
                arrayMonthLable,
                arrayMonthValue
            }

        })
    } catch (error) {
        throw (error)
    }
}


let getStatisticByDay = async (data) => {

    try {
        if (!data.month || !data.year) {
            return ({
                errCode: 1,
                data: 'Thiếu tham số bắt buộc !'
            })

        }
        let day = DaysOfMonth(data.month, data.year)
        let orderProduct = await db.OrderProduct.findAll(
            {
                where: { statusId: 'S6' },
                include: [
                    { model: db.TypeShip, as: 'typeShipData' },
                    { model: db.Voucher, as: 'voucherData' },
                    { model: db.Allcode, as: 'statusOrderData' },

                ],
                raw: true,
                nest: true
            }
        )
         await Promise.all(
            orderProduct.map(async (item) => {
                const [orderDetail, typeVoucher] = await Promise.all([
                    db.OrderDetail.findAll({ where: { orderId: item.id } }),
                    db.TypeVoucher.findOne({ where: { id: item.voucherData.typeVoucherId } })
                ])
                item.orderDetail = orderDetail
                item.voucherData.typeVoucherOfVoucherData = typeVoucher

                //   reduce thay vì for loop
                let totalprice = item.orderDetail.reduce((sum, detail) => {
                    return sum + (detail.realPrice * detail.quantity)
                }, 0)

                item.totalpriceProduct = item.voucherId
                    ? totalPriceDiscount(totalprice, item) + item.typeShipData.price
                    : totalprice + item.typeShipData.price
            })
        )


        const today = moment()
        const todayDay = +today.format('DD')
        const todayMonth = today.format('M')
        const todayYear = today.format('YYYY')

        let arrayDayLable = []
        let arrayDayValue = []

        for (let i = 1; i <= day; i++) {
            //   Kiểm tra ngày hiện tại
            const isToday = todayDay === i
                && todayYear === data.year
                && todayMonth === data.month
            arrayDayLable.push(isToday ? 'Today' : i)

            //   filter + reduce thay vì for loop lồng nhau
            let price = orderProduct
                .filter(item =>
                    moment(item.updatedAt).format('YYYY') === data.year &&
                    +moment(item.updatedAt).format('M') === +data.month &&
                    +moment(item.updatedAt).format('DD') === i
                )
                .reduce((sum, item) => sum + item.totalpriceProduct, 0)

            arrayDayValue.push(price)
        }
        return ({
            errCode: 0,
            data: {
                arrayDayLable,
                arrayDayValue
            }

        })
    } catch (error) {
        throw (error)
    }

}


let getStatisticProfit = async (data) => {
    try {
        if (!data.oneDate || !data.twoDate) {
            return ({
                errCode: 1,
                data: 'Thiếu tham số bắt buộc !'
            })
        }

        let orderProduct = await db.OrderProduct.findAll({
            where: { statusId: 'S6' },
            include: [
                { model: db.TypeShip, as: 'typeShipData' },
                { model: db.Voucher, as: 'voucherData' },
                { model: db.Allcode, as: 'statusOrderData' },
            ],
            raw: true,
            nest: true
        })

        //   Promise.all thay vì for loop
        await Promise.all(
            orderProduct.map(async (item) => {
                const [orderDetail, typeVoucher] = await Promise.all([
                    db.OrderDetail.findAll({ where: { orderId: item.id } }),
                    db.TypeVoucher.findOne({ where: { id: item.voucherData.typeVoucherId } })
                ])
                item.orderDetail = orderDetail
                item.voucherData.typeVoucherOfVoucherData = typeVoucher

                //   Promise.all cho từng orderDetail
                await Promise.all(
                    item.orderDetail.map(async (detail) => {
                        let receiptDetail = await db.ReceiptDetail.findAll({
                            where: { productDetailSizeId: detail.productId }
                        })

                        //   reduce thay vì for loop
                        const { avgPrice, avgQuantity } = receiptDetail.reduce((acc, r) => {
                            acc.avgPrice += r.quantity * r.price
                            acc.avgQuantity += r.quantity
                            return acc
                        }, { avgPrice: 0, avgQuantity: 0 })

                        detail.importPrice = Math.round(avgPrice / avgQuantity)
                    })
                )

                //   reduce thay vì for loop
                const { totalprice, importPrice } = item.orderDetail.reduce((acc, detail) => {
                    acc.totalprice += detail.realPrice * detail.quantity
                    acc.importPrice += detail.importPrice * detail.quantity
                    return acc
                }, { totalprice: 0, importPrice: 0 })

                item.importPrice = importPrice

                //   Tính tổng tiền và lợi nhuận
                const finalPrice = item.voucherId
                    ? totalPriceDiscount(totalprice, item) + item.typeShipData.price
                    : totalprice + item.typeShipData.price

                item.totalpriceProduct = finalPrice
                item.profitPrice = finalPrice - importPrice
            })
        )

        //   Tính sẵn oneDate và twoDate 1 lần thay vì tính lại mỗi item
        const parseDateToNum = (momentObj) => {
            return Number(momentObj.format('YYYYMMDD'))
        }
        const oneDateNum = parseDateToNum(moment(data.oneDate))
        const twoDateNum = parseDateToNum(moment(data.twoDate))

        //   filter gọn hơn
        orderProduct = orderProduct.filter(item => {
            const itemMoment = moment.utc(item.updatedAt).local()

            if (data.type === 'day') {
                const itemNum = parseDateToNum(itemMoment)
                return itemNum >= oneDateNum && itemNum <= twoDateNum

            } else if (data.type === 'month') {
                return itemMoment.format('M') === moment(data.oneDate).format('M')
                    && itemMoment.format('YYYY') === moment(data.oneDate).format('YYYY')

            } else {
                return itemMoment.format('YYYY') === moment(data.oneDate).format('YYYY')
            }
        })

        return ({
            errCode: 0,
            data: orderProduct
        })

    } catch (error) {
        throw (error)
    }
}
let getStatisticOverturn = async (data) => {
    try {
        if (!data.oneDate || !data.twoDate) {
            return ({
                errCode: 1,
                data: 'Thiếu tham số bắt buộc !'
            })
        }

        let orderProduct = await db.OrderProduct.findAll({
            where: { statusId: 'S6' },
            include: [
                { model: db.TypeShip, as: 'typeShipData' },
                { model: db.Voucher, as: 'voucherData' },
                { model: db.Allcode, as: 'statusOrderData' },
            ],
            raw: true,
            nest: true
        })

        //   Promise.all thay vì for loop
        await Promise.all(
            orderProduct.map(async (item) => {
                const [orderDetail, typeVoucher] = await Promise.all([
                    db.OrderDetail.findAll({ where: { orderId: item.id } }),
                    db.TypeVoucher.findOne({ where: { id: item.voucherData.typeVoucherId } })
                ])
                item.orderDetail = orderDetail
                item.voucherData.typeVoucherOfVoucherData = typeVoucher

                //   reduce thay vì for loop
                const totalprice = item.orderDetail.reduce((sum, detail) => {
                    return sum + (detail.realPrice * detail.quantity)
                }, 0)

                item.totalpriceProduct = item.voucherId
                    ? totalPriceDiscount(totalprice, item) + item.typeShipData.price
                    : totalprice + item.typeShipData.price
            })
        )

        //   Tính sẵn 1 lần thay vì tính lại mỗi item
        const parseDateToNum = (momentObj) => Number(momentObj.format('YYYYMMDD'))
        const oneDateNum = parseDateToNum(moment(data.oneDate))
        const twoDateNum = parseDateToNum(moment(data.twoDate))

        //   filter gọn hơn
        orderProduct = orderProduct.filter(item => {
            const itemMoment = moment.utc(item.updatedAt).local()

            if (data.type === 'day') {
                const itemNum = parseDateToNum(itemMoment)
                return itemNum >= oneDateNum && itemNum <= twoDateNum

            } else if (data.type === 'month') {
                return itemMoment.format('M') === moment(data.oneDate).format('M')
                    && itemMoment.format('YYYY') === moment(data.oneDate).format('YYYY')

            } else {
                return itemMoment.format('YYYY') === moment(data.oneDate).format('YYYY')
            }
        })

        return ({
            errCode: 0,
            data: orderProduct
        })

    } catch (error) {
        throw (error)
    }
}
let getStatisticStockProduct = async (data) => {
    try {
        let objectFilter = {
            include: [
                { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] },
            ],
            raw: true,
            nest: true
        }
        if (data.limit && data.offset) {
            objectFilter.limit = +data.limit
            objectFilter.offset = +data.offset
        }

        let res = await db.ProductDetailSize.findAndCountAll(objectFilter)

        //   Promise.all thay vì for loop
        await Promise.all(
            res.rows.map(async (item) => {
                const [receiptDetail, orderDetail, productDetailData] = await Promise.all([
                    db.ReceiptDetail.findAll({ where: { productDetailSizeId: item.id } }),
                    db.OrderDetail.findAll({ where: { productId: item.id } }),
                    db.ProductDetail.findOne({ where: { id: item.productdetailId } })
                ])

                item.productDetaildData = productDetailData

                item.productdData = await db.Product.findOne({
                    where: { id: productDetailData.productId },
                    include: [
                        { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] },
                        { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] },
                        { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] },
                    ],
                    raw: true,
                    nest: true
                })

                //   reduce thay vì for loop
                let quantity = receiptDetail.reduce((sum, r) => sum + r.quantity, 0)

                //   Promise.all cho orderDetail
                const orders = await Promise.all(
                    orderDetail.map(detail =>
                        db.OrderProduct.findOne({ where: { id: detail.orderId } })
                    )
                )

                //   Trừ số lượng đã bán (không tính đơn hủy S7)
                orderDetail.forEach((detail, index) => {
                    if (orders[index].statusId !== 'S7') {
                        quantity -= detail.quantity
                    }
                })

                item.stock = quantity
            })
        )

        return ({
            errCode: 0,
            data: res.rows,
            count: res.count
        })

    } catch (error) {
        throw (error)
    }
}
module.exports = {
    getCountCardStatistic: getCountCardStatistic,
    getCountStatusOrder: getCountStatusOrder,
    getStatisticByMonth: getStatisticByMonth,
    getStatisticByDay: getStatisticByDay,
    getStatisticOverturn: getStatisticOverturn,
    getStatisticProfit: getStatisticProfit,
    getStatisticStockProduct: getStatisticStockProduct
}