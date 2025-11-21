import apiClient from '../../api';
import { useState } from 'react';
import PriceCents from '../../utils/priceCents';

export function Product({ product, loadCart, showNotification }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="product-container">
      <div className="product-image-container">
        <img className="product-image" src={product.image} alt={product.name} />
      </div>

      <div className="product-name limit-text-to-2-lines">
        {product.name}
      </div>

      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          src={`images/ratings/rating-${product.rating.stars * 10}.png`}
          alt={`${product.rating.stars} stars`}
        />
        <div className="product-rating-count link-primary">
          {product.rating.count}
        </div>
      </div>

      <div className="product-price">
        {PriceCents(product.priceCents)}
      </div>

      <div className="product-quantity-container">
        <select
          className="product-quantity-select"
          value={quantity}
          onChange={(event) => {
            const quantitySelected = Number(event.target.value);
            setQuantity(quantitySelected);
          }}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="product-spacer"></div>

      <button
        className="add-to-cart-button button-primary"
        onClick={async () => {
          try {
            await apiClient.post('/cart-items', {
              productId: product.id,
              quantity,
            });
            await loadCart();
            
            if (showNotification) {
                showNotification('Added to Cart', 'success');
            }
          } catch (error) {
             console.error("Error adding to cart", error);

             if (showNotification && error.response) {
                // CASE 1: User is not logged in (401)
                if (error.response.status === 401) {
                    showNotification('Please Login to add items', 'error');
                } 
                // CASE 2: User is Banned (403)
                else if (error.response.status === 403) {
                    const msg = error.response.data.message || 'Your account is banned.';
                    
                    // 1. Show the Red Toast
                    showNotification(`${msg}`, 'error');

                    // 2. Wait 2 seconds, then RELOAD the page.
                    // This forces the Header to switch back to "Sign In".
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } 
                // CASE 3: Other errors
                else {
                    showNotification('Failed to add item.', 'error');
                }
             } else if (showNotification) {
                showNotification('Network error.', 'error');
             }
          }
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}