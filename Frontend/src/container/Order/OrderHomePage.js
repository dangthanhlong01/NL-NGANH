import React, { useEffect, useState } from 'react';
import { NavLink, useHistory, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    getAllAddressUserByUserIdService, createNewAddressUserrService,
    getAllTypeShip, createNewOrderService
} from '../../services/userService';
import './OrderHomePage.scss';
import AddressUsersModal from '../ShopCart/AdressUserModal';
import { ChooseTypeShipStart, getItemCartStart } from '../../action/ShopCartAction'
import { toast } from 'react-toastify';
import storeVoucherLogo from '../../../src/resources/img/storeVoucher.png'
import ShopCartItem from '../../component/ShopCart/ShopCartItem';
import VoucherModal from '../ShopCart/VoucherModal';
import CommonUtils from '../../utils/CommonUtils';

function OrderHomePage(props) {
    const dispatch = useDispatch()
    const { userId } = useParams()
    const userIdNum = Number(userId)  // ✅ ép kiểu 1 lần duy nhất

    let history = useHistory()
    const [dataAddressUser, setdataAddressUser] = useState([])
    const [addressUserId, setaddressUserId] = useState(null)
    const [priceShip, setpriceShip] = useState(0)
    const [stt, setstt] = useState(0)
    const [isChangeAdress, setisChangeAdress] = useState(false)
    const [isOpenModalAddressUser, setisOpenModalAddressUser] = useState(false)
    const [isOpenModal, setisOpenModal] = useState(false)
    const [typeShip, settypeShip] = useState([])
    const [note, setnote] = useState('')

    let price = 0;
    let dataCart = useSelector(state => state.shopcart.listCartItem)
    let dataVoucher = useSelector(state => state.shopcart.dataVoucher)
    let dataTypeShip = useSelector(state => state.shopcart.dataTypeShip)

    useEffect(() => {
        if (!userIdNum || isNaN(userIdNum)) {
            toast.error("Không xác định được người dùng !")
            return
        }

        dispatch(getItemCartStart(userIdNum))
        loadDataAddress(userIdNum)

        let fetchTypeShip = async () => {
            let res = await getAllTypeShip({ limit: '', offset: '', keyword: '' })
            if (res && res.errCode === 0) {
                settypeShip(res.data)
            }
        }
        fetchTypeShip()

        if (dataTypeShip && dataTypeShip.price) {
            setpriceShip(dataTypeShip.price)
        }
    }, [userIdNum])

    let loadDataAddress = async (uid) => {
        try {
            let res = await getAllAddressUserByUserIdService(Number(uid))
            console.log('=== RES ADDRESS ===', res)

            if (res && res.errCode === 0 && res.data && res.data.length > 0) {
                console.log('=== DATA[0] ===', res.data[0])
                console.log('=== KEYS ===', Object.keys(res.data[0]))
                setdataAddressUser(res.data)
                setaddressUserId(Number(res.data[0].id))
                setstt(0)
            } else {
                console.log('Không có địa chỉ hoặc lỗi:', res)
            }
        } catch (error) {
            console.error('loadDataAddress error:', error)
        }
    }

    let closeModaAddressUser = () => setisOpenModalAddressUser(false)
    let handleOpenAddressUserModal = () => setisOpenModalAddressUser(true)
    let handleOpenModal = () => setisOpenModal(true)
    let closeModal = () => setisOpenModal(false)
    let closeModalFromVoucherItem = () => setisOpenModal(false)

    let sendDataFromModalAddress = async (data) => {
        setisOpenModalAddressUser(false)

        if (!data.shipName || !data.shipAdress || !data.shipPhonenumber) {
            toast.error("Vui lòng điền đầy đủ thông tin địa chỉ !")
            return
        }

        try {
            let res = await createNewAddressUserrService({
                shipName: data.shipName,
                shipAdress: data.shipAdress,
                shipEmail: data.shipEmail,
                shipPhonenumber: data.shipPhonenumber,
                userId: userIdNum  // ✅
            })

            if (res && res.errCode === 0) {
                toast.success("Thêm địa chỉ thành công !")

                let resAddress = await getAllAddressUserByUserIdService(userIdNum)  // ✅
                if (resAddress && resAddress.errCode === 0 && resAddress.data && resAddress.data.length > 0) {
                    setdataAddressUser(resAddress.data)
                    let lastIndex = resAddress.data.length - 1
                    setaddressUserId(Number(resAddress.data[lastIndex].id))
                    setstt(lastIndex)
                }
                setisChangeAdress(false)
            } else {
                toast.error(res.errMessage)
            }
        } catch (error) {
            console.error('sendDataFromModalAddress error:', error)
            toast.error("Có lỗi xảy ra, vui lòng thử lại")
        }
    }

    let handleOnChange = (id, index) => {
        setaddressUserId(Number(id))  // ✅
        setstt(index)
    }

    let totalPriceDiscount = (price, discount) => {
        if (discount.voucherData.typeVoucherOfVoucherData.typeVoucher === "percent") {
            if (((price * discount.voucherData.typeVoucherOfVoucherData.value) / 100) > discount.voucherData.typeVoucherOfVoucherData.maxValue) {
                return price - discount.voucherData.typeVoucherOfVoucherData.maxValue
            } else {
                return price - ((price * discount.voucherData.typeVoucherOfVoucherData.value) / 100)
            }
        } else {
            return price - discount.voucherData.typeVoucherOfVoucherData.maxValue
        }
    }

    let handleChooseTypeShip = (item) => {
        dispatch(ChooseTypeShipStart(item))
        setpriceShip(item.price)
    }

    let handleSaveOrder = async () => {
        if (!dataTypeShip || !dataTypeShip.id) {
            toast.error("Chưa chọn đơn vị vận chuyển")
            return
        }
        if (!addressUserId) {
            toast.error("Chưa có địa chỉ nhận hàng")
            return
        }
        if (!dataCart || dataCart.length === 0) {
            toast.error("Giỏ hàng trống !")
            return
        }

        try {
            let result = dataCart.map((item) => ({
                productId: item.productdetailsizeId,
                quantity: item.quantity,
                realPrice: item.productDetail.discountPrice
            }))

            let res = await createNewOrderService({
                orderdate: Date.now(),
                addressUserId: addressUserId,
                isPaymentOnlien: 0,
                typeShipId: dataTypeShip.id,
                voucherId: dataVoucher && dataVoucher.voucherId ? dataVoucher.voucherId : null,
                note: note,
                userId: userIdNum,  // ✅
                arrDataShopCart: result
            })

            if (res && res.errCode === 0) {
                toast.success("Đặt hàng thành công")
                dispatch(getItemCartStart(userIdNum))
                setTimeout(() => {
                    window.location.href = '/user/order/' + userIdNum
                }, 2000)
            } else {
                toast.error(res.errMessage)
            }
        } catch (error) {
            console.error('handleSaveOrder error:', error)
            toast.error("Có lỗi xảy ra, vui lòng thử lại")
        }
    }

    return (
        <>
            <div className="wrap-order">
                <div className="wrap-heading-order">
                    <NavLink to="/" className="navbar-brand logo_h">
                        <img src="/resources/img/logo.png" alt="" />
                    </NavLink>
                    <span>Thanh Toán</span>
                </div>

                <div className="wrap-address-order">
                    <div className="border-top-address-order"></div>
                    <div className="wrap-content-address">
                        <div className="content-up">
                            <div className="content-left">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>Địa Chỉ Nhận Hàng</span>
                            </div>
                            {isChangeAdress === true &&
                                <div className="content-right">
                                    <div className="wrap-add-address">
                                        <i className="fas fa-plus"></i>
                                        <span onClick={handleOpenAddressUserModal}>Thêm địa chỉ mới</span>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className="content-down">
                            {isChangeAdress === false ?
                                <>
                                    <div className="content-left">
                                        <span>
                                            {dataAddressUser && dataAddressUser.length > 0 && dataAddressUser[stt]?.shipName}
                                            {' '}
                                            ({dataAddressUser && dataAddressUser.length > 0 && dataAddressUser[stt]?.shipPhonenumber})
                                        </span>
                                    </div>
                                    <div className="content-center">
                                        <span>
                                            {dataAddressUser && dataAddressUser.length > 0 && dataAddressUser[stt]?.shipAdress}
                                        </span>
                                    </div>
                                </>
                                :
                                <div>
                                    {dataAddressUser && dataAddressUser.length > 0 &&
                                        dataAddressUser.map((item, index) => (
                                            <div key={index} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    checked={Number(item.id) === Number(addressUserId)}  // ✅
                                                    onChange={() => handleOnChange(item.id, index)}
                                                    type="radio"
                                                    name="addressRadios"
                                                    id={`addressRadios${index}`}
                                                />
                                                <label className="form-check-label wrap-radio-address" htmlFor={`addressRadios${index}`}>
                                                    <div className="content-left">
                                                        <span>{item.shipName} ({item.shipPhonenumber})</span>
                                                    </div>
                                                    <div className="content-center">
                                                        <span>{item.shipAdress}</span>
                                                    </div>
                                                </label>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                            <div className="content-right">
                                <span className="text-default">Mặc định</span>
                                {isChangeAdress === false &&
                                    <span onClick={() => setisChangeAdress(true)} className="text-change">Thay đổi</span>
                                }
                            </div>
                        </div>

                        {isChangeAdress === true &&
                            <div className="box-action">
                                <div onClick={() => setisChangeAdress(false)} className="wrap-back">
                                    <span>Trở về</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <div className="wrap-order-item">
                    <section className="cart_area">
                        <div className="container">
                            <div className="cart_inner">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Sản phẩm</th>
                                                <th scope="col">Giá</th>
                                                <th style={{ textAlign: 'center' }} scope="col">Số lượng</th>
                                                <th style={{ textAlign: 'center' }} scope="col">Tổng tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataCart && dataCart.length > 0 &&
                                                dataCart.map((item, index) => {
                                                    price += item.quantity * item.productDetail.discountPrice
                                                    let name = `${item.productData.name} - ${item.productDetail.nameDetail} - ${item.productdetailsizeData.sizeData.value}`
                                                    return (
                                                        <ShopCartItem
                                                            isOrder={true}
                                                            id={item.id}
                                                            userId={userIdNum}  // ✅
                                                            productdetailsizeId={item.productdetailsizeData.id}
                                                            key={index}
                                                            name={name}
                                                            price={item.productDetail.discountPrice}
                                                            quantity={item.quantity}
                                                            image={item.productDetailImage[0].image}
                                                        />
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="box-shipping">
                                <h6>Chọn đơn vị vận chuyển</h6>
                                <div>
                                    {typeShip && typeShip.length > 0 &&
                                        typeShip.map((item, index) => (
                                            <div key={index} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    checked={item.id === dataTypeShip.id}
                                                    type="radio"
                                                    name="typeshipRadios"
                                                    id={`typeshipRadios${index}`}
                                                    onChange={() => handleChooseTypeShip(item)}
                                                />
                                                <label className="form-check-label" htmlFor={`typeshipRadios${index}`}>
                                                    {item.type} - {CommonUtils.formatter.format(item.price)}
                                                </label>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            <div className="box-shopcart-bottom">
                                <div className="content-left">
                                    <div className="wrap-voucher">
                                        <img width="20px" height="20px" style={{ marginLeft: "-3px" }} src={storeVoucherLogo} alt="" />
                                        <span className="name-easier">Easier voucher</span>
                                        <span onClick={handleOpenModal} className="choose-voucher">Chọn Mã</span>
                                        {dataVoucher && dataVoucher.voucherData &&
                                            <span className="choose-voucher">Mã voucher: {dataVoucher.voucherData.codeVoucher}</span>
                                        }
                                    </div>
                                    <div className="wrap-note">
                                        <span>Lời Nhắn:</span>
                                        <input
                                            value={note}
                                            onChange={(e) => setnote(e.target.value)}
                                            type="text"
                                            placeholder="Lưu ý cho Người bán..."
                                        />
                                    </div>
                                </div>
                                <div className="content-right">
                                    <div className="wrap-price">
                                        <span className="text-total">Tổng thanh toán ({dataCart && dataCart.length} sản phẩm): </span>
                                        <span className="text-price">
                                            {dataVoucher && dataVoucher.voucherData
                                                ? CommonUtils.formatter.format(totalPriceDiscount(price, dataVoucher) + priceShip)
                                                : CommonUtils.formatter.format(price + (+priceShip))
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="wrap-payment">
                    <div className="content-bottom">
                        <div className="wrap-bottom">
                            <div className="box-flex">
                                <div className="head">Tổng tiền hàng</div>
                                <div>{CommonUtils.formatter.format(price)}</div>
                            </div>
                            <div className="box-flex">
                                <div className="head">Tổng giảm giá</div>
                                <div>
                                    {dataVoucher && dataVoucher.voucherData
                                        ? CommonUtils.formatter.format(price - totalPriceDiscount(price, dataVoucher))
                                        : CommonUtils.formatter.format(0)
                                    }
                                </div>
                            </div>
                            <div className="box-flex">
                                <div className="head">Phí vận chuyển</div>
                                <div>{CommonUtils.formatter.format(priceShip)}</div>
                            </div>
                            <div className="box-flex">
                                <div className="head">Tổng thanh toán:</div>
                                <div className="money">
                                    {dataVoucher && dataVoucher.voucherData
                                        ? CommonUtils.formatter.format(totalPriceDiscount(price, dataVoucher) + priceShip)
                                        : CommonUtils.formatter.format(price + (+priceShip))
                                    }
                                </div>
                            </div>
                            <div className="box-flex">
                                <a onClick={handleSaveOrder} className="main_btn">Đặt hàng</a>
                            </div>
                        </div>
                    </div>
                </div>

                <VoucherModal
                    closeModalFromVoucherItem={closeModalFromVoucherItem}
                    price={price + (+priceShip)}
                    isOpenModal={isOpenModal}
                    closeModal={closeModal}
                    id={userIdNum}  // ✅
                />
                <AddressUsersModal
                    sendDataFromModalAddress={sendDataFromModalAddress}
                    isOpenModal={isOpenModalAddressUser}
                    closeModaAddressUser={closeModaAddressUser}
                />
            </div>
            <div style={{ width: '100%', height: '100px', backgroundColor: '#f5f5f5' }}></div>
        </>
    );
}

export default OrderHomePage;