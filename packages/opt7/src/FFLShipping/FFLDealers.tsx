import * as React from 'react';

export interface IFFLDealersProps {
    fflProducts: any[]
}

export default function FFLDealers(props: IFFLDealersProps) {
    return (
        <div className='opt7-ffl-container'>
            <div className='opt7-ffl-information'>
                Firearms can only be shipped to an authorized FFL dealer.
                You are responsible for contacting your FFL dealer to discuss their fees and pickup processes.
                Please enter a zip code below for a list of FFL dealers in your area.
                Then, select an FFL dealer you wish the firearms to be shipped to.
            </div>
            <div className='opt7-ffl-dealer-container'>
                <div className='opt7-ffl-dealer-title'>
                    <h4>Select a Pick up FFL Dealer</h4>
                </div>
                <div className='opt7-ffl-products'>
                    <div className='opt7-ffl-products-list'>
                        {
                            props.fflProducts.map((item: any, index: number) => (
                                <div className='opt7-ffl-product' key={`ffl-prods-${index}`}>
                                    <div className='product-detail'>
                                        <p className='product-name'>{item.node.name}</p>
                                        <div className='product-sale-area'>
                                            {/* <p className='product-qty'>Quantity: {cart.lineItems.physicalItems.filter(i => i.productId === item.entityId)[0].quantity}</p> */}
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className='opt7-ffl-dealer-body'>
                    <div className='opt7-ffl-dealer-header'>
                        <div className='opt7-ffl-dealer-input-area'>
                            <input type="text" className='opt7-input' placeholder='Enter ZIP Code' />
                            <select className='opt7-select'>
                                <option value="1">1 Mile</option>
                                <option value="3">3 Mile</option>
                                <option value="5">5 Mile</option>
                                <option value="10">10 Mile</option>
                            </select>
                            <button className='search-dealer-btn'>Show FFL Stores</button>
                        </div>
                    </div>

                    <div className="opt7-ffl-dealer-list">
                        <div className="opt7-ffl-dealer-item">
                            <b>LA ESTRELLA DE ORO JOYERIA #2 INC</b>
                            <br />
                            <span className="business-name">LA ESTRELLA DE ORO #25</span>
                            755 E 8TH AVE,&nbsp;HIALEAH,&nbsp;33010,&nbsp;FL
                            <br />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
