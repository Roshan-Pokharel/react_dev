import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Body from './component/Body.jsx';
import { OrdersList } from './component/OrdersList.jsx';
import { Checkout } from './component/Checkout.jsx';
import Tracking from './component/Tracking.jsx';
import './App.css';

// NEW: Import apiClient for the auth check
import apiClient from './api'; 

export function App() {
  const [products, setProducts] = useState([]);
  // NEW STATE: User authentication status
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [cartTrigger, setCartTrigger] = useState(0); // Used to force data reloads

  // Function to reload products (as it was in original App.jsx)
  const loadProducts = async () => {
    const response = await axios.get("/api/products");
    setProducts(response.data);
  };
  
  // Function to trigger cart reload (passed to all components that add to cart)
  const triggerCartReload = () => {
      // Increment the trigger to force App.jsx to re-run the useEffect
      setCartTrigger(prev => prev + 1);
  };

  // THE MAIN EFFECT: Runs once on mount, and again whenever cartTrigger changes
  useEffect(() => {
    loadProducts(); // Initial product load
    
    // Auth Check function
    const checkAuth = async () => {
      try {
        // Check if the user is currently authenticated
        const response = await apiClient.get('/auth/me');
        setUser(response.data); // Set user data if logged in
      } catch (error) {
        setUser(null); // Set to null if not logged in
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [cartTrigger]); // Re-run auth check whenever the trigger changes (e.g., after login)

  // Calculate login status once
  const isLoggedIn = !!user;

  // Render a loading state while auth is being checked
  if (!authChecked) {
      return <div>Loading application...</div>;
  }

  return (
    <>
      <Router>
        <Routes>
          {/* PASS NEW PROPS: isLoggedIn and the cart trigger function */}
          <Route 
            path="/" 
            element={
              <Body 
                products={products} 
                loadCart={triggerCartReload} 
                isLoggedIn={isLoggedIn} // <-- New Prop
              />
            } 
          />
          <Route path="orders" element={<OrdersList products={products} loadCart={triggerCartReload} />} />
          <Route path="checkout" element={<Checkout products={products} />} />
          <Route path="tracking" element={<Tracking />} />
        </Routes>
      </Router>
    </>
  );
}

export default App