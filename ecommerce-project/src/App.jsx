import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {useEffect, useState} from 'react';
import axios from 'axios';
import Body from './component/Body.jsx';
import { OrdersList } from './component/OrdersList.jsx';
import Checkout from './component/Checkout.jsx';
import Tracking from './component/Tracking.jsx';
import './App.css';


export function App() {
      const [products, setProducts] = useState([]);
       useEffect(()=>{
        axios.get("http://localhost:3000/api/products").then((response)=>{
       return setProducts(response.data);
      })  
      }, []);

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Body products={products} />} />
        <Route path="orders" element={<OrdersList products={products}/>} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="tracking" element={<Tracking />} />
      </Routes>
    </Router>
   
    </>
  )
}

export default App
