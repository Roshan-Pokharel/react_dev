import axios from 'axios';
import { useEffect, useState, Fragment } from 'react';
import dataFetch from '../utils/dataFetch';
import React from 'react';
import PriceCents from '../utils/priceCents'; 
import dayjs from 'dayjs';
import { optionFirstDate, optionSecondDate, optionThirdDate } from '../utils/date';
import './Shared/General.css';
import './Checkout-css/Checkout-header.css';
import './Checkout-css/Checkout.css';

//--- Helper Functions ---//

function getDeliveryDate(optionValue) {
  switch (optionValue) {
    case 'free':
      return dayjs(optionFirstDate()).format('dddd, MMMM D');
    case '499':
      return dayjs(optionSecondDate()).format('dddd, MMMM D');
    case '999':
      return dayjs(optionThirdDate()).format('dddd, MMMM D');
    default:
      return 'Select an option';
  }
}

// NEW: Maps backend ID (e.g., "1") to component value (e.g., "free")
function getOptionValueFromId(optionId) {
  switch (String(optionId)) { // Ensure it's a string
    case '1': return 'free';
    case '2': return '499';
    case '3': return '999';
    default: return 'free'; // Default to free if data is missing or invalid
  }
}

// NEW: Gets the shipping cost in cents from the component value
function getShippingCostCents(optionValue) {
  switch (optionValue) {
    case 'free': return 0;
    case '499': return 499;
    case '999': return 999;
    default: return 0;
  }
}


