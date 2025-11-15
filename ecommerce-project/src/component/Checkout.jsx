import axios from 'axios';
import {useEffect, useState} from 'react';
import dataFetch from '../utils/dataFetch';
import React from 'react';
import PriceCents from '../utils/priceCents';
import dayjs from 'dayjs';
import { optionFirstDate, optionSecondDate, optionThirdDate } from '../utils/date';
import './Shared/General.css';
import './Checkout-css/Checkout-header.css';
import './Checkout-css/Checkout.css';


//---> main function of this components <-----//
 export function Checkout({products}){
  
    const [checkoutItem , setCheckoutItem]= useState([]);
    const [selectedOption , setSelectedOption]= useState(['free'])
    const handelOptionChange = (event)=>{
      setSelectedOption(event.target.value)
    }
    
    //-----> fetching the checkout data from the backend <------//
  useEffect(()=>{
     axios.get("http://localhost:3000/api/cart-items").then((response)=>{
    setCheckoutItem(response.data);
  })
  }, []);

  let checkoutItems = 0;

//------> function to find the radio checked date from the user <-----//
   function deliveryDate(){
    if(selectedOption === 'free'){
      let date = dayjs(optionFirstDate()).format('dddd, MMMM D');
      return(
        date
      )
    }
    else if(selectedOption === '499'){
      let date = dayjs(optionSecondDate()).format('dddd, MMMM D');
      return(
        date
      )  
    }
    else{
       let date = dayjs(optionThirdDate()).format('dddd, MMMM D');
      return(
        date
      ) 
    }
   }
  return(
    <>
        <div className="checkout-header">
      <div className="header-content">
        <div className="checkout-header-left-section">
          <a href="/">
            <img className="logo" src="images/logo.png" />
            <img className="mobile-logo" src="images/mobile-logo.png" />
          </a>
        </div>

        <div className="checkout-header-middle-section">
          Checkout (<a className="return-to-home-link"
            href="/">{`${checkoutItems} Items`}</a>)
        </div>

        <div className="checkout-header-right-section">
          <img src="images/icons/checkout-lock-icon.png" />
        </div>
      </div>
    </div>

    <div className="checkout-page">
      <div className="page-title">Review your order</div>

      <div className="checkout-grid">
        <div className="order-summary">
        {checkoutItem.map((checkoutItem)=>{
        checkoutItems = checkoutItems + checkoutItem.quantity;
        const product = dataFetch(checkoutItem, products);
        return(
           <>
          <div key={checkoutItem.id} className="cart-item-container">
            <div className="delivery-date">
              Delivery date: {deliveryDate()}
            </div>

            <div className="cart-item-details-grid">
              <img className="product-image"
                src={product?.image} />

              <div className="cart-item-details">
                <div className="product-name">
                  {product?.name}
                </div>
                <div className="product-price">
                  {PriceCents(product?.priceCents)}
                </div>
                <div className="product-quantity">
                  <span>
                    Quantity: <span className="quantity-label">{checkoutItem.quantity}</span>
                  </span>
                  <span className="update-quantity-link link-primary">
                    Update
                  </span>
                  <span className="delete-quantity-link link-primary">
                    Delete
                  </span>
                </div>
              </div>

              <div className="delivery-options">
                <div className="delivery-options-title">
                  Choose a delivery option:
                </div>
                <div className="delivery-option">
                  <input type="radio"
                    className="delivery-option-input"
                    name={checkoutItem.productId}
                    value="free"
                    checked={selectedOption === 'free'} 
                    onChange={handelOptionChange}
                    />
                   
                  <div>
                    <div className="delivery-option-date">
                      {dayjs(optionFirstDate()).format('dddd, MMMM D')}
                    </div>
                    <div className="delivery-option-price">
                      FREE Shipping
                    </div>
                  </div>
                </div>
                <div className="delivery-option">
                  <input type="radio"
                    className="delivery-option-input"
                   name={checkoutItem.productId}
                    value="499"
                    checked={selectedOption === '499'} 
                    onChange={handelOptionChange}
                    />
                  <div>
                    <div className="delivery-option-date">
                      {dayjs(optionSecondDate()).format('dddd, MMMM D')}
                    </div>
                    <div className="delivery-option-price">
                      $4.99 - Shipping
                    </div>
                  </div>
                </div>
                <div className="delivery-option">
                  <input type="radio"
                    className="delivery-option-input"
                     name={checkoutItem.productId}
                    value="999"
                    checked={selectedOption === '999'} 
                    onChange={handelOptionChange}
                    />
                  <div>
                    <div className="delivery-option-date">
                       {dayjs(optionThirdDate()).format('dddd, MMMM D')}
                    </div>
                    <div className="delivery-option-price">
                      $9.99 - Shipping
                    </div>
                  </div>
                </div>
             
              
              </div>
            </div>
          </div>
          </>
        )})}
               <div className="payment-summary">
            <div className="payment-summary-title">
              Payment Summary
            </div>

            <div className="payment-summary-row">
              <div>Items (3):</div>
              <div className="payment-summary-money">$42.75</div>
            </div>

            <div className="payment-summary-row">
              <div>Shipping &amp; handling:</div>
              <div className="payment-summary-money">$4.99</div>
            </div>

            <div className="payment-summary-row subtotal-row">
              <div>Total before tax:</div>
              <div className="payment-summary-money">$47.74</div>
            </div>

            <div className="payment-summary-row">
              <div>Estimated tax (10%):</div>
              <div className="payment-summary-money">$4.77</div>
            </div>

            <div className="payment-summary-row total-row">
              <div>Order total:</div>
              <div className="payment-summary-money">$52.51</div>
            </div>

            <button className="place-order-button button-primary">
              Place your order
            </button>
        </div>
      </div>
    </div>
          
    </div>
   </>
 )}

           