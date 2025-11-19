import apiClient from '../../api';
import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import './login.css';

function GoogleLoginButton({ onAuthChange }) {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 
  const isLoggingIn = useRef(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('ecommerce_user');
    const storedToken = localStorage.getItem('ecommerce_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const sendCodeToBackend = (codeResponse) => {
    if (isLoggingIn.current) return;
    isLoggingIn.current = true;

    apiClient.post('/auth/google', {
        code: codeResponse.code,
      })
      .then(res => {
        const { token, user: userData } = res.data;
        localStorage.setItem('ecommerce_token', token);
        localStorage.setItem('ecommerce_user', JSON.stringify(userData));
        setUser(userData);
        if (onAuthChange) onAuthChange(); 
      })
      .catch(err => {
        console.error('Google login failed:', err);
      })
      .finally(() => {
        isLoggingIn.current = false;
      });
  };

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: sendCodeToBackend,
    onError: (error) => console.log('Login Failed:', error),
  });

  // --- FIXED LOGOUT FUNCTION ---
  const handleLogout = async () => {
    try {
      // 1. Wait for the backend to destroy the session
      await apiClient.post('/auth/logout'); 
    } catch (error) {
      console.error("Logout error", error);
    }

    // 2. Clean up frontend state
    googleLogout();
    localStorage.removeItem('ecommerce_token');
    localStorage.removeItem('ecommerce_user');
    
    setUser(null);
    setShowLogoutConfirm(false);

    // 3. NOW notify the header to refresh (Cart will be 0)
    if (onAuthChange) onAuthChange();
  };

  if (user) {
    return (
      <div className="user-profile-container" title={user.name}>
        <img 
          src={user.picture} 
          alt="profile" 
          className="user-avatar" 
          onClick={() => setShowLogoutConfirm(!showLogoutConfirm)} 
        />

        {showLogoutConfirm && (
          <div className="logout-confirm-modal">
            <p className="logout-text">Do you want to logout?</p>
            <div className="logout-actions">
              <button className="logout-btn confirm" onClick={handleLogout}>Yes</button>
              <button className="logout-btn cancel" onClick={() => setShowLogoutConfirm(false)}>No</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button 
      onClick={() => login()} 
      className="signin-button orders-link header-link"
      style={{background: 'none', border: 'none', cursor: 'pointer'}}
    >
      Signin
    </button>
  );
}

export default GoogleLoginButton;