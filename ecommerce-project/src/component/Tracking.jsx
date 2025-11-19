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

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrackingData() {
      try {
        if (!orderId) return;
        const response = await apiClient.get(`/orders/${orderId}?expand=products`);
        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tracking info:", error);
        setLoading(false);
      }
    }
    fetchTrackingData();
  }, [orderId]);

  if (loading) return (
    <>
      <Header loadCart={loadCart} />
      <div className="tracking-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    </>
  );

  if (!order) return (
    <>
      <Header loadCart={loadCart} />
      <div className="tracking-page">
        <div>Order not found.</div>
        <a className="back-to-orders-link link-primary" href="/orders">Back to Orders</a>
      </div>
    </>
  );

  // --- STATUS LOGIC ---
  const firstProduct = order.products[0] || {};
  const arrivalDate = firstProduct.estimatedDeliveryTimeMs 
    ? dayjs(firstProduct.estimatedDeliveryTimeMs).format('dddd, MMMM D') 
    : 'Unknown Date';

  const isCanceled = order.status === 'cancelled';
  let progressPercent = 0;
  let progressBarColor = 'rgb(25, 135, 84)'; // Default green

  if (isCanceled) {
    progressPercent = 100;
    progressBarColor = '#d9534f'; 
  } else if (order.status === 'received') {
    progressPercent = 100;
  } else if (order.status === 'shipped') {
    progressPercent = 50;
  } else {
    progressPercent = 15; // Preparing
  }

  return (
    <>
      <Header loadCart={loadCart} />

      <div className="tracking-page">
        <div className="order-tracking">
          <a className="back-to-orders-link link-primary" href="/orders">
            &larr; View all orders
          </a>

          <div className="delivery-date">
            {isCanceled 
              ? <span style={{ color: '#d9534f' }}>Order Canceled</span> 
              : `Arriving on ${arrivalDate}`
            }
          </div>

          <div className="progress-labels-container">
            {isCanceled ? (
               <div className="progress-label current-status" style={{ width: '100%', textAlign: 'center', color: '#d9534f', fontWeight: 'bold' }}>
                 Shipment Canceled
               </div>
            ) : (
               <>
                {/* Added textAlign center to JSX inline to ensure alignment on flex */}
                <div className={`progress-label ${progressPercent < 50 ? 'current-status' : ''}`} style={{textAlign: 'left'}}>Preparing</div>
                <div className={`progress-label ${progressPercent >= 50 && progressPercent < 100 ? 'current-status' : ''}`} style={{textAlign: 'center'}}>Shipped</div>
                <div className={`progress-label ${progressPercent === 100 ? 'current-status' : ''}`} style={{textAlign: 'right'}}>Delivered</div>
               </>
            )}
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: progressBarColor }}></div>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default Tracking;