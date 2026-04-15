import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllAddressUserByUserIdService, createNewAddressUserrService, deleteAddressUserService, editAddressUserService } from '../../services/userService';
import AddressUsersModal from '../ShopCart/AdressUserModal';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useParams
} from "react-router-dom";
import './AddressUser.scss';
function AddressUser(props) {

    const [dataAddressUser, setdataAddressUser] = useState([])
    const [addressUserId, setaddressUserId] = useState('')
    const [isOpenModalAddressUser, setisOpenModalAddressUser] = useState(false)
    useEffect(() => {
        let userId = props.id
        if (userId) {
            let fetchDataAddress = async () => {
                let res = await getAllAddressUserByUserIdService(userId)
                if (res && res.errCode === 0) {
                    setdataAddressUser(res.data)

                }
            }
            fetchDataAddress()
        }

    }, [props.id])
    let sendDataFromModalAddress = async (data) => {
    

    if (!data.shipName || data.shipName.trim() === '') {
        toast.error("Họ và tên không được để trống")
        return;
    }

    if (!data.shipAdress || data.shipAdress.trim() === '') {
        toast.error("Địa chỉ không được để trống")
        return;
    }

    if (!data.shipEmail || data.shipEmail.trim() === '') {
        toast.error("Email không được để trống")
        return;
    }

    if (!data.shipPhonenumber || data.shipPhonenumber.trim() === '') {
        toast.error("Số điện thoại không được để trống")
        return;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(data.shipPhonenumber)) {
        toast.error("Số điện thoại phải gồm đúng 10 số")
        return;
    }

    if (data.isActionUpdate === false) {
        let res = await createNewAddressUserrService({
            shipName: data.shipName,
            shipAdress: data.shipAdress,
            shipEmail: data.shipEmail,
            shipPhonenumber: data.shipPhonenumber,
            userId: props.id,
        })

        if (res && res.errCode === 0) {
            toast.success("Thêm địa chỉ thành công !")
            setisOpenModalAddressUser(false)
            setaddressUserId('')
            let res = await getAllAddressUserByUserIdService(props.id)
            if (res && res.errCode === 0) {
                setdataAddressUser(res.data)
            }
        } else {
            toast.error(res.errMessage)
        }
    } else {
        let res = await editAddressUserService({
            id: data.id,
            shipName: data.shipName,
            shipAdress: data.shipAdress,
            shipEmail: data.shipEmail,
            shipPhonenumber: data.shipPhonenumber,
            userId: props.id,
        })

        if (res && res.errCode === 0) {
            toast.success("Cập nhật địa chỉ thành công !")
            setisOpenModalAddressUser(false)
            setaddressUserId('')    
            let res = await getAllAddressUserByUserIdService(props.id)
            if (res && res.errCode === 0) {
                setdataAddressUser(res.data)
            }
        } else {
            toast.error(res.errMessage)
        }
    }
}

    let closeModaAddressUser = () => {
        setisOpenModalAddressUser(false)
        setaddressUserId('')
    }
    let handleOpenAddressUserModal = async () => {

        setisOpenModalAddressUser(true)
    }
    let handleDeleteAddress = async (id) => {

        let res = await deleteAddressUserService({
            data: {
                id: id,
            }
        })
        if (res && res.errCode === 0) {
            toast.success("Xóa địa chỉ user thành công")
            let res = await getAllAddressUserByUserIdService(props.id)
            if (res && res.errCode === 0) {
                setdataAddressUser(res.data)

            }
        } else {
            toast.error("Xóa địa chỉ user thất bại")
        }
    }
    let handleEditAddress = (id) => {
        setaddressUserId(id)
        setisOpenModalAddressUser(true)
    }
    return (

        <div className="container rounded bg-white mt-5 mb-5">
            <div className="row">
                <div className="col-md-12 border-right border-left">
                    <div className="box-heading">
                        <div className="content-left">
                            <span>Địa chỉ của tôi</span>
                        </div>
                        <div className="content-right">
                            <div onClick={() => handleOpenAddressUserModal()} className="wrap-add-address">
                                <i className="fas fa-plus"></i>
                                <span >Thêm địa chỉ mới</span>
                            </div>
                        </div>
                    </div>
                    {dataAddressUser && dataAddressUser.length > 0 &&
                        dataAddressUser.map((item, index) => {
                            return (
                                <div key={index} className="box-address-user">
                                    <div className='content-left'>
                                        <div className='box-label'>
                                            <div className='label'>
                                                <div>Họ Và Tên</div>
                                                <div>Số Điện Thoại</div>
                                                <div>Địa Chỉ</div>
                                            </div>
                                            <div className='content'>
                                                <div>{item.shipName}</div>
                                                <div>{item.shipPhonenumber}</div>
                                                <div>{item.shipAdress}</div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='content-right'>
                                        <span onClick={() => handleEditAddress(item.id)} className='text-underline'>Sửa</span>
                                        <span onClick={() => handleDeleteAddress(item.id)} className='text-underline'>Xóa</span>
                                    </div>
                                </div>

                            )
                        })
                    }

                </div>
            </div>
            <AddressUsersModal addressUserId={addressUserId} sendDataFromModalAddress={sendDataFromModalAddress} isOpenModal={isOpenModalAddressUser} closeModaAddressUser={closeModaAddressUser} />
        </div>

    );
}

export default AddressUser;

