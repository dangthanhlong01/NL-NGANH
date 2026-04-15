import React from 'react';
import ItemProduct from '../Product/ItemProduct';
import HeaderContent from '../Content/HeaderContent';
function NewProductFeature(props) {

    return (
        <section className="new_product_area section_gap_top section_gap_bottom_custom">
            <div className="container">
                <HeaderContent mainContent={props.title}
                    infoContent={props.description}> </HeaderContent>
                <div className="row">

                    <div className="col-lg-12 mt-5 mt-lg-0">
                        <div className="row">
                            {props.data && props.data.length > 0 &&
                                props.data.map((item, index) => {
                                    const detail = item.productDetail?.[0];
                                    const image = detail?.productImage?.[0]?.image ?? null;
                                    if (!detail || !image) return null;
                                    return (
                                        <ItemProduct
                                            id={item.id}
                                            key={item.id}
                                            type="col-lg-3 col-md-3"
                                            name={item.name}
                                            img={image}
                                            price={detail.originalPrice}
                                            discountPrice={detail.discountPrice}
                                        />
                                    )
                                })
                            }


                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default NewProductFeature;