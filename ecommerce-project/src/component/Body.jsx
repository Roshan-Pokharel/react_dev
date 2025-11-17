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

  // This useEffect (with debounce) is still correct
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

  /**
   * New handler for when a user clicks a suggestion.
   * It sets the search term to the product's name.
   */
  const handleSuggestionClick = (productName) => {
    setSearchTerm(productName);
  };

  return (
    <>
      <Header
        loadCart={loadCart}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        // Pass the products list as suggestions
        suggestions={products}
        // Pass the new click handler
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
              />
            ))
          ) : (
            searchTerm && <p className="no-products-found">No products found.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Body;