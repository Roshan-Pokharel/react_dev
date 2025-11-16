import axios from 'axios';
import { useEffect, useState, Fragment } from 'react';
import dataFetch from '../utils/dataFetch';
import React from 'react';
import PriceCents from '../utils/priceCents'; 
import dayjs from 'dayjs';
// Removed unused date utils

import './Shared/General.css';
import './Checkout-css/Checkout-header.css';
import './Checkout-css/Checkout.css';

//--- NEW Helper Function ---//
// This function takes the delivery days (e.g., 7) and formats it
function formatDeliveryDate(deliveryDays) {
  if (deliveryDays === undefined) {
    return 'Select an option';
  }
  return dayjs().add(deliveryDays, 'day').format('dddd, MMMM D');
}

//---> main function of this components <-----//
export function Checkout({ products, cartItem }) {
  const [checkoutItem, setCheckoutItem] = useState([]);
  const [selectedOption, setSelectedOption] = useState({});
  const [paymentSummary, setPaymentSummary] = useState({});
  const [deliveryOptions, setDeliveryOptions] = useState([]); // <-- STEP 1

  //-----> fetching the checkout data from the backend <------//
  useEffect(() => {
    // Use Promise.all to fetch all data in parallel
    Promise.all([
      axios.get("http://localhost:3000/api/cart-items"),
      axios.get('http://localhost:3000/api/payment-summary'),
      axios.get('http://localhost:3000/api/delivery-options') // <-- STEP 1
    ]).then(([cartResponse, summaryResponse, optionsResponse]) => {
      
      setCheckoutItem(cartResponse.data);
      setPaymentSummary(summaryResponse.data);
      setDeliveryOptions(optionsResponse.data); // <-- Set options state

      // UPDATED: Use the *actual* deliveryOptionId from the API
      // This will store state like: { productId: '1', otherProductId: '3' }
      const initialSelectedOptions = cartResponse.data.reduce((acc, item) => {
        // Use the ID from the backend, or default to '1' (which is usually free)
        acc[item.productId] = item.deliveryOptionId || '1'; 
        return acc;
      }, {});
      
      setSelectedOption(initialSelectedOptions);

    }).catch(error => {
        console.error("Error fetching data:", error);
    });
  // Note: 'products' dependency might not be needed if this page fetches all its own data
  }, [products, cartItem]); 
 
  //-----> Handler to update backend <-----//
  const handleOptionChange = async (e, productId) => { // <-- STEP 3
    const newDeliveryOptionId = e.target.value;

    // 1. Update local state optimistically so the UI is fast
    setSelectedOption(prevOptions => ({
      ...prevOptions,
      [productId]: newDeliveryOptionId
    }));

    try {
      // 2. Send PUT request to the backend
      await axios.put(`http://localhost:3000/api/cart-items/${productId}`, {
        deliveryOptionId: newDeliveryOptionId
      });

      // 3. Refetch payment summary (shipping cost has changed)
      const response = await axios.get('http://localhost:3000/api/payment-summary');
      setPaymentSummary(response.data);

    } catch (error) {
      console.error('Failed to update delivery option:', error);
      // Optional: You could revert the state here if the API call fails
    }
  };

  return (
    <>
      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <a href="/">
              <img className="logo" src="images/logo.png" />
              <img className="mobile-logo" src="images/mobile-logo.png" />
            </a>
          </div>
          <div className="checkout-header-middle-section">
            Checkout (<a className="return-to-home-link"
              href="/">{`${paymentSummary.totalItems || 0} Items`}</a>)
          </div>
          <div className="checkout-header-right-section">
            <img src="images/icons/checkout-lock-icon.png" />
          </div>
        </div>
      </div>

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <div className="order-summary">
            {checkoutItem.map((cartItem) => {
              const product = dataFetch(cartItem, products);

              // Find the full delivery option object that is currently selected
              const currentDeliveryOption = deliveryOptions.find(
                option => option.id === selectedOption[cartItem.productId]
              );

              return (
                <Fragment key={cartItem.productId}> {/* Use productId as key */}
                  <div className="cart-item-container">
                    <div className="delivery-date">
                      {/* Use the new helper and data */}
                      Delivery date: {formatDeliveryDate(currentDeliveryOption?.deliveryDays)}
                    </div>

                    <div className="cart-item-details-grid">
                      <img className="product-image"
                        src={product?.image} />

                      <div className="cart-item-details">
                        <div className="product-name">
                          {product?.name}
                        </div>
                        <div className="product-price">
                          {PriceCents(product?.priceCents)}
                        </div>
                        <div className="product-quantity">
                          <span>
                            Quantity: <span className="quantity-label">{cartItem.quantity}</span>
                          </span>
                          <span className="update-quantity-link link-primary">
                            Update
                          </span>
                          <span className="delete-quantity-link link-primary" onClick={async()=>{
                             await axios.delete(`http://localhost:3000/api/cart-items/${cartItem.productId}`)

                          } 
                          }>
                            Delete
                          </span>
                        </div>
                      </div>

                      {/* --- STEP 4: DYNAMICALLY RENDER OPTIONS --- */}
                      <div className="delivery-options">
                        <div className="delivery-options-title">
                          Choose a delivery option:
                        </div>
                        {deliveryOptions.map(option => (
                          <div className="delivery-option" key={option.id}>
                            <input type="radio"
                              className="delivery-option-input"
                              name={cartItem.productId} // Group by product ID
                              value={option.id} // The value is the backend ID
                              checked={selectedOption[cartItem.productId] === option.id}
                              onChange={(e) => handleOptionChange(e, cartItem.productId)}
                            />
                            <div>
                              <div className="delivery-option-date">
                                {formatDeliveryDate(option.deliveryDays)}
                              </div>
                              <div className="delivery-option-price">
                                {option.priceCents === 0
                                  ? 'FREE Shipping'
                                  : `${PriceCents(option.priceCents)} - Shipping`
                                }
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Fragment>
              )
            })}
          </div> {/* .order-summary */}

          {/* --- PAYMENT SUMMARY --- */}
          <div className="payment-summary">
            <div className="payment-summary-title">
              Payment Summary
            </div>

            <div className="payment-summary-row">
              <div>Items ({paymentSummary.totalItems || 0}):</div>
              <div className="payment-summary-money">{PriceCents(paymentSummary.productCostCents)}</div>
            </div>

            <div className="payment-summary-row">
              <div>Shipping &amp; handling:</div>
              <div className="payment-summary-money">{PriceCents(paymentSummary.shippingCostCents)}</div>
            </div>

            <div className="payment-summary-row subtotal-row">
              <div>Total before tax:</div>
              <div className="payment-summary-money">{PriceCents(paymentSummary.totalCostBeforeTaxCents)}</div>
            </div>

            <div className="payment-summary-row">
              <div>Estimated tax (10%):</div>
              <div className="payment-summary-money">{PriceCents(paymentSummary.taxCents)}</div>
            </div>

            <div className="payment-summary-row total-row">
              <div>Order total:</div>
              <div className="payment-summary-money">{PriceCents(paymentSummary.totalCostCents)}</div>
            </div>

            <button className="place-order-button button-primary">
              Place your order
            </button>
          </div>
        </div>
      </div>
    </>
  )
}