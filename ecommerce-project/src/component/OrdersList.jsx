import {useEffect, useState} from 'react';
import {Header} from '../component/Shared/Header.jsx';
import axios from 'axios';
import dayjs from 'dayjs';
import PriceCents from '../utils/priceCents.js';
import dataFetch from '../utils/dataFetch.js';
import './Shared/General.css';
import './Shared/Header.css';
import './Order.css';

export function OrdersList({products, loadCart})
{ 
    const [orders, setOrders] = useState([]);
    
      useEffect(()=>{
         axios.get("http://localhost:3000/api/orders").then((response)=>{
         setOrders(response.data)
        }
      );
      }, []);

      // function imageFetch(order){
      //   products.find((product)=>{
      //   if(product.id===order.productId){
      //     return(
      //      {}
      //     )
      //   }
      // });
      // }

      
    //}
   
    
  return(
    <>
    {<Header />}
    <div className="orders-page">
      <div className="page-title">Your Orders</div>

      <div className="orders-grid">
        {orders.map((order)=>{ 
          return(
          <div key={order?.id} className="order-container">

          <div className="order-header">
            <div className="order-header-left-section">
              <div className="order-date">
                <div className="order-header-label">Order Placed:</div>
                <div>{dayjs(order?.orderTimeMs).format(' dddd, MMMM D')}</div>
              </div>
              <div className="order-total">
                <div className="order-header-label">Total:</div>
                <div>{PriceCents(order?.totalCostCents)}</div>
              </div>
            </div>

            <div className="order-header-right-section">
              <div className="order-header-label">Order ID:</div>
              <div>{order?.id}</div>
            </div>
          </div>
          {order.products.map((product)=>{
            const Product = dataFetch(product, products );
            return(
              <div  key={`${order.id}- ${product.productId}`} className="order-details-grid">
            <div className="product-image-container">
            <img src = {Product?.image}
           />
            </div>
            <div className="product-details">
              <div className="product-name">
                {Product?.name}
              </div>
              <div className="product-delivery-date">
                Arriving on: {dayjs(product?.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
              </div>
              <div className="product-quantity">
                Quantity: {product?.quantity}
              </div>
              <button className="buy-again-button button-primary">
                <img className="buy-again-icon" src="images/icons/buy-again.png" />

                <span className="buy-again-message" 
                onClick={async()=>{
                await axios.post('http://localhost:3000/api/cart-items', {
                    productId: product.productId,
                    quantity: 1
                  });
                  await loadCart();
                }}
                >Add to Cart</span>
              </button>
            </div>

            <div className="product-actions">
              <a href="tracking">
                <button className="track-package-button button-secondary">
                  Track package
                </button>
              </a>
            </div>

          
          </div>
            )
          }
          )}
           </div>
        )})}
       
      </div>
    </div>
    </>
  )

      
}