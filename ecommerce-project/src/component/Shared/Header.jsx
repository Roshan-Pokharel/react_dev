import apiClient from '../../api';
import React, { useEffect, useState } from 'react';
import GoogleLoginButton from './login';
import './Header.css';

export function Header({
  loadCart,
  searchTerm,      // The search term from the Parent (slow)
  setSearchTerm,   // The function to update the Parent
  suggestions,
  onSuggestionClick
}) {
  const [paymentSummary, setPaymentSummary] = useState({});
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [authUpdate, setAuthUpdate] = useState(0);

  // 1. Create a LOCAL state for the input box (Instant updates)
  const [inputValue, setInputValue] = useState(searchTerm);

  // 2. Sync Local State with Parent State (Debouncing)
  useEffect(() => {
    // Set a timer to update the parent after 300ms
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);

    // Cleanup function: If user types again before 300ms, cancel the previous timer
    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, setSearchTerm]);

  // 3. Sync in reverse: If Parent clears search, update local input
  useEffect(() => {
    if (searchTerm !== inputValue) {
        // Only sync if they are different to avoid loops (mostly for clearing search)
        if (searchTerm === "") setInputValue(""); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Use inputValue here so it sends exactly what is in the box currently
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
          
          // 4. Bind input to LOCAL state (Fast) instead of Parent state (Slow)
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
          onKeyDown={handleKeyDown} 
        />

        <button className="search-button" onClick={handleSearch}>
          <img className="search-icon" src="images/icons/search-icon.png" alt="search" />
        </button>

        {showSuggestions && (
          <ul className="search-suggestions">
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => {
                    setInputValue(product.name); // Update local input immediately
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
        <a className="orders-link header-link" href="orders">
          <span className="orders-text">Orders</span>
        </a>

        <a className="cart-link header-link" href="checkout">
          <img className="cart-icon" src="images/icons/cart-icon.png" alt="cart" />
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