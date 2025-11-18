import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PriceCents from '../utils/priceCents'; // Utility function
import apiClient from '../api'; // *** CORRECTED: Using apiClient for Authorization ***

import './Shared/General.css';
import './Checkout-css/Checkout-header.css'
import './Checkout-css/Checkout.css';

//--- Helper Function ---//
function formatDeliveryDate(deliveryDays) {
  if (deliveryDays === undefined) {
    return 'Select an option';
  }
  // deliveryDays is a number (e.g., 7)
  return dayjs().add(deliveryDays, 'day').format('dddd, MMMM D');
}

//---> main function of this components <-----//
export function Checkout() {
  const [checkoutItem, setCheckoutItem] = useState([]);
  const [selectedOption,setSelectedOption] = useState({}); 
  // {productId: deliveryOptionId}
  const [paymentSummary, setPaymentSummary] = useState({});
  const [deliveryOptions, setDeliveryOptions] = useState([]); 
  const [editingProductId, setEditingProductId] = useState(null); 
  const [currentEditQuantity, setCurrentEditQuantity] = useState(1); 
  const navigate = useNavigate();

  // Helper to re-fetch all data after any change (cart update, option change)
  const fetchAllData = async () => {
    try {
      // Fetch cart items with product details
      const cartResponse = await apiClient.get('/cart-items?expand=product');
      setCheckoutItem(cartResponse.data);

      // Fetch all available delivery options
      const deliveryResponse = await apiClient.get('/delivery-options');
      setDeliveryOptions(deliveryResponse.data);
      
      // Fetch the updated payment summary
      const summaryResponse = await apiClient.get('/payment-summary');
      setPaymentSummary(summaryResponse.data);

      // Initialize selected options if they haven't been set
      if (cartResponse.data.length > 0) {
        const initialOptions = cartResponse.data.reduce((acc, item) => {
          acc[item.productId] = item.deliveryOptionId;
          return acc;
        }, {});
        setSelectedOption(initialOptions);
      } else {
        // If the cart is empty, navigate back to the home page
        navigate('/');
      }
    } catch (error) {
      console.error("Failed to fetch checkout data:", error);
      // Handle 401/403 errors (e.g., redirect to login)
    }
  };

  //-----> fetching the checkout data from the backend <------//
  useEffect(() => {
    fetchAllData();
  }, []); // Run only on initial mount

  // Handler for changing delivery options
  const updateCartItemDeliveryOption = async (productId, newDeliveryOptionId) => {
    // Optimistic UI update
    setSelectedOption(prev => ({ ...prev, [productId]: newDeliveryOptionId }));
    
    try {
      // API call to update the delivery option
      await apiClient.put(`/cart-items/${productId}`, {
        deliveryOptionId: newDeliveryOptionId,
      });

      // Re-fetch all data to update payment summary
      fetchAllData();
    } catch (error) {
      console.error('Failed to update delivery option:', error);
      // Revert optimistic update if necessary
      // For now, simply log the error.
    }
  };

  // Handler for removing an item from the cart
  const removeItem = async (productId) => {
    try {
      await apiClient.delete(`/cart-items/${productId}`);
      // Re-fetch all data
      fetchAllData();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Handler for opening quantity edit mode
  const handleEditClick = (productId, currentQuantity) => {
    setEditingProductId(productId);
    setCurrentEditQuantity(currentQuantity);
  };

  // Handler for changing quantity in edit mode
  const handleQuantityChange = (event) => {
    setCurrentEditQuantity(Number(event.target.value));
  };

  // Handler for saving the new quantity
  const saveQuantity = async (productId) => {
    if (currentEditQuantity < 1 || currentEditQuantity > 10) {
      alert("Quantity must be between 1 and 10.");
      return;
    }
    
    try {
      await apiClient.put(`/cart-items/${productId}`, {
        quantity: currentEditQuantity,
      });
      setEditingProductId(null);
      // Re-fetch all data
      fetchAllData();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };


  // Handler for creating the final order
  const createOrder = async () => {
    try {
      // POST request to create the order
      await apiClient.post('/orders');
      
      // Navigate to the orders page after success
      navigate('/orders');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please check your cart items.');
    }
  };


  return (
    <>
      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <a href="/">
              {/* --- CORRECTION 1: Changed "amazon-logo" to "logo" --- */}
              <img className="logo" src="images/logo.png" alt="Amazon Logo" />
            </a>
          </div>

          <div className="checkout-header-middle-section">
            Checkout ({paymentSummary.totalItems || 0} items)
          </div>

          <div className="checkout-header-right-section">
            <img src="images/icons/checkout-lock-icon.png" alt="Lock Icon" />
          </div>
        </div>
      </div>

      {/* --- CORRECTION 2: Added "checkout-page" class --- */}
      <div className="main checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <div className="order-summary">

            {/* --- Cart Items List --- */}
            {checkoutItem.map((item) => {
              const product = item.product;
              // Find the selected delivery option details
              const currentDeliveryOption = deliveryOptions.find(
                (option) => option.id === item.deliveryOptionId
              );

              return (
                <div key={item.productId} className="cart-item-container">
                  <div className="delivery-date">
                    Estimated delivery: {formatDeliveryDate(currentDeliveryOption?.deliveryDays)}
                  </div>

                  <div className="cart-item-details-grid">
                    <img className="product-image" src={product?.image} alt={product?.name} />

                    <div className="cart-item-details">
                      <div className="product-name">{product?.name}</div>
                      <div className="product-price">{PriceCents(product?.priceCents)}</div>
                      <div className="product-quantity">
                        Quantity: 
                        {editingProductId === product.id ? (
                          <span className="edit-quantity">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={currentEditQuantity}
                              onChange={handleQuantityChange}
                              /* --- CORRECTION 3: Added className --- */
                              className="quantity-input"
                            />
                            <span 
                              /* --- CORRECTION 4: Changed className --- */
                              className="save-quantity-link" 
                              onClick={() => saveQuantity(product.id)}
                            >
                              Save
                            </span>
                            <span 
                              /* --- CORRECTION 5: Changed className --- */
                              className="cancel-quantity-link" 
                              onClick={() => setEditingProductId(null)}
                            >
                              Cancel
                            </span>
                          </span>
                        ) : (
                          <span className="quantity-label">
                            {item.quantity}
                            <span 
                              className="update-quantity-link" 
                              onClick={() => handleEditClick(product.id, item.quantity)}
                            >
                              Update
                            </span>
                          </span>
                        )}
                        
                        <span className="delete-quantity-link" onClick={() => removeItem(product.id)}>
                          Delete
                        </span>
                      </div>
                    </div>

                    <div className="delivery-options">
                      <div className="delivery-options-title">
                        Choose a delivery option:
                      </div>
                      {deliveryOptions.map((option) => {
                        const isChecked = option.id === item.deliveryOptionId;
                        return (
                          <div key={option.id} className="delivery-option">
                            <input
                              type="radio"
                              checked={isChecked}
                              name={`delivery-option-${product.id}`}
                              className="delivery-option-input"
                              onChange={() => updateCartItemDeliveryOption(product.id, option.id)}
                            />
                            <div>
                              <div className="delivery-option-date">
                                {formatDeliveryDate(option.deliveryDays)}
                              </div>
                              <div className="delivery-option-price">
                                {option.priceCents === 0 ? 'FREE' : PriceCents(option.priceCents)} Shipping
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- Payment Summary --- */}
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

            <button className="place-order-button button-primary" onClick={createOrder}>
              Place your order
            </button>
          </div>
        </div>
      </div>
    </>
  )
}