import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Body from './component/Body.jsx';
import { OrdersList } from './component/OrdersList.jsx';
import { Checkout } from './component/Checkout.jsx';
import Tracking from './component/Tracking.jsx';
import Footer from './component/footer'; // Imported Footer here
import './App.css';

import apiClient from './api';

export function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [cartTrigger, setCartTrigger] = useState(0); 

  const loadProducts = async () => {
    const response = await axios.get("/api/products");
    setProducts(response.data);
  };
  
  const triggerCartReload = () => {
      setCartTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadProducts(); 
    
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data); 
      } catch (error) {
        setUser(null);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [cartTrigger]);

  const isLoggedIn = !!user;

  if (!authChecked) {
      return <div>Loading application...</div>;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <Body 
                products={products} 
                loadCart={triggerCartReload} 
                isLoggedIn={isLoggedIn} 
              />
            } 
          />
          <Route path="orders" element={<OrdersList products={products} loadCart={triggerCartReload} />} />
          <Route path="checkout" element={<Checkout products={products} />} />
          <Route path="tracking" element={<Tracking />} />
        </Routes>
        
        {/* Footer moved here so it is inside the Router context */}
        <Footer />
      </Router>
    </>
  );
}

export default App