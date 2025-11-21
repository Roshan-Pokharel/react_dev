import React from 'react';
import { Link } from 'react-router-dom'; // Imported Link
import './footer.css';

const Footer = () => {
  const socialIcons = [
    { name: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z' },
    { name: 'Twitter', path: 'M22 4.02c-.746.33-1.556.556-2.385.672.862-.516 1.52-1.33 1.83-2.302-.8.47-1.68.81-2.61.99-1.85-1.95-4.83-1.95-6.68 0-1.39 1.46-1.5 3.63-.3 5.27-.08.01-.16.03-.25.04-3.23-.3-6.09-1.93-7.98-4.57-.42.71-.65 1.54-.65 2.45 0 1.7 0 3.3.62 4.7-.62-.12-1.25-.33-1.85-.62-.25.8-.4 1.63-.4 2.5 0 2.27 1.15 4.3 2.9 5.4-1.12.04-2.18-.3-3.1-.85 0 2.48 1.77 4.54 4.08 5-1.15.3-2.37.47-3.6.47-.2 0-.4 0-.6 0 2.3 4.2 6.7 6.8 11.5 6.8 13.8 0 21.3-11.4 21.3-21.3 0-.32 0-.64-.02-.95.82-.6 1.54-1.3 2.1-2.1' },
    { name: 'Instagram', path: 'M12 2c2.71 0 3.05.01 4.12.06 1.07.05 1.79.24 2.44.47.67.24 1.25.59 1.79 1.13.54.54.89 1.12 1.13 1.79.23.65.42 1.37.47 2.44.05 1.07.06 1.41.06 4.12s-.01 3.05-.06 4.12c-.05 1.07-.24 1.79-.47 2.44-.24.67-.59 1.25-1.13 1.79-.54.54-1.12.89-1.79 1.13-.65.23-1.37.42-2.44.47-1.07.05-1.41.06-4.12.06s-3.05-.01-4.12-.06c-1.07-.05-1.79-.24-2.44-.47-.67-.24-1.25-.59-1.79-1.13-.54-.54-.89-1.12-1.13-1.79-.23-.65-.42-1.37-.47-2.44-.05-1.07-.06-1.41-.06-4.12s.01-3.05.06-4.12c.05-1.07.24-1.79.47-2.44.24-.67.59-1.25 1.13-1.79.54-.54 1.12-.89 1.79-1.13.65-.23 1.37-.42 2.44-.47C8.95 2.01 9.29 2 12 2zm0 1.9c-2.67 0-3.01.01-4.06.05-1.05.04-1.63.22-2.07.38-.47.16-.85.39-1.18.72-.33.33-.56.71-.72 1.18-.16.44-.34 1.02-.38 2.07-.04 1.05-.05 1.39-.05 4.06s.01 3.01.05 4.06c.04 1.05.22 1.63.38 2.07.16.47.39.85.72 1.18.33.33.71.56 1.18.72.44.16 1.02.34 2.07.38 1.05.04 1.39.05 4.06.05s3.01-.01 4.06-.05c1.05-.04 1.63-.22 2.07-.38.47-.16.85-.39 1.18-.72.33-.33.56-.71.72-1.18.16-.44.34-1.02.38-2.07.04-1.05.05-1.39.05-4.06s-.01-3.01-.05-4.06c-.04-1.05-.22-1.63-.38-2.07-.16-.47-.39-.85-.72-1.18-.33-.33-.71-.56-1.18-.72-.44-.16-1.02-.34-2.07-.38-1.05-.04-1.39-.05-4.06-.05zM12 7a5 5 0 100 10 5 5 0 000-10zm0 1.9a3.1 3.1 0 110 6.2 3.1 3.1 0 010-6.2zm4.18-1.2c-.52 0-.95.43-.95.95s.43.95.95.95.95-.43.95-.95-.43-.95-.95-.95z' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        <div className="footer-section company-info">
          <h3 className="footer-logo">Durga Grocery Store</h3>
          <p className="company-tagline">Your trusted source for quality goods.</p>
          <div className="social-links">
            {socialIcons.map(icon => (
              <a 
                key={icon.name} 
                href={`#${icon.name.toLowerCase()}`} 
                aria-label={icon.name}
                className="social-icon"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d={icon.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul>
            {/* Changed Internal Pages to Link */}
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/checkout" className="footer-link">Cart</Link></li>
            <li><Link to="/orders" className="footer-link">Orders</Link></li>
            <li><a href="#contact" className="footer-link">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section links-col">
          <h4 className="footer-heading">Customer Service</h4>
          <ul>
            <li><a href="#faq" className="footer-link">FAQ</a></li>
            <li><a href="#shipping" className="footer-link">Shipping Policy</a></li>
            <li><a href="#returns" className="footer-link">Returns</a></li>
            <li><a href="#support" className="footer-link">Support Center</a></li>
          </ul>
        </div>
        
        <div className="footer-section contact-info-col">
          <h4 className="footer-heading">Contact Us</h4>
          <p>Bardaghat, Nepal 44600</p>
          <p>Email: <a href="mailto:grocerydurga@gmail.com" className="footer-link">grocerydurga@gmail.com</a></p>
          <p>Phone: <a href="tel:+1234567890" className="footer-link">+977 9746385400</a></p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Durga Grocery Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;