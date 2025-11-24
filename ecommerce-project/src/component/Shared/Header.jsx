import apiClient from '../../api';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GoogleLoginButton from './login';
import './Header.css';

// --- NEW: Import images directly ---
// Adjust the path '../images/...' based on where you moved your folder inside src
import logoWhite from '../../../public/logo-white.png';
import mobileLogoWhite from '../../../public/mobile-logo-white.png';
import searchIconImg from '../../../public/search-icon.png';
import cartIconImg from '../../../public/cart-icon.png';

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
  const [inputValue, setInputValue] = useState(searchTerm);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, setSearchTerm]);

  useEffect(() => {
    if (searchTerm !== inputValue) {
        if (searchTerm === "") setInputValue(""); 
    }
  }, [searchTerm]);

  useEffect(() => {
    apiClient.get("/payment-summary")
      .then((response) => {
        setPaymentSummary(response.data);
      })
      .catch((err) => {
        console.log("Cart fetch failed:", err);
        setPaymentSummary({ totalItems: 0, totalCostCents: 0 });
      });
  }, [loadCart, authUpdate]); 

  const showSuggestions = isInputFocused && searchTerm && suggestions.length > 0;

  const handleSearch = () => {
    if (inputValue) {
      onSuggestionClick(inputValue);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
      event.target.blur();
      setIsInputFocused(false);
    }
  };

  return (
    <div className="header">
      <div className="left-section">
        <Link to="/" className="header-link">
          {/* USE IMPORTED VARIABLES HERE */}
          <img className="logo" src={logoWhite} alt="logo" />
          <img className="mobile-logo" src={mobileLogoWhite} alt="logo" />
        </Link>
      </div>

      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
          onKeyDown={handleKeyDown} 
        />

        <button className="search-button" onClick={handleSearch}>
          {/* USE IMPORTED VARIABLE HERE */}
          <img className="search-icon" src={searchIconImg} alt="search" />
        </button>

        {showSuggestions && (
          <ul className="search-suggestions">
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => {
                    setInputValue(product.name); 
                    onSuggestionClick(product.name);
                }}
              >
                {product.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="right-section">
        <Link className="orders-link header-link" to="/orders">
          <span className="orders-text">Orders</span>
        </Link>

        <Link className="cart-link header-link" to="/checkout">
          {/* USE IMPORTED VARIABLE HERE */}
          <img className="cart-icon" src={cartIconImg} alt="cart" />
          <div className="cart-quantity">{paymentSummary.totalItems || 0}</div>
          <div className="cart-text">Cart</div>
        </Link>
        
        <React.Fragment>
          <GoogleLoginButton 
            onAuthChange={() => setAuthUpdate(prev => prev + 1)} 
          />
        </React.Fragment>
       
      </div>
    </div>
  );
}