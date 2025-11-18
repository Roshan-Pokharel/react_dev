import apiClient from '../../api';
import React from 'react'
import { useEffect, useState } from 'react';
import  GoogleLoginButton from './login';
import './Header.css';

// Accept new props: suggestions and onSuggestionClick
export function Header({
  loadCart,
  searchTerm,
  setSearchTerm,
  suggestions,
  onSuggestionClick
}) {
  const [paymentSummary, setPaymentSummary] = useState({});
  
  // New state to track if the search bar is focused
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    apiClient.get("/payment-summary").then((response) => {
      setPaymentSummary(response.data);
    });
  }, [loadCart]);

  // Determine if we should show suggestions
  const showSuggestions = isInputFocused && searchTerm && suggestions.length > 0;

  return (
    <div className="header">
      <div className="left-section">
        <a href="/" className="header-link">
          <img className="logo" src="images/logo-white.png" />
          <img className="mobile-logo" src="images/mobile-logo-white.png" />
        </a>
      </div>

      {/* The middle-section now needs to be relative
          for the absolute positioning of the suggestions */}
      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // Show suggestions when input is focused
          onFocus={() => setIsInputFocused(true)}
          // Hide suggestions on blur (with a delay)
          onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
        />

        <button className="search-button">
          <img className="search-icon" src="images/icons/search-icon.png" />
        </button>

        {/* --- New Suggestions Dropdown --- */}
        {showSuggestions && (
          <ul className="search-suggestions">
            {suggestions.map((product) => (
              <li
                key={product.id}
                // Use onClick to set the search term
                onClick={() => onSuggestionClick(product.name)}
              >
                {product.name}
              </li>
            ))}
          </ul>
        )}
        {/* --- End of Suggestions Dropdown --- */}

      </div>

      <div className="right-section">
        <a className="orders-link header-link" href="orders">
          <span className="orders-text">Orders</span>
        </a>

        <a className="cart-link header-link" href="checkout">
          <img className="cart-icon" src="images/icons/cart-icon.png" />
          <div className="cart-quantity">{paymentSummary.totalItems}</div>
          <div className="cart-text">Cart</div>
        </a>
        
         <React.Fragment >
          {<GoogleLoginButton />}
          </React.Fragment>
       
      </div>
    </div>
  );
}