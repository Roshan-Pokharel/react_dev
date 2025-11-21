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
  
  // --- UPDATED: State for Message AND Type ---
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

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

  // --- UPDATED: Helper now accepts a type (default is success) ---
  const showNotification = (message, type = 'success') => {
    setToast(message);
    setToastType(type); // Set the type (green or red)
    
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
                showNotification={showNotification}
              />
            ))
          ) : (
            searchTerm && <p className="no-products-found">No products found.</p>
          )}
        </div>
      </div>

      {/* --- UPDATED: Conditional Rendering for Icon and Color --- */}
      {toast && (
        <div className={`toast-notification ${toastType}`}>
            {/* Show Tick if Success, Show X if Error */}
            <span className="toast-icon">
              {toastType === 'success' ? '\u2713' : '\u2715'} 
            </span>
            {toast}
        </div>
      )}
    </>
  );
}

export default Body;