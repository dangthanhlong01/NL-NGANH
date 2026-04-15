import React from 'react';
import { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useLocation
} from "react-router-dom";

const SideBar = () => {
    const [user, setUser] = useState({})
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        setUser(userData)
    }, [])

    return (
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav">
                        <div className="sb-sidenav-menu-heading"></div>
                        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active-link' : ''}`}>
                            <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt" /></div>
                            Trang chủ
                        </Link>

                        <div className="sb-sidenav-menu-heading">Quản lý</div>
                        {user && user.roleId === "R1" &&
                            <>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseLayouts" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fas fa-users"></i></div>
                                    Quản lý người dùng
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseLayouts" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-user'} className={`nav-link ${isActive('/admin/list-user') ? 'active-link' : ''}`}>Danh sách người dùng</Link>
                                        <Link to={'/admin/add-user'} className={`nav-link ${isActive('/admin/add-user') ? 'active-link' : ''}`}>Thêm người dùng</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseCategory" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fas fa-list-ol"></i></div>
                                    Quản lý danh mục
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseCategory" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-category'} className={`nav-link ${isActive('/admin/list-category') ? 'active-link' : ''}`}>Danh sách danh mục</Link>
                                        <Link to={'/admin/add-category'} className={`nav-link ${isActive('/admin/add-category') ? 'active-link' : ''}`}>Thêm danh mục</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseBrand" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="far fa-copyright"></i></div>
                                    Quản lý nhãn hàng
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseBrand" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-brand'} className={`nav-link ${isActive('/admin/list-brand') ? 'active-link' : ''}`}>Danh sách nhãn hàng</Link>
                                        <Link to={'/admin/add-brand'} className={`nav-link ${isActive('/admin/add-brand') ? 'active-link' : ''}`}>Thêm nhãn hàng</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseProduct" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fas fa-tshirt"></i></div>
                                    Quản lý sản phẩm
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseProduct" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-product'} className={`nav-link ${isActive('/admin/list-product') ? 'active-link' : ''}`}>Danh sách sản phẩm</Link>
                                        <Link to={'/admin/add-product'} className={`nav-link ${isActive('/admin/add-product') ? 'active-link' : ''}`}>Thêm sản phẩm</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseBanner" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fab fa-adversal"></i></div>
                                    Quản lý băng rôn
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseBanner" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-banner'} className={`nav-link ${isActive('/admin/list-banner') ? 'active-link' : ''}`}>Danh sách băng rôn</Link>
                                        <Link to={'/admin/add-banner'} className={`nav-link ${isActive('/admin/add-banner') ? 'active-link' : ''}`}>Thêm băng rôn</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseSubject" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fab fa-blogger"></i></div>
                                    Quản lý chủ đề
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseSubject" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-subject'} className={`nav-link ${isActive('/admin/list-subject') ? 'active-link' : ''}`}>Danh sách chủ đề</Link>
                                        <Link to={'/admin/add-subject'} className={`nav-link ${isActive('/admin/add-subject') ? 'active-link' : ''}`}>Thêm chủ đề</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseBlog" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fas fa-feather-alt"></i></div>
                                    Quản lý bài đăng
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseBlog" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-blog'} className={`nav-link ${isActive('/admin/list-blog') ? 'active-link' : ''}`}>Danh sách bài đăng</Link>
                                        <Link to={'/admin/add-blog'} className={`nav-link ${isActive('/admin/add-blog') ? 'active-link' : ''}`}>Thêm bài đăng</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseShip" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fas fa-shipping-fast"></i></div>
                                    Quản lý loại ship
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseShip" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-typeship'} className={`nav-link ${isActive('/admin/list-typeship') ? 'active-link' : ''}`}>DS loại giao hàng</Link>
                                        <Link to={'/admin/add-typeship'} className={`nav-link ${isActive('/admin/add-typeship') ? 'active-link' : ''}`}>Thêm loại giao hàng</Link>
                                    </nav>
                                </div>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseVoucher" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fas fa-percentage"></i></div>
                                    Quản lý voucher
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseVoucher" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/list-typevoucher'} className={`nav-link ${isActive('/admin/list-typevoucher') ? 'active-link' : ''}`}>DS loại khuyến mãi</Link>
                                        <Link to={'/admin/list-voucher'} className={`nav-link ${isActive('/admin/list-voucher') ? 'active-link' : ''}`}>DS mã khuyến mãi</Link>
                                        <Link to={'/admin/add-typevoucher'} className={`nav-link ${isActive('/admin/add-typevoucher') ? 'active-link' : ''}`}>Thêm loại khuyến mãi</Link>
                                        <Link to={'/admin/add-voucher'} className={`nav-link ${isActive('/admin/add-voucher') ? 'active-link' : ''}`}>Thêm mã khuyến mãi</Link>
                                    </nav>
                                </div>
                            </>
                        }

                        <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseSupplier" aria-expanded="false" aria-controls="collapseLayouts">
                            <div className="sb-nav-link-icon"><i className="fa-solid fa-person-military-pointing"></i></div>
                            Quản lý NCC
                            <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                        </a>
                        <div className="collapse" id="collapseSupplier" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                            <nav className="sb-sidenav-menu-nested nav">
                                <Link to={'/admin/list-supplier'} className={`nav-link ${isActive('/admin/list-supplier') ? 'active-link' : ''}`}>Danh sách NCC</Link>
                                <Link to={'/admin/add-supplier'} className={`nav-link ${isActive('/admin/add-supplier') ? 'active-link' : ''}`}>Thêm nhà cung cấp</Link>
                            </nav>
                        </div>
                        <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseReceipt" aria-expanded="false" aria-controls="collapseLayouts">
                            <div className="sb-nav-link-icon"><i className="fa-solid fa-file-import"></i></div>
                            Quản lý nhập hàng
                            <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                        </a>
                        <div className="collapse" id="collapseReceipt" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                            <nav className="sb-sidenav-menu-nested nav">
                                <Link to={'/admin/list-receipt'} className={`nav-link ${isActive('/admin/list-receipt') ? 'active-link' : ''}`}>Danh sách nhập hàng</Link>
                                <Link to={'/admin/add-receipt'} className={`nav-link ${isActive('/admin/add-receipt') ? 'active-link' : ''}`}>Thêm nhập hàng</Link>
                            </nav>
                        </div>
                        <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseOrder" aria-expanded="false" aria-controls="collapseLayouts">
                            <div className="sb-nav-link-icon"><i className="fas fa-cart-plus"></i></div>
                            Quản lý đơn hàng
                            <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                        </a>
                        <div className="collapse" id="collapseOrder" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                            <nav className="sb-sidenav-menu-nested nav">
                                <Link to={'/admin/list-order'} className={`nav-link ${isActive('/admin/list-order') ? 'active-link' : ''}`}>Danh sách đơn hàng</Link>
                            </nav>
                        </div>
                        <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseMessage" aria-expanded="false" aria-controls="collapseLayouts">
                            <div className="sb-nav-link-icon"><i className="fa-brands fa-facebook-messenger"></i></div>
                            Quản lý tin nhắn
                            <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                        </a>
                        <div className="collapse" id="collapseMessage" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                            <nav className="sb-sidenav-menu-nested nav">
                                <Link to={'/admin/chat'} className={`nav-link ${isActive('/admin/chat') ? 'active-link' : ''}`}>Messenger</Link>
                            </nav>
                        </div>
                        {user && user.roleId === "R1" &&
                            <>
                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapseStatistic" aria-expanded="false" aria-controls="collapseLayouts">
                                    <div className="sb-nav-link-icon"><i className="fa-solid fa-magnifying-glass-chart"></i></div>
                                    Thống kê
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="collapseStatistic" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link to={'/admin/turnover'} className={`nav-link ${isActive('/admin/turnover') ? 'active-link' : ''}`}>Thống kê doanh thu</Link>
                                        <Link to={'/admin/profit'} className={`nav-link ${isActive('/admin/profit') ? 'active-link' : ''}`}>Thống kê lợi nhuận</Link>
                                        <Link to={'/admin/stock-product'} className={`nav-link ${isActive('/admin/stock-product') ? 'active-link' : ''}`}>Thống kê tồn kho</Link>
                                    </nav>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </nav>
        </div>
    )
}
export default SideBar;