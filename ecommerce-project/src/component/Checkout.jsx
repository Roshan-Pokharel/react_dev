import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PriceCents from '../utils/priceCents'; 
import apiClient from '../api'; 
import './Shared/General.css';
import './Checkout-css/Checkout-header.css'
import './Checkout-css/Checkout.css';
// You might need to add some CSS for the form inputs
import './Checkout-css/AddressForm.css'; // Create this file or add styles to Checkout.css

//--- Helper Function ---//
function formatDeliveryDate(deliveryDays) {
  if (deliveryDays === undefined) {
    return 'Select an option';
  }
  return dayjs().add(deliveryDays, 'day').format('dddd, MMMM D');
}

export function Checkout() {
  const [checkoutItem, setCheckoutItem] = useState([]);
  const [selectedOption, setSelectedOption] = useState({}); 
  const [paymentSummary, setPaymentSummary] = useState({});
  const [deliveryOptions, setDeliveryOptions] = useState([]); 
  const [editingProductId, setEditingProductId] = useState(null); 
  const [currentEditQuantity, setCurrentEditQuantity] = useState(1);
  
  // --- NEW STATE FOR ADDRESS ---
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  // ---------------------------

  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      const cartResponse = await apiClient.get('/cart-items?expand=product');
      setCheckoutItem(cartResponse.data);

      const deliveryResponse = await apiClient.get('/delivery-options');
      setDeliveryOptions(deliveryResponse.data);
      
      const summaryResponse = await apiClient.get('/payment-summary');
      setPaymentSummary(summaryResponse.data);

      // --- NEW: Fetch User Info to Prefill Address ---
      const userResponse = await apiClient.get('/auth/me');
      if (userResponse.data.user) {
        const u = userResponse.data.user;
        setShippingInfo({
          name: u.name || '',
          phone: u.phone || '',
          addressLine1: u.addressLine1 || '',
          city: u.city || '',
          state: u.state || '',
          postalCode: u.postalCode || '',
          country: u.country || ''
        });
      }
      // -----------------------------------------------

      if (cartResponse.data.length > 0) {
        const initialOptions = cartResponse.data.reduce((acc, item) => {
          acc[item.productId] = item.deliveryOptionId;
          return acc;
        }, {});
        setSelectedOption(initialOptions);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Failed to fetch checkout data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const updateCartItemDeliveryOption = async (productId, newDeliveryOptionId) => {
    setSelectedOption(prev => ({ ...prev, [productId]: newDeliveryOptionId }));
    try {
      await apiClient.put(`/cart-items/${productId}`, {
        deliveryOptionId: newDeliveryOptionId,
      });
      fetchAllData();
    } catch (error) {
      console.error('Failed to update delivery option:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await apiClient.delete(`/cart-items/${productId}`);
      fetchAllData();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleEditClick = (productId, currentQuantity) => {
    setEditingProductId(productId);
    setCurrentEditQuantity(currentQuantity);
  };

  const handleQuantityChange = (event) => {
    setCurrentEditQuantity(Number(event.target.value));
  };

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
      fetchAllData();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // --- NEW: Handle Form Input Changes ---
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- UPDATED: Create Order Logic ---
  const createOrder = async () => {
    // 1. Basic Validation
    if (!shippingInfo.addressLine1 || !shippingInfo.phone || !shippingInfo.city) {
      alert("Please fill in your shipping details (Address, Phone, City).");
      return;
    }

    try {
      // 2. Save the address to the user profile FIRST
      await apiClient.put('/auth/profile', shippingInfo);

      // 3. Create the order
      await apiClient.post('/orders');
      
      navigate('/orders');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please check your network.');
    }
  };

  return ( 
    <>
      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <a href="/">
              <img className="logo " src="images/logo.png" alt="Durga Shop Logo" />
               <img className="mobile-logo " src="images/mobile-logo.png" alt="Durga Shop Logo" />
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

      <div className="main checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <div className="order-summary">

            {/* --- NEW: Shipping Address Form --- */}
            <div className="shipping-section-container" style={{marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', background: 'white'}}>
              <h3 style={{marginBottom: '10px'}}>Shipping Address</h3>
              <div className="address-form-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                
                <div style={{gridColumn: 'span 2'}}>
                  <label>Full Name</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="name" 
                    value={shippingInfo.name} 
                    onChange={handleAddressChange} 
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                <div>
                  <label>Phone Number</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="phone" 
                    value={shippingInfo.phone} 
                    onChange={handleAddressChange} 
                    style={{width: '95%', padding: '5px'}}
                  />
                </div>

                <div>
                  <label>Country</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="country" 
                    value={shippingInfo.country} 
                    onChange={handleAddressChange} 
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                <div style={{gridColumn: 'span 2'}}>
                  <label>Address Line 1</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="addressLine1" 
                    value={shippingInfo.addressLine1} 
                    onChange={handleAddressChange} 
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                <div>
                  <label>City</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="city" 
                    value={shippingInfo.city} 
                    onChange={handleAddressChange} 
                    style={{width: '95%', padding: '5px'}}
                  />
                </div>

                <div>
                  <label>State</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="state" 
                    value={shippingInfo.state} 
                    onChange={handleAddressChange} 
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                <div>
                  <label>Postal Code</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="postalCode" 
                    value={shippingInfo.postalCode} 
                    onChange={handleAddressChange} 
                    style={{width: '95%', padding: '5px'}}
                  />
                </div>
              </div>
            </div>
            {/* ---------------------------------- */}

            {checkoutItem.map((item) => {
              const product = item.product;
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
                              className="quantity-input"
                            />
                            <span className="save-quantity-link" onClick={() => saveQuantity(product.id)}>Save</span>
                            <span className="cancel-quantity-link" onClick={() => setEditingProductId(null)}>Cancel</span>
                          </span>
                        ) : (
                          <span className="quantity-label">
                            {item.quantity}
                            <span className="update-quantity-link" onClick={() => handleEditClick(product.id, item.quantity)}>Update</span>
                          </span>
                        )}
                        <span className="delete-quantity-link" onClick={() => removeItem(product.id)}>Delete</span>
                      </div>
                    </div>

                    <div className="delivery-options">
                      <div className="delivery-options-title">Choose a delivery option:</div>
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
                              <div className="delivery-option-date">{formatDeliveryDate(option.deliveryDays)}</div>
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

          <div className="payment-summary">
            <div className="payment-summary-title">Payment Summary</div>
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
              <div>Estimated tax (0%):</div>
              <div className="payment-summary-money">{PriceCents(paymentSummary.taxCents)}</div>
            </div>
            <div className="payment-summary-row total-row">
              <div>Order total:</div>
              <div className="payment-summary-money">{PriceCents(paymentSummary.totalCostCents)}</div>
            </div>

            {/* Call updated createOrder function */}
            <button className="place-order-button button-primary" onClick={createOrder}>
              Place your order
            </button>
          </div>
        </div>
      </div>
    </>
  )
}