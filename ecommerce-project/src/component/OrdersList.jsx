import { useEffect, useState, Fragment } from 'react';
import { Header } from '../component/Shared/Header.jsx';
import dayjs from 'dayjs';
import PriceCents from '../utils/priceCents.js';
import apiClient from '../api';
import './Shared/General.css';
import './Shared/Header.css';
import './Order.css';

export function OrdersList({ loadCart }) { 
    const [orders, setOrders] = useState([]);
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

    useEffect(() => { fetchOrders(); }, []);

    const buyAgain = async (productId) => {
        try {
            await apiClient.post('/cart-items', { productId: productId, quantity: 1 });
            loadCart();
            alert('Item added to cart!');
        } catch (error) {
            console.error('Failed', error);
        }
    };

    const openCancelModal = (orderId) => {
      setSelectedOrderId(orderId);
      setCancelReason('');
      setIsModalOpen(true);
    };

    const submitCancellation = async () => {
      if (!cancelReason.trim()) { alert("Please provide a reason."); return; }
      try {
        await apiClient.put(`/orders/${selectedOrderId}/cancel`, { reason: cancelReason });
        setIsModalOpen(false);
        fetchOrders();
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
                        
                        {/* --- GROUPED ACTIONS FOR ALIGNMENT --- */}
                        <div className="order-header-actions">
                            <a href={`/tracking?orderId=${order.id}`}>
                                 <button className="track-package-button button-secondary">
                                    Track Order
                                 </button>
                            </a>

                            {order.status === 'cancelled' && (
                                <span className="order-status-label status-cancelled">CANCELLED</span>
                            )}
                            {order.status === 'received' && (
                                <span className="order-status-label status-received">RECEIVED</span>
                            )}
                            {order.status === 'placed' && (
                                <button 
                                    onClick={() => openCancelModal(order.id)} 
                                    className="track-package-button status-cancel-btn"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
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
                            <div style={{gridColumn: 'span 2'}}> 
                                <div className="product-name">{Product?.name}</div>
                                <div className="product-delivery-date">
                                    Arriving on: {dayjs(product?.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
                                </div>
                                <div className="product-quantity">Quantity: {product?.quantity}</div>
                                <button className="buy-again-button button-primary" onClick={() => buyAgain(product.productId)}>
                                    <img className="buy-again-icon" src="images/icons/buy-again.png" alt="buy again" />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </Fragment>
                        )
                    })}
                </div>
                </div>
            )
        })
      )}
      </div>
      
      {/* Modal Logic */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">Cancel Order</div>
            <textarea className="modal-textarea" placeholder="Reason..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="modal-actions">
              <button className="modal-btn close-action" onClick={() => setIsModalOpen(false)}>Back</button>
              <button className="modal-btn cancel-action" onClick={submitCancellation}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}