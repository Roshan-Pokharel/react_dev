import apiClient from '../../api';
import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import './login.css';

function GoogleLoginButton({ onAuthChange }) {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // --- NEW: State for Error Popup ---
  const [loginError, setLoginError] = useState(null);
  
  const isLoggingIn = useRef(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('ecommerce_user');
    const storedToken = localStorage.getItem('ecommerce_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));

      apiClient.get('/auth/me')
        .then(res => {
            if(res.data.user) {
                setUser(res.data.user);
                localStorage.setItem('ecommerce_user', JSON.stringify(res.data.user));
            }
        })
        .catch(err => {
            console.log("Session verification failed:", err);
            localStorage.removeItem('ecommerce_token');
            localStorage.removeItem('ecommerce_user');
            setUser(null);
            if (onAuthChange) onAuthChange();
        });
    }
  }, [onAuthChange]);

  const sendCodeToBackend = (codeResponse) => {
    if (isLoggingIn.current) return;
    isLoggingIn.current = true;
    
    // Clear any previous errors when trying again
    setLoginError(null); 

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

        // --- NEW: DYNAMIC ERROR HANDLING ---
        if (err.response && err.response.status === 403) {
             const msg = err.response.data.message || "Account Banned";
             
             // Set the error message to state
             setLoginError(msg);

             // Automatically hide the popup after 5 seconds
             setTimeout(() => {
                setLoginError(null);
             }, 5000);
        } else {
            // Generic error
            setLoginError("Login failed. Please try again.");
            setTimeout(() => setLoginError(null), 3000);
        }
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

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout'); 
    } catch (error) {
      console.error("Logout error", error);
    }

    googleLogout();
    localStorage.removeItem('ecommerce_token');
    localStorage.removeItem('ecommerce_user');
    
    setUser(null);
    setShowLogoutConfirm(false);
    setLoginError(null); // Clear errors on logout

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

  // --- UPDATED RETURN FOR SIGNIN BUTTON ---
  return (
    <div className="login-container">
        <button 
          onClick={() => login()} 
          className="signin-button orders-link header-link"
          style={{background: 'none', border: 'none', cursor: 'pointer'}}
        >
          Signin
        </button>

        {/* Render the Error Popup if loginError exists */}
        {loginError && (
            <div className="login-error-popup">
                <div className="error-title">
                    <span className="error-icon">🚫</span> 
                    Access Denied
                </div>
                <div className="error-message">
                    {loginError}
                </div>
            </div>
        )}
    </div>
  );
}

export default GoogleLoginButton;