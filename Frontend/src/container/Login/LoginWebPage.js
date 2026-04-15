import React from "react";
import { useState } from 'react';
import { toast } from 'react-toastify';
import './LoginWebPage.css';
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { handleLoginService, checkPhonenumberEmail, createNewUser } from '../../services/userService';
import { authentication } from "../../utils/firebase";
import { signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';

const LoginWebPage = () => {

    const [inputValues, setInputValues] = useState({
        email: '', password: 'passwordsecrect', lastName: '', phonenumber: ''
    });

    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues({ ...inputValues, [name]: value });
    };

    // ✅ Validate đăng nhập
    const validateLogin = () => {
        const { email, password } = inputValues;

        if (!email) {
            toast.error("Vui lòng nhập địa chỉ email");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không hợp lệ");
            return false;
        }

        if (!password) {
            toast.error("Vui lòng nhập mật khẩu");
            return false;
        }

        if (password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }

        return true;
    };

    // ✅ Validate đăng ký
    const validateRegister = () => {
        const { lastName, email, phonenumber, password } = inputValues;
        const passwordCon = document.getElementById("passwordCon").value;

        if (!lastName || lastName.trim().length < 6) {
            toast.error("Họ và tên phải có ít nhất 6 ký tự");
            return false;
        }

        if (!email) {
            toast.error("Vui lòng nhập địa chỉ email");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không hợp lệ");
            return false;
        }

        if (!phonenumber) {
            toast.error("Vui lòng nhập số điện thoại");
            return false;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phonenumber)) {
            toast.error("Số điện thoại phải đúng 10 chữ số");
            return false;
        }

        if (!password || password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }

        if (password !== passwordCon) {
            toast.error("Mật khẩu xác nhận không khớp");
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validateLogin()) return; // ✅ Kiểm tra trước khi gọi API

        let res = await handleLoginService({
            email: inputValues.email,
            password: inputValues.password
        });

        if (res && res.errCode === 0) {
            localStorage.setItem("userData", JSON.stringify(res.user));
            localStorage.setItem("token", JSON.stringify(res.accessToken));
            if (res.user.roleId === "R1" || res.user.roleId === "R4") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/";
            }
        } else {
            toast.error(res.errMessage);
        }
    };

    const handleLoginSocial = async (email) => {
        let res = await handleLoginService({
            email: email,
            password: 'passwordsecrect'
        });

        if (res && res.errCode === 0) {
            localStorage.setItem("userData", JSON.stringify(res.user));
            localStorage.setItem("token", JSON.stringify(res.accessToken));
            if (res.user.roleId === "R1" || res.user.roleId === "R4") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/";
            }
        } else {
            toast.error(res.errMessage);
        }
    };

    const handleSaveUser = async () => {
        if (!validateRegister()) return; // ✅ Kiểm tra trước khi gọi API

        let check = await checkPhonenumberEmail({
            phonenumber: inputValues.phonenumber,
            email: inputValues.email
        });

        if (check.isCheck === true) {
            toast.error(check.errMessage);
            return;
        }

        let res = await createNewUser({
            email: inputValues.email,
            lastName: inputValues.lastName,
            phonenumber: inputValues.phonenumber,
            password: inputValues.password,
            roleId: 'R2',
        });

        if (res && res.errCode === 0) {
            toast.success("Tạo tài khoản thành công");
            handleLogin();
        } else {
            toast.error(res.errMessage);
        }
    };

    const getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);
        });
    };

    const LoginWithSocial = async (re) => {
        const provider = re.user.providerData[0];
        let check = await checkPhonenumberEmail({
            phonenumber: provider.phoneNumber,
            email: provider.email
        });

        if (check.isCheck === true) {
            handleLoginSocial(provider.email);
        } else {
            const avatar = await getBase64FromUrl(provider.photoURL);
            let res = await createNewUser({
                email: provider.email,
                lastName: provider.displayName,
                phonenumber: provider.phoneNumber,
                avatar: avatar,
                roleId: "R2",
                password: 'passwordsecrect'
            });

            if (res && res.errCode === 0) {
                toast.success("Tạo tài khoản thành công");
                handleLoginSocial(provider.email);
            } else {
                toast.error(res.errMessage);
            }
        }
    };

    const signInwithFacebook = () => {
        const provider = new FacebookAuthProvider();
        signInWithPopup(authentication, provider)
            .then((re) => LoginWithSocial(re))
            .catch((err) => console.log(err.message));
    };

    const signInwithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(authentication, provider)
            .then((re) => LoginWithSocial(re))
            .catch((err) => console.log(err.message));
    };

    return (
        <div className="box-login">
            <div className="login-container">
                <section id="formHolder">
                    <div className="row">
                        {/* Brand Box */}
                        <div className="col-sm-6 brand">
                            <a href="#" className="logo">MR <span>.</span></a>
                            <div className="heading">
                                <h2>Esier</h2>
                                <p>Sự lựa chọn của bạn</p>
                            </div>
                        </div>

                        {/* Form Box */}
                        <div className="col-sm-6 form">
                            {/* Login Form */}
                            <div className="login form-peice">
                                <form className="login-form" onSubmit={e => e.preventDefault()}>
                                    <div className="form-group">
                                        <label htmlFor="loginemail">Địa chỉ email</label>
                                        <input name="email" onChange={handleOnChange} type="email" id="loginemail" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="loginPassword">Mật khẩu</label>
                                        <input
                                            name="password"
                                            onChange={handleOnChange}
                                            type="password"
                                            id="loginPassword"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="CTA">
                                        <input onClick={handleLogin} type="submit" value="Đăng nhập" />
                                        <a style={{ cursor: 'pointer' }} className="switch">Tài khoản mới</a>
                                    </div>
                                    <FacebookLoginButton text="Đăng nhập với Facebook" iconSize="25px" style={{ width: "300px", height: "40px", fontSize: "16px", marginTop: "40px", marginBottom: "10px" }} onClick={signInwithFacebook} />
                                    <GoogleLoginButton text="Đăng nhập với Google" iconSize="25px" style={{ width: "300px", height: "40px", fontSize: "16px" }} onClick={signInwithGoogle} />
                                </form>
                            </div>

                            {/* Signup Form */}
                            <div className="signup form-peice switched">
                                <form className="signup-form" onSubmit={e => e.preventDefault()}>
                                    <div className="form-group">
                                        <label htmlFor="name">Họ và tên</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            onChange={handleOnChange}
                                            id="name"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Địa chỉ email</label>
                                        <input type="email" name="email" onChange={handleOnChange} id="email" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">Số điện thoại</label>
                                        <input
                                            type="text"
                                            name="phonenumber"
                                            onChange={handleOnChange}
                                            id="phone"
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            title="Số điện thoại phải đúng 10 chữ số"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Mật khẩu</label>
                                        <input
                                            type="password"
                                            name="password"
                                            onChange={handleOnChange}
                                            id="password"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="passwordCon">Xác nhận mật khẩu</label>
                                        <input type="password" name="passwordCon" id="passwordCon" minLength={6} required />
                                    </div>
                                    <div className="CTA">
                                        <input onClick={handleSaveUser} type="submit" value="Đăng ký" id="submit" />
                                        <a style={{ cursor: 'pointer' }} className="switch">Tôi có tài khoản</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LoginWebPage;