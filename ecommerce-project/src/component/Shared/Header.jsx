import apiClient from '../../api';
import React, { useEffect, useState } from 'react';
import GoogleLoginButton from './login';
import './Header.css';

export function Header({
  loadCart,
  searchTerm,
  setSearchTerm,
  suggestions,
  onSuggestionClick
}) {
  const [paymentSummary, setPaymentSummary] = useState({});
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [authUpdate, setAuthUpdate] = useState(0);

  useEffect(() => {
    apiClient.get("/payment-summary")
      .then((response) => {
        setPaymentSummary(response.data);
      })
      .catch((err) => {
        // --- FIX: If fetching fails (e.g. 401 Unauthorized after logout), reset cart ---
        console.log("Cart fetch failed (likely logged out):", err);
        setPaymentSummary({ totalItems: 0, totalCostCents: 0 });
      });
  }, [loadCart, authUpdate]); // Re-run when authUpdate changes

  const showSuggestions = isInputFocused && searchTerm && suggestions.length > 0;

  return (
    <div className="header">
      <div className="left-section">
        <a href="/" className="header-link">
          <img className="logo" src="images/logo-white.png" alt="logo" />
          <img className="mobile-logo" src="images/mobile-logo-white.png" alt="logo" />
        </a>
      </div>

      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
        />

        <button className="search-button">
          <img className="search-icon" src="images/icons/search-icon.png" alt="search" />
        </button>

        {showSuggestions && (
          <ul className="search-suggestions">
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => onSuggestionClick(product.name)}
              >
                {product.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="right-section">
        <a className="orders-link header-link" href="orders">
          <span className="orders-text">Orders</span>
        </a>

        <a className="cart-link header-link" href="checkout">
          <img className="cart-icon" src="images/icons/cart-icon.png" alt="cart" />
          {/* Fallback to 0 if totalItems is undefined */}
          <div className="cart-quantity">{paymentSummary.totalItems || 0}</div>
          <div className="cart-text">Cart</div>
        </a>
        
        <React.Fragment>
          <GoogleLoginButton 
            onAuthChange={() => setAuthUpdate(prev => prev + 1)} 
          />
        </React.Fragment>
       
      </div>
    </div>
  );
}