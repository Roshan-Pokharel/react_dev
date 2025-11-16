import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {useEffect, useState} from 'react';
import axios from 'axios';
import Body from './component/Body.jsx';
import { OrdersList } from './component/OrdersList.jsx';
import {Checkout}  from './component/Checkout.jsx';
import Tracking from './component/Tracking.jsx';
import './App.css';




export function App() {
      const [products, setProducts] = useState([]);
      
      const loadCart = async()=>{
        const response = await axios.get("/api/products");
        setProducts(response.data);
      };

       useEffect(()=>{
        loadCart(); 
      }, []);

    


  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Body products={products} loadCart = {loadCart}/>} />
        <Route path="orders" element={<OrdersList products={products} loadCart = {loadCart}/>} />
        <Route path="checkout" element={<Checkout products={products} />} />
        <Route path="tracking" element={<Tracking />} />
      </Routes>
    </Router>
   
    </>
  )
}

export default App
