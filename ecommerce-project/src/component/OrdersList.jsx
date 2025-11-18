import {useEffect, useState, Fragment} from 'react'; // <-- 1. IMPORT FRAGMENT
import {Header} from '../component/Shared/Header.jsx';
import dayjs from 'dayjs';
import PriceCents from '../utils/priceCents.js';
import apiClient from '../api'; // *** CORRECTED: Using apiClient for Authorization ***

import './Shared/General.css';
import './Shared/Header.css';
import './Order.css';

export function OrdersList({ loadCart }) { 
    const [orders, setOrders] = useState([]);
    
    // Function to fetch orders
    const fetchOrders = async () => {
        try {
            // Fetch orders, including product details (via expand=products)
            const response = await apiClient.get("/orders?expand=products");
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            // Handle errors (e.g., if token is expired)
        }
    };

    // Fetch orders on initial load
    useEffect(() => {
        fetchOrders();
    }, []);

    // Handler for the "Add to Cart" (Buy Again) button
    const buyAgain = async (productId) => {
        try {
            // POST request to add the item back to the cart
            await apiClient.post('/cart-items', {
                productId: productId,
                quantity: 1
            });
            // Reload the cart count in the Header
            loadCart();
            alert('Item added to cart!');
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            alert('Failed to add item to cart. Please ensure you are logged in.');
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
                // orderTimeMs is a BIGINT (number) in the database
                const orderDate = dayjs(Number(order.orderTimeMs)).format('MMMM D');
                const orderTotal = PriceCents(order.totalCostCents);

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
                    </div>
                </div>

                <div className="order-details-grid">
                    {/* Map through the products array stored in the order object */}
                    {order.products.map((product) => {
                        const Product = product.product; // The expanded product details
                        
                        // --- CORRECTION ---
                        // We return a Fragment so that the 3 elements below
                        // become direct children of "order-details-grid",
                        // matching the 3-column layout in the CSS.
                        return(
                        <Fragment key={product.productId}>
                            {/* Column 1: Image */}
                            <div className="product-image-container">
                                <img src = {Product?.image} alt={Product?.name} />
                            </div>

                            {/* Column 2: Details */}
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

                            {/* Column 3: Actions */}
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