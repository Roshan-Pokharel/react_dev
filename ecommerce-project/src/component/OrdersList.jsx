import {useEffect, useState, Fragment} from 'react';
import {Header} from '../component/Shared/Header.jsx';
import dayjs from 'dayjs';
import PriceCents from '../utils/priceCents.js';
import apiClient from '../api';

import './Shared/General.css';
import './Shared/Header.css';
import './Order.css';

export function OrdersList({ loadCart }) { 
    const [orders, setOrders] = useState([]);
    
    const fetchOrders = async () => {
        try {
            const response = await apiClient.get("/orders?expand=products");
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const buyAgain = async (productId) => {
        try {
            await apiClient.post('/cart-items', {
                productId: productId,
                quantity: 1
            });
            loadCart();
            alert('Item added to cart!');
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            alert('Failed to add item to cart. Please ensure you are logged in.');
        }
    };

    // --- NEW HANDLER: Cancel Order ---
    const handleCancelOrder = async (orderId) => {
      const reason = window.prompt("Please enter the reason for cancellation:");
      if (!reason) return; 

      try {
        await apiClient.put(`/orders/${orderId}/cancel`, { reason });
        alert("Order cancelled successfully.");
        fetchOrders(); // Refresh list to show 'cancelled' status
      } catch (error) {
        console.error("Cancellation failed", error);
        alert("Failed to cancel order.");
      }
    };
   
  return(
    <>
      <Header loadCart={loadCart} /> 
      <div className="orders-page">
        <div className="page-title">Your Orders</div>

        <div className="orders-grid">
          {orders.length === 0 ? (
            <div className="no-orders-message">You have no past orders.</div>
          ) : (
            orders.map((order) => { 
                const orderDate = dayjs(Number(order.orderTimeMs)).format('MMMM D');
                const orderTotal = PriceCents(order.totalCostCents);
                
                // Check status
                const isCancelled = order.status === 'cancelled';

                return(
                <div key={order?.id} className="order-container">

                <div className="order-header">
                    <div className="order-header-left-section">
                    <div className="order-date">
                        Order Placed:
                        <span className="order-header-label">{orderDate}</span>
                    </div>
                    <div className="order-total">
                        Total:
                        <span className="order-header-label">{orderTotal}</span>
                    </div>
                    </div>

                    <div className="order-header-right-section">
                        <div className="order-header-label">Order ID: {order?.id}</div>
                        
                        {/* --- NEW: CANCEL BUTTON --- */}
                        {!isCancelled ? (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            style={{ 
                              marginLeft: '15px', 
                              backgroundColor: '#d9534f', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              padding: '5px 10px', 
                              cursor: 'pointer'
                            }}
                          >
                            Cancel Order
                          </button>
                        ) : (
                          <span style={{ marginLeft: '15px', color: '#d9534f', fontWeight: 'bold', border: '1px solid #d9534f', padding: '4px 8px', borderRadius: '4px' }}>
                            CANCELLED
                          </span>
                        )}
                    </div>
                </div>

                <div className="order-details-grid">
                    {order.products.map((product) => {
                        const Product = product.product; 
                        
                        return(
                        <Fragment key={product.productId}>
                            <div className="product-image-container">
                                <img src = {Product?.image} alt={Product?.name} />
                            </div>

                            <div>
                                <div className="product-name">
                                    {Product?.name}
                                </div>
                                <div className="product-delivery-date">
                                    Arriving on: {dayjs(product?.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
                                </div>
                                <div className="product-quantity">
                                    Quantity: {product?.quantity}
                                </div>
                                <button className="buy-again-button button-primary" onClick={() => buyAgain(product.productId)}>
                                    <img className="buy-again-icon" src="images/icons/buy-again.png" />
                                    <span>Add to Cart</span>
                                </button>
                            </div>

                            <div className="product-actions">
                                <a href={`/tracking?orderId=${order.id}&productId=${product.productId}`}>
                                    <button className="track-package-button button-secondary">
                                    Track package
                                    </button>
                                </a>
                            </div>
                        </Fragment>
                        )
                    }
                    )}
                </div>
                </div>
            )
        })
          )}
       
      </div>
    </div>
    </>
  )
}