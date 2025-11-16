import {Header} from '../component/Shared/Header.jsx'
import {Product} from './home/product.jsx'
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


  

   //const [products, setProducts] = useState([]);

      // useEffect(()=>{
      //   fetch("/api/products").then((response)=>{
      //   return response.json().then((data)=>{
      //   console.log(data);
      // })
      // });
      // }, []);

      
      // useEffect(()=>{
      //   axios.get("/api/products").then((response)=>{
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
         <Product key={product.id} product ={product} loadCart={loadCart} />
 )})}
        
    
      </div>
    </div>
    </>
  )
}
export default Body;

