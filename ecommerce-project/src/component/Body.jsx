import { Header } from '../component/Shared/Header.jsx';
import { Product } from './home/product.jsx';
import './Shared/General.css';
import './Shared/Header.css';
import './Home.css';

import { useState, useEffect } from 'react';
import axios from 'axios';

function Body() {
  const [products, setProducts] = useState([]);
  const [loadCart, setLoadCart] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NEW: Toast State ---
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      axios.get(`/api/products?search=${searchTerm}`).then((response) => {
        setProducts(response.data);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const triggerCartReload = () => {
    setLoadCart(prevCount => prevCount + 1);
  };

  const handleSuggestionClick = (productName) => {
    setSearchTerm(productName);
  };

  // --- NEW: Helper to show toast ---
  const showNotification = (message) => {
    setToast(message);
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <>
      <Header
        loadCart={loadCart}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={products}
        onSuggestionClick={handleSuggestionClick}
      />

      <div className="home-page">
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <Product
                key={product.id}
                product={product}
                loadCart={triggerCartReload}
                // Pass the notification function down
                showNotification={showNotification}
              />
            ))
          ) : (
            searchTerm && <p className="no-products-found">No products found.</p>
          )}
        </div>
      </div>

      {/* --- NEW: Render Toast --- */}
      {toast && (
        <div className="toast-notification success">
            <span className="toast-icon">&#10003;</span>
            {toast}
        </div>
      )}
    </>
  );
}

export default Body;