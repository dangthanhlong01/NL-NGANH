import React, { useEffect, useState, useRef } from 'react';
import './ReviewProduct.scss';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import CommonUtils from '../../utils/CommonUtils';
import {
    createNewReviewService,
    getAllReviewByProductIdService,
    ReplyReviewService,
    deleteReviewService,
    checkUserBoughtProductService
} from '../../services/userService';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import ReviewModal from './ReviewModal';

function ReviewProduct(props) {
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem('userData')); // ✅ chỉ khai báo 1 lần

    const [inputValues, setInputValues] = useState({
        activeStar: '',
        imageReview: '',
        image: '',
        content: '',
        // ✅ bỏ user khỏi state
        dataReview: [],
        countStar: {},
        isOpen: false,
        isOpenModal: false,
        parentId: ''
    });

    const [hasBought, setHasBought] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [checkingBought, setCheckingBought] = useState(true);

    // ✅ dùng ref để tránh gọi checkBoughtStatus nhiều lần
    const hasFetchedBought = useRef(false);

    useEffect(() => {
        let fetchData = async () => {
            const dataReview = await loadAllReview();

            // ✅ Chỉ check 1 lần duy nhất lúc mount
            if (user && !hasFetchedBought.current) {
                hasFetchedBought.current = true;
                await checkBoughtStatus(dataReview);
            } else {
                setCheckingBought(false);
            }
        };
        fetchData();
    }, []);

    // ✅ Nhận dataReview qua param, không dùng closure
    let checkBoughtStatus = async (dataReview) => {
        try {
            setCheckingBought(true);

            let res = await checkUserBoughtProductService(user.id, id);
            setHasBought(res && res.errCode === 0);

            // ✅ dùng dataReview từ param
            let reviewed = dataReview
                ? dataReview.some(item => item.userId === user.id && !item.parentId)
                : false;
            setAlreadyReviewed(reviewed);
        } catch (error) {
            console.error('Lỗi kiểm tra trạng thái mua hàng:', error);
        } finally {
            setCheckingBought(false);
        }
    };

    // ✅ return dataReview để dùng ngay sau khi load
    let loadAllReview = async () => {
        let res = await getAllReviewByProductIdService(id);
        if (res && res.errCode === 0) {
            let count5 = res.data.filter(item => item.star === 5);
            let count4 = res.data.filter(item => item.star === 4);
            let count3 = res.data.filter(item => item.star === 3);
            let count2 = res.data.filter(item => item.star === 2);
            let count1 = res.data.filter(item => item.star === 1);

            setInputValues(prev => ({
                ...prev,
                dataReview: res.data,
                countStar: {
                    star5: count5.length,
                    star4: count4.length,
                    star3: count3.length,
                    star2: count2.length,
                    star1: count1.length,
                    average:
                        (count5.length * 5 + count4.length * 4 + count3.length * 3 + count2.length * 2 + count1.length * 1) /
                        (count5.length + count4.length + count3.length + count2.length + count1.length),
                    quantity: count5.length + count4.length + count3.length + count2.length + count1.length
                },
                content: '',
                image: '',
                imageReview: '',
                activeStar: '',
                isOpenModal: false
            }));

            return res.data; // ✅ trả về data để dùng ngay
        }
        return [];
    };

    let openPreviewImage = (url) => {
        setInputValues(prev => ({ ...prev, imageReview: url, isOpen: true }));
    };

    let handleChooseStart = (number) => {
        setInputValues(prev => ({ ...prev, activeStar: number }));
    };

    let handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file.size > 31312281) {
            toast.error('Dung lượng file bé hơn 30mb');
        } else {
            let base64 = await CommonUtils.getBase64(file);
            let objectUrl = URL.createObjectURL(file);
            setInputValues(prev => ({ ...prev, image: base64, imageReview: objectUrl }));
        }
    };

    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues(prev => ({ ...prev, [name]: value }));
    };

    let handleSaveComment = async () => {
        if (!inputValues.activeStar) {
            toast.error('Bạn chưa chọn sao !');
            return;
        }
        if (!inputValues.content) {
            toast.error('Nội dung không được để trống !');
            return;
        }

        let response = await createNewReviewService({
            productId: id,
            content: inputValues.content,
            image: inputValues.image,
            userId: user.id,
            star: inputValues.activeStar
        });

        if (response && response.errCode === 0) {
            toast.success('Đăng đánh giá thành công !');
            setAlreadyReviewed(true); // ✅ không cần gọi lại checkBoughtStatus
            await loadAllReview();
        } else {
            toast.error(response.errMessage);
        }
    };

    let closeModal = () => {
        setInputValues(prev => ({ ...prev, isOpenModal: false, parentId: '' }));
    };

    let handleOpenModal = (id) => {
        setInputValues(prev => ({ ...prev, isOpenModal: true, parentId: id }));
    };

    let sendDataFromReViewModal = async (content) => {
        let res = await ReplyReviewService({
            content: content,
            productId: id,
            userId: user.id,
            parentId: inputValues.parentId
        });
        if (res && res.errCode === 0) {
            toast.success('Phản hồi thành công !');
            await loadAllReview();
        }
    };

    let handleDeleteReply = async (id) => {
        let res = await deleteReviewService({ data: { id: id } });
        if (res && res.errCode === 0) {
            toast.success('Xóa phản hồi thành công !');
            await loadAllReview();
        } else {
            toast.error(res.errMessage);
        }
    };

    let renderReviewForm = () => {
        if (!user) {
            return (
                <div className="review_item">
                    <div className="alert-review alert-review--info">
                        
                        {/* <span>Vui lòng <a href="/login">đăng nhập</a> để đánh giá sản phẩm.</span> */}
                    </div>
                </div>
            );
        }

        if (checkingBought) {
            return (
                <div className="review_item">
                    <div className="alert-review alert-review--loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Đang kiểm tra quyền đánh giá...</span>
                    </div>
                </div>
            );
        }

        if (!hasBought) {
            return (
                <div className="review_item">
                    <div className="alert-review alert-review--warning">
                        
                        <span>Bạn cần <strong>mua và nhận sản phẩm</strong> này trước khi có thể đánh giá.</span>
                    </div>
                </div>
            );
        }

        if (alreadyReviewed) {
            return (
                <div className="review_item">
                    <div className="alert-review alert-review--success">
                        
                        <span>Bạn đã đánh giá sản phẩm này rồi. Cảm ơn bạn!</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="review_item">
                <div className="form-group">
                    <label style={{ color: '#333', fontSize: '16px', fontWeight: '600' }}>
                        Viết đánh giá của bạn
                    </label>
                    <textarea
                        name="content"
                        value={inputValues.content}
                        onChange={handleOnChange}
                        rows="3"
                        className="form-control"
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    ></textarea>
                </div>
                <div className="content-review">
                    <div className="content-left">
                        <label style={{ marginBottom: '0', cursor: 'pointer' }} htmlFor="cmtImg">
                            <i className="fas fa-camera"></i>
                        </label>
                        <input
                            type="file"
                            id="cmtImg"
                            accept=".jpg,.png"
                            hidden
                            onChange={handleOnChangeImage}
                        />
                        {[1, 2, 3, 4, 5].map(num => (
                            <div
                                key={num}
                                className={inputValues.activeStar === num ? 'box-star active' : 'box-star'}
                                onClick={() => handleChooseStart(num)}
                            >
                                {[...Array(num)].map((_, i) => (
                                    <i key={i} className="fa fa-star" />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="content-right">
                        <button onClick={handleSaveComment} className="btn btn-primary">
                            <i className="fas fa-pencil-alt"></i> Share
                        </button>
                    </div>
                </div>
                {inputValues.imageReview && (
                    <div
                        style={{ backgroundImage: `url(${inputValues.imageReview})` }}
                        className="preview-cmt-img"
                    ></div>
                )}
            </div>
        );
    };

    return (
        <div className="row">
            <div className="col-lg-12">
                <div className="row total_rate">
                    <div className="col-6">
                        <div className="box_total">
                            <h5>Sao trung bình</h5>
                            <h4>
                                {inputValues.countStar.average
                                    ? Math.round(inputValues.countStar.average * 10) / 10
                                    : 0}
                            </h4>
                            <h6>({inputValues.countStar.quantity} lượt đánh giá)</h6>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="rating_list">
                            <h3>{inputValues.countStar.quantity} lượt đánh giá</h3>
                            <ul className="list">
                                {[5, 4, 3, 2, 1].map(num => (
                                    <li key={num}>
                                        <a href="#">
                                            {num}
                                            {[...Array(num)].map((_, i) => (
                                                <i key={i} className="fa fa-star" />
                                            ))}
                                            Có {inputValues.countStar[`star${num}`]} lượt đánh giá
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="review_list">
                    {renderReviewForm()}

                    {inputValues.dataReview && inputValues.dataReview.length > 0 &&
                        inputValues.dataReview.map((item, index) => {
                            if (!item.parentId) {
                                let name = `${item.user.firstName || ''} ${item.user.lastName}`;
                                return (
                                    <div key={index} className="review_item">
                                        <div className="media">
                                            <div className="d-flex">
                                                <img className="img-avatar" src={item.user.image} alt="" />
                                            </div>
                                            <div className="media-body">
                                                <h4>{name}</h4>
                                                {[...Array(item.star)].map((_, i) => (
                                                    <i key={i} className="fa fa-star" />
                                                ))}
                                                {user && user.roleId === 'R1' &&
                                                    <a
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleOpenModal(item.id)}
                                                        className="reply_btn"
                                                    >
                                                        Phản hồi
                                                    </a>
                                                }
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: '88px' }}>
                                            <p style={{ paddingTop: '0px' }}>{item.content}</p>
                                            {item.image &&
                                                <img
                                                    onClick={() => openPreviewImage(item.image)}
                                                    className="img-cmt"
                                                    src={item.image}
                                                    alt=""
                                                />
                                            }
                                            {item.childComment && item.childComment.length > 0 &&
                                                item.childComment.map((child, idx) => (
                                                    <div key={idx} className="box-reply">
                                                        <span>Phản hồi của người bán</span>
                                                        <p>{child.content}</p>
                                                        {user && user.roleId === 'R1' &&
                                                            <button
                                                                onClick={() => handleDeleteReply(child.id)}
                                                                className="btn-delete-reply"
                                                                type="button"
                                                            >
                                                                Xóa
                                                            </button>
                                                        }
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })
                    }
                </div>
            </div>

            {inputValues.isOpen &&
                <Lightbox
                    mainSrc={inputValues.imageReview}
                    onCloseRequest={() => setInputValues(prev => ({
                        ...prev,
                        isOpen: false,
                        imageReview: ''
                    }))}
                />
            }

            <ReviewModal
                isOpenModal={inputValues.isOpenModal}
                closeModal={closeModal}
                sendDataFromReViewModal={sendDataFromReViewModal}
            />
        </div>
    );
}

export default ReviewProduct;