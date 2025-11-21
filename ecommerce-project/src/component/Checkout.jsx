import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Imported Link
import dayjs from 'dayjs';
import PriceCents from '../utils/priceCents.js'; 
import apiClient from '../api'; 
import './Shared/General.css';
import './Checkout-css/Checkout-header.css';
import './Checkout-css/Checkout.css';

function formatDeliveryDate(deliveryDays) {
  if (deliveryDays === undefined) {
    return 'Select an option';
  }
  return dayjs().add(deliveryDays, 'day').format('dddd, MMMM D');
}

export function Checkout() {
  const [checkoutItem, setCheckoutItem] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({});
  const [deliveryOptions, setDeliveryOptions] = useState([]); 
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null); 
  const [currentEditQuantity, setCurrentEditQuantity] = useState(1);
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      const cartResponse = await apiClient.get('/cart-items?expand=product');
      setCheckoutItem(cartResponse.data);

      const deliveryResponse = await apiClient.get('/delivery-options');
      setDeliveryOptions(deliveryResponse.data);
      
      const summaryResponse = await apiClient.get('/payment-summary');
      setPaymentSummary(summaryResponse.data);

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

      if (cartResponse.data.length > 0) {
        setSelectedDeliveryId(cartResponse.data[0].deliveryOptionId);
      } 
    } catch (error) {
      console.error("Failed to fetch checkout data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleGlobalDeliveryChange = async (newOptionId) => {
    setSelectedDeliveryId(newOptionId); 
    try {
      const updatePromises = checkoutItem.map(item => 
        apiClient.put(`/cart-items/${item.productId}`, {
          deliveryOptionId: newOptionId,
        })
      );
      await Promise.all(updatePromises);
      fetchAllData();
    } catch (error) {
      console.error('Failed to update global delivery option:', error);
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

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createOrder = async () => {
    if (!shippingInfo.addressLine1 || !shippingInfo.phone || !shippingInfo.city) {
      alert("Please fill in your shipping details (Address, Phone, City).");
      return;
    }

    try {
      await apiClient.put('/auth/profile', shippingInfo);
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
            {/* Changed a href to Link to */}
            <Link to="/">
              <img className="logo" src="images/logo.png" alt="Durga Shop Logo" />
               <img className="mobile-logo" src="images/mobile-logo.png" alt="Durga Shop Logo" />
            </Link>
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

            <div className="shipping-section-container">
              <h3 className="delivery-title">Shipping Address</h3>
              <div className="address-form-grid">
                
                <div className="span-two">
                  <label className="input-label">Full Name</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="name" 
                    value={shippingInfo.name} 
                    onChange={handleAddressChange} 
                  />
                </div>

                <div>
                  <label className="input-label">Phone Number</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="phone" 
                    value={shippingInfo.phone} 
                    onChange={handleAddressChange} 
                  />
                </div>

                <div>
                  <label className="input-label">Country</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="country" 
                    value={shippingInfo.country} 
                    onChange={handleAddressChange} 
                  />
                </div>

                <div className="span-two">
                  <label className="input-label">Address Line 1</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="addressLine1" 
                    value={shippingInfo.addressLine1} 
                    onChange={handleAddressChange} 
                  />
                </div>

                <div>
                  <label className="input-label">City</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="city" 
                    value={shippingInfo.city} 
                    onChange={handleAddressChange} 
                  />
                </div>

                <div>
                  <label className="input-label">State</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="state" 
                    value={shippingInfo.state} 
                    onChange={handleAddressChange} 
                  />
                </div>

                <div>
                  <label className="input-label">Postal Code</label>
                  <input 
                    className="address-input" 
                    type="text" 
                    name="postalCode" 
                    value={shippingInfo.postalCode} 
                    onChange={handleAddressChange} 
                  />
                </div>
              </div>
            </div>

            <div className="delivery-options-container">
               <div className="delivery-title">
                  Choose your delivery speed
               </div>
               
               <div className="delivery-grid">
                 {deliveryOptions.map((option) => {
                   const isSelected = option.id === selectedDeliveryId;
                   
                   return (
                     <div 
                       key={option.id} 
                       className={`delivery-card ${isSelected ? 'selected' : ''}`}
                       onClick={() => handleGlobalDeliveryChange(option.id)}
                     >
                       <input
                         type="radio"
                         name="global-delivery-option"
                         className="hidden-radio"
                         checked={isSelected}
                         readOnly
                       />

                       <div className="custom-radio"></div>

                       <div className="option-info">
                         <span className="option-date">
                            {formatDeliveryDate(option.deliveryDays)}
                         </span>
                         <span className="option-price">
                           {option.priceCents === 0 
                              ? <span className="free-shipping-text">FREE Shipping</span> 
                              : `${PriceCents(option.priceCents)} - Standard`
                           }
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>

            {checkoutItem.map((item) => {
              const product = item.product;

              return (
                <div key={item.productId} className="cart-item-container">
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

            <button className="place-order-button button-primary" onClick={createOrder}>
              Place your order
            </button>
          </div>
        </div>
      </div>
    </>
  )
}