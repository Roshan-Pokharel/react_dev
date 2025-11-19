import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import apiClient from '../api';
import { Header } from '../component/Shared/Header.jsx';

import './Shared/General.css';
import './Shared/Header.css';
import './Tracking.css';

export function Tracking({ loadCart }) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');

  const [order, setOrder] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrackingData() {
      try {
        if (!orderId || !productId) return;

        const response = await apiClient.get(`/orders/${orderId}?expand=products`);
        const orderData = response.data;
        setOrder(orderData);

        if (orderData && orderData.products) {
          const foundItem = orderData.products.find(
            (p) => p.productId === productId
          );
          setProductDetails(foundItem);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tracking info:", error);
        setLoading(false);
      }
    }

    fetchTrackingData();
  }, [orderId, productId]);

  if (loading) return <div className="tracking-page">Loading...</div>;
  if (!order || !productDetails) return <div className="tracking-page">Order not found.</div>;

  const productInfo = productDetails.product || {};
  const arrivalDate = dayjs(productDetails.estimatedDeliveryTimeMs).format('dddd, MMMM D');

  // --- STATUS LOGIC ---
  const isCanceled = order.status === 'cancelled';
  
  let progressPercent = 0;
  let progressBarColor = 'green'; // Default color

  if (isCanceled) {
    progressPercent = 100; // Full bar
    progressBarColor = '#d9534f'; // Red color for cancellation
  } else if (order.status === 'received') {
    progressPercent = 100;
  } else if (order.status === 'shipped') {
    progressPercent = 50;
  } else {
    progressPercent = 15;
  }

  return (
    <>
      <Header loadCart={loadCart} />

      <div className="tracking-page">
        <div className="order-tracking">
          <a className="back-to-orders-link link-primary" href="/orders">
            View all orders
          </a>

          <div className="delivery-date">
            {isCanceled ? (
                <span style={{ color: '#d9534f' }}>Order Canceled</span>
            ) : (
                `Arriving on ${arrivalDate}`
            )}
          </div>

          <div className="product-info">
            {productInfo.name}
          </div>

          <div className="product-info">
            Quantity: {productDetails.quantity}
          </div>

          <img
            className="product-image"
            src={productInfo.image}
            alt={productInfo.name}
          />

          {/* --- PROGRESS LABELS --- */}
          <div className="progress-labels-container">
            {isCanceled ? (
               // Special Label for Canceled State
               <div className="progress-label current-status" style={{ width: '100%', textAlign: 'center', color: '#d9534f', fontWeight: 'bold' }}>
                 Shipment Canceled
               </div>
            ) : (
               // Standard Tracking Labels
               <>
                <div className={`progress-label ${progressPercent < 50 ? 'current-status' : ''}`}>
                  Preparing
                </div>
                <div className={`progress-label ${progressPercent >= 50 && progressPercent < 100 ? 'current-status' : ''}`}>
                  Shipped
                </div>
                <div className={`progress-label ${progressPercent === 100 ? 'current-status' : ''}`}>
                  Delivered
                </div>
               </>
            )}
          </div>

          {/* --- PROGRESS BAR --- */}
          <div className="progress-bar-container">
            <div 
                className="progress-bar" 
                style={{ 
                    width: `${progressPercent}%`, 
                    backgroundColor: progressBarColor // Applies Red if canceled
                }}
            ></div>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default Tracking;