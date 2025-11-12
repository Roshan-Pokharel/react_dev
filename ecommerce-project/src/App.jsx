import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Body from './component/Body.jsx';
import { OrdersList } from './component/OrdersList.jsx';
import Checkout from './component/Checkout.jsx';
import Tracking from './component/Tracking.jsx';
import './App.css';


export function App() {

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Body />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="tracking" element={<Tracking />} />
      </Routes>
    </Router>
   
    </>
  )
}

export default App
