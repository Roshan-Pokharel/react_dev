import PriceCents from '../utils/priceCents'
import {Header} from '../component/Shared/Header.jsx'
import axios from 'axios';  
import {useState} from 'react';
import './Shared/General.css';
import './Shared/Header.css';
import './Home.css';

// function selectQuantity(){
//   (event)=>{
//               const quantitySelected = Number(event.target.value);
//               setQuantity(quantitySelected)
//               console.log(quantitySelected);
//             }}
//}

 function Body({products, loadCart}){

 const [quantity , setQuantity] = useState(1);
  

   //const [products, setProducts] = useState([]);

      // useEffect(()=>{
      //   fetch("http://localhost:3000/api/products").then((response)=>{
      //   return response.json().then((data)=>{
      //   console.log(data);
      // })
      // });
      // }, []);

      
      // useEffect(()=>{
      //   axios.get("http://localhost:3000/api/products").then((response)=>{
      //  return setProducts(response.data);
      // })  
      // }, []);

  

  return(
    <>
      {<Header products={products} loadCart={loadCart}/>}

    <div className="home-page">
      <div className="products-grid">

        {products.map((product) => {
         
         return(
          <div key={product.id} className="product-container">
          <div className="product-image-container">
            <img className="product-image"
              src={product.image} />
          </div>

          <div className="product-name limit-text-to-2-lines">
            {product.name}
          </div>

          <div className="product-rating-container">
            <img className="product-rating-stars"
              src={`images/ratings/rating-${(product.rating.stars)*10}.png`}/>
            <div className="product-rating-count link-primary">
              {product.rating.count}
            </div>
          </div>

          <div className="product-price">
           {PriceCents(product.priceCents)}
          </div>

          <div className="product-quantity-container"
          >
            <select value={quantity} onChange={(event)=>{
              const quantitySelected = Number(event.target.value);
              setQuantity(quantitySelected)
              console.log(quantitySelected);
            }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          <div className="product-spacer"></div>

          <div className="added-to-cart">
            <img src="images/icons/checkmark.png" />
            Added
          </div>

          <button className="add-to-cart-button button-primary" 
          onClick={async()=>{
           await axios.post('http://localhost:3000/api/cart-items', {
              productId: product.id,
              quantity:1
            });
            await loadCart();
          }}>
            Add to Cart
          </button>
        </div>
 )})}
        
    
      </div>
    </div>
    </>
  )
}
export default Body;

