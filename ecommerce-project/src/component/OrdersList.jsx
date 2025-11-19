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
    
    // --- 1. NEW STATE FOR MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

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
            await apiClient.post('/cart-items', { productId, quantity: 1 });
            loadCart();
            alert('Item added to cart!');
        } catch (error) {
            alert('Failed to add item to cart.');
        }
    };

    // --- 2. OPEN MODAL FUNCTION ---
    const openCancelModal = (orderId) => {
      setSelectedOrderId(orderId);
      setCancelReason(''); // Reset text
      setIsModalOpen(true);
    };

    // --- 3. SUBMIT CANCELLATION FUNCTION ---
    const submitCancellation = async () => {
      if (!cancelReason.trim()) {
        alert("Please provide a reason.");
        return;
      }

      try {
        await apiClient.put(`/orders/${selectedOrderId}/cancel`, { reason: cancelReason });
        setIsModalOpen(false); // Close modal
        fetchOrders(); // Refresh list
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
                const isCancelled = order.status === 'cancelled';

                return(
                <div key={order?.id} className="order-container">
                  <div className="order-header">
                      <div className="order-header-left-section">
                      <div className="order-date">
                          Order Placed: <span className="order-header-label">{orderDate}</span>
                      </div>
                      <div className="order-total">
                          Total: <span className="order-header-label">{orderTotal}</span>
                      </div>
                      </div>

                      <div className="order-header-right-section">
                          <div className="order-header-label">Order ID: {order?.id}</div>
                          
                          {/* --- 4. BUTTON OPENS MODAL --- */}
                          {!isCancelled ? (
                            <button 
                              onClick={() => openCancelModal(order.id)}
                              className="track-package-button" // Reuse existing style or add custom
                              style={{ marginLeft: '15px', backgroundColor: '#d9534f', color: 'white', border: 'none' }}
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
                                  <img src={Product?.image} alt={Product?.name} />
                              </div>
                              <div>
                                  <div className="product-name">{Product?.name}</div>
                                  <div className="product-delivery-date">
                                      Arriving on: {dayjs(product?.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
                                  </div>
                                  <div className="product-quantity">Quantity: {product?.quantity}</div>
                                  <button className="buy-again-button button-primary" onClick={() => buyAgain(product.productId)}>
                                      <img className="buy-again-icon" src="images/icons/buy-again.png" alt="buy again"/>
                                      <span>Add to Cart</span>
                                  </button>
                              </div>
                              <div className="product-actions">
                                  <a href={`/tracking?orderId=${order.id}&productId=${product.productId}`}>
                                      <button className="track-package-button button-secondary">Track package</button>
                                  </a>
                              </div>
                          </Fragment>
                          )
                      })}
                  </div>
                </div>
            )})
          )}
      </div>

      {/* --- 5. THE CUSTOM MODAL UI --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">Cancel Order</div>
            <p style={{ marginBottom: '10px', color: '#666' }}>Please tell us why you are cancelling:</p>
            
            <textarea
              className="modal-textarea"
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            
            <div className="modal-actions">
              <button className="modal-btn close-action" onClick={() => setIsModalOpen(false)}>
                Back
              </button>
              <button className="modal-btn cancel-action" onClick={submitCancellation}>
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- END MODAL UI --- */}

    </div>
    </>
  )
}