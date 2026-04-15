import React, { useEffect, useState } from 'react';
import ShopCartItem from '../../component/ShopCart/ShopCartItem';
import { useSelector, useDispatch } from 'react-redux';
import { ChooseTypeShipStart, getItemCartStart } from '../../action/ShopCartAction'
import storeVoucherLogo from '../../../src/resources/img/storeVoucher.png'
import { getAllTypeShip, getAllAddressUserByUserIdService, createNewAddressUserrService } from '../../services/userService';
import './ShopCartPage.scss';
import VoucherModal from './VoucherModal';
import { Link, useHistory } from 'react-router-dom';
import AddressUsersModal from './AdressUserModal';
import { toast } from 'react-toastify';
import CommonUtils from '../../utils/CommonUtils';

function ShopCartPage(props) {
    const dispatch = useDispatch()
    let history = useHistory();
    const [isOpenModal, setisOpenModal] = useState(false)
    const [isOpenModalAddressUser, setisOpenModalAddressUser] = useState(false)
    const [user, setuser] = useState(null)
    const [typeShip, settypeShip] = useState([])
    let dataTypeShip = useSelector(state => state.shopcart.dataTypeShip)
    let dataCart = useSelector(state => state.shopcart.listCartItem)
    let dataVoucher = useSelector(state => state.shopcart.dataVoucher)
    const [priceShip, setpriceShip] = useState(0)

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'))
        if (!userData || !userData.id) {
            toast.error("Hãy đăng nhập để mua hàng")
            return
        }
        setuser(userData)
        dispatch(getItemCartStart(Number(userData.id)))

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
    }, [])

    let price = 0;

    let closeModal = () => {
        setisOpenModal(false)
    }

    let closeModaAddressUser = () => {
        setisOpenModalAddressUser(false)
    }

    let handleOpenModal = () => {
        setisOpenModal(true)
    }

    let handleOpenAddressUserModal = async () => {
        if (!user || !user.id) {
            toast.error("Hãy đăng nhập để mua hàng")
            return
        }

        if (!dataCart || dataCart.length === 0) {
            toast.error("Giỏ hàng trống !")
            return
        }

        try {
            let res = await getAllAddressUserByUserIdService(Number(user.id))
            console.log('=== check address ===', res)

            if (res && res.errCode === 0 && res.data && res.data.length > 0) {
                // Đã có địa chỉ → chuyển sang trang đặt hàng
                history.push(`/order/${user.id}`)
            } else {
                // Chưa có địa chỉ → mở modal thêm địa chỉ
                setisOpenModalAddressUser(true)
            }
        } catch (error) {
            console.error('Lỗi kiểm tra địa chỉ:', error)
            toast.error("Có lỗi xảy ra, vui lòng thử lại")
        }
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
                userId: Number(user.id)
            })

            if (res && res.errCode === 0) {
                toast.success("Thêm địa chỉ thành công !")
                history.push(`/order/${user.id}`)
            } else {
                toast.error(res.errMessage)
            }
        } catch (error) {
            console.error('Lỗi thêm địa chỉ:', error)
            toast.error("Có lỗi xảy ra, vui lòng thử lại")
        }
    }

    let closeModalFromVoucherItem = () => {
        setisOpenModal(false)
    }

    let hanldeOnChangeTypeShip = (item) => {
        setpriceShip(item.price)
        dispatch(ChooseTypeShipStart(item))
    }

    return (
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
                                    <th scope="col">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataCart && dataCart.length > 0 ?
                                    dataCart.map((item, index) => {
                                        price += item.quantity * item.productDetail.discountPrice
                                        let name = `${item.productData.name} - ${item.productDetail.nameDetail} - ${item.productdetailsizeData.sizeData.value}`
                                        return (
                                            <ShopCartItem
                                                isOrder={false}
                                                id={item.id}
                                                userId={user && Number(user.id)}
                                                productdetailsizeId={item.productdetailsizeData.id}
                                                key={index}
                                                name={name}
                                                price={item.productDetail.discountPrice}
                                                quantity={item.quantity}
                                                image={item.productDetailImage[0].image}
                                            />
                                        )
                                    })
                                    :
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>
                                            Giỏ hàng trống
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="box-shipping">
                    <h6>Chọn đơn vị vận chuyển</h6>
                    <div>
                        {typeShip && typeShip.length > 0 &&
                            typeShip.map((item, index) => {
                                return (
                                    <div key={index} className="form-check">
                                        <input
                                            className="form-check-input"
                                            checked={item.id === dataTypeShip.id}
                                            type="radio"
                                            name="typeshipRadios"
                                            id={`typeshipRadios${index}`}
                                            onChange={() => hanldeOnChangeTypeShip(item)}
                                        />
                                        <label className="form-check-label" htmlFor={`typeshipRadios${index}`}>
                                            {item.type} - {CommonUtils.formatter.format(item.price)}
                                        </label>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

                <div className="box-shopcart-bottom">
                    <div className="content-left">
                        <div className="wrap-voucher">
                            <img width="20px" height="20px" style={{ marginLeft: "-3px" }} src={storeVoucherLogo} alt="" />
                            <span className="name-easier">Easier voucher</span>
                            <span onClick={() => handleOpenModal()} className="choose-voucher">Chọn Hoặc Nhập Mã</span>
                            {dataVoucher && dataVoucher.voucherData &&
                                <span className="choose-voucher">Mã voucher: {dataVoucher.voucherData.codeVoucher}</span>
                            }
                        </div>
                    </div>
                    <div className="content-right">
                        <div className="wrap-price">
                            <span className="text-total">
                                Tổng thanh toán ({dataCart && dataCart.length} sản phẩm):
                            </span>
                            <span className="text-price">
                                {dataVoucher && dataVoucher.voucherData
                                    ? CommonUtils.formatter.format(totalPriceDiscount(price, dataVoucher) + priceShip)
                                    : CommonUtils.formatter.format(price + (+priceShip))
                                }
                            </span>
                        </div>
                        <div className="checkout_btn_inner">
                            <a onClick={() => handleOpenAddressUserModal()} className="main_btn">
                                Đi đến thanh toán
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <VoucherModal
                closeModalFromVoucherItem={closeModalFromVoucherItem}
                price={price + (+priceShip)}
                isOpenModal={isOpenModal}
                closeModal={closeModal}
                id={user && Number(user.id)}
            />
            <AddressUsersModal
                sendDataFromModalAddress={sendDataFromModalAddress}
                isOpenModal={isOpenModalAddressUser}
                closeModaAddressUser={closeModaAddressUser}
            />
        </section>
    );
}

export default ShopCartPage;