//---> main function of this components <-----//
export function Checkout({ products }) {
  const [checkoutItem, setCheckoutItem] = useState([]);
  const [selectedOption, setSelectedOption] = useState({});

  //-----> fetching the checkout data from the backend <------//
  useEffect(() => {
    axios.get("http://localhost:3000/api/cart-items").then((response) => {
      
      setCheckoutItem(response.data);

      // UPDATED: Use the helper to read 'deliveryOptionId' from the API response
      const initialSelectedOptions = response.data.reduce((acc, item) => {
        acc[item.productId] = getOptionValueFromId(item.deliveryOptionId);
        return acc;
      }, {});
      
      setSelectedOption(initialSelectedOptions);
    });
  }, [products]); // Added products as a dependency, in case it loads async

  //--- Dynamic Calculation Logic ---//

  const totalItems = checkoutItem.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  // NEW: Calculate all totals dynamically
  let itemsTotalCents = 0;
  let shippingTotalCents = 0;

  checkoutItem.forEach((cartItem) => {
    // Find the full product details
    const product = dataFetch(cartItem, products);
    if (product) {
      // Add item price * quantity
      itemsTotalCents += product.priceCents * cartItem.quantity;
    }

    // Find the selected shipping option value (e.g., 'free', '499')
    const shippingOptionValue = selectedOption[cartItem.productId];
    
    // Add its cost
    shippingTotalCents += getShippingCostCents(shippingOptionValue);
  });

  const subtotalCents = itemsTotalCents + shippingTotalCents;
  const taxCents = subtotalCents * 0.1; // 10% tax
  const orderTotalCents = subtotalCents + taxCents;


  return (
    <>
      <div className="checkout-header">
        {/* ... (Header is unchanged, but totalItems will now be correct) ... */}
        <div className="header-content">
          <div className="checkout-header-left-section">
            <a href="/">
              <img className="logo" src="images/logo.png" />
              <img className="mobile-logo" src="images/mobile-logo.png" />
            </a>
          </div>
          <div className="checkout-header-middle-section">
            Checkout (<a className="return-to-home-link"
              href="/">{`${totalItems} Items`}</a>)
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
            {checkoutItem.map((checkoutItem) => {
              const product = dataFetch(checkoutItem, products);

              // Handler function for radio button changes
              const handleOptionChange = (e) => {
                const { value } = e.target;
                setSelectedOption(prevOptions => ({
                  ...prevOptions,
                  [checkoutItem.productId]: value
                }));

                // TODO: Here you would also make an API call (axios.put/patch)
                // to update the backend with the new deliveryOptionId
              };

              return (
                <Fragment key={checkoutItem.id}>
                  <div className="cart-item-container">
                    <div className="delivery-date">
                      Delivery date: {getDeliveryDate(selectedOption[checkoutItem.productId])}
                    </div>

                    <div className="cart-item-details-grid">
                      <img className="product-image"
                        src={product?.image} />

                      <div className="cart-item-details">
                        {/* ... (Product details are unchanged) ... */}
                        <div className="product-name">
                          {product?.name}
                        </div>
                        <div className="product-price">
                          {PriceCents(product?.priceCents)}
                        </div>
                        <div className="product-quantity">
                          <span>
                            Quantity: <span className="quantity-label">{checkoutItem.quantity}</span>
                          </span>
                          <span className="update-quantity-link link-primary">
                            Update
                          </span>
                          <span className="delete-quantity-link link-primary">
                            Delete
                          </span>
                        </div>
                      </div>

                      <div className="delivery-options">
                        {/* ... (Delivery options are unchanged, but 'checked' and 'onChange'
                              are now robust and work correctly) ... */}
                        <div className="delivery-options-title">
                          Choose a delivery option:
                        </div>
                        <div className="delivery-option">
                          <input type="radio"
                            className="delivery-option-input"
                            name={checkoutItem.productId}
                            value="free"
                            checked={selectedOption[checkoutItem.productId] === 'free'}
                            onChange={handleOptionChange}
                          />
                          <div>
                    <div className="delivery-option-date">
                     { getDeliveryDate('free')}
                    </div>
                    <div className="delivery-option-price">
                      FREE Shipping
                    </div>
                  </div>
                        </div>
                        <div className="delivery-option">
                          <input type="radio"
                            className="delivery-option-input"
                            name={checkoutItem.productId}
                            value="499"
                            checked={selectedOption[checkoutItem.productId] === '499'}
                            onChange={handleOptionChange}
                          />
                        <div>
                    <div className="delivery-option-date">
                     { getDeliveryDate('499')}
                    </div>
                    <div className="delivery-option-price">
                      $4.99-Shipping
                    </div>
                  </div>
                        </div>
                        <div className="delivery-option">
                          <input type="radio"
                            className="delivery-option-input"
                            name={checkoutItem.productId}
                            value="999"
                            checked={selectedOption[checkoutItem.productId] === '999'}
                            onChange={handleOptionChange}
                          />
                          <div>
                    <div className="delivery-option-date">
                     { getDeliveryDate('999')}
                    </div>
                    <div className="delivery-option-price">
                      $9.99-Shipping
                    </div>
                  </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Fragment>
              )
            })}
          </div> {/* .order-summary */}

          {/* --- UPDATED DYNAMIC PAYMENT SUMMARY --- */}
          <div className="payment-summary">
            <div className="payment-summary-title">
              Payment Summary
            </div>

            <div className="payment-summary-row">
              <div>Items ({totalItems}):</div>
              <div className="payment-summary-money">{PriceCents(itemsTotalCents)}</div>
            </div>

            <div className="payment-summary-row">
              <div>Shipping &amp; handling:</div>
              <div className="payment-summary-money">{PriceCents(shippingTotalCents)}</div>
            </div>

            <div className="payment-summary-row subtotal-row">
              <div>Total before tax:</div>
              <div className="payment-summary-money">{PriceCents(subtotalCents)}</div>
            </div>

            <div className="payment-summary-row">
              <div>Estimated tax (10%):</div>
              <div className="payment-summary-money">{PriceCents(taxCents)}</div>
            </div>

            <div className="payment-summary-row total-row">
              <div>Order total:</div>
              <div className="payment-summary-money">{PriceCents(orderTotalCents)}</div>
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