import apiClient from '../../api';
import { useState } from 'react';
import PriceCents from '../../utils/priceCents';

export function Product({ product, loadCart }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="product-container">
      <div className="product-image-container">
        <img className="product-image" src={product.image} />
      </div>

      <div className="product-name limit-text-to-2-lines">
        {product.name}
      </div>

      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          src={`images/ratings/rating-${product.rating.stars * 10}.png`}
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

      <div className="added-to-cart">
        <img src="images/icons/checkmark.png" />
        Added
      </div>

      <button
        className="add-to-cart-button button-primary"
        onClick={async () => {
          await apiClient.post('/cart-items', {
            productId: product.id,
            quantity,
          });
          await loadCart();
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}
