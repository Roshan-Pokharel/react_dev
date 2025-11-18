import apiClient from '../../api';
import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google'; // Import googleLogout

import './login.css';
import './header.css';

function GoogleLoginButton() {
  // 1. Create state to hold the user info
  const [user, setUser] = useState(null);
  const isLoggingIn = useRef(false);

  // 2. On Page Load: Check if user is already logged in
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

        // 3. Save Token AND User Data to LocalStorage
        localStorage.setItem('ecommerce_token', token);
        localStorage.setItem('ecommerce_user', JSON.stringify(userData));

        // 4. Update State (this changes the UI immediately)
        setUser(userData);
        console.log('Login Success:', userData);
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

  // 5. Handle Logout (Optional: Clicking the profile picture logs you out)
  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('ecommerce_token');
    localStorage.removeItem('ecommerce_user');
    setUser(null); // Switches back to the "Signin" button
  };

  // 6. Conditional Rendering
  if (user) {
    // If logged in, show Profile Picture
    return (
      <div className="user-profile-container" title={user.name}>
        <img 
          src={user.picture} 
          alt="profile" 
          className="user-avatar" 
          onClick={handleLogout} 
        />
      </div>
    );
  }

  // If NOT logged in, show Signin Button
  return (
    <button 
      onClick={() => login()} 
      className="signin-button orders-link header-link"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
    >
      Signin
    </button>
  );
}

export default GoogleLoginButton;