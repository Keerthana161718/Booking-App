import React from 'react';
import './Footer.css';

export default function Footer(){
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="left">© {year} Bookify. All rights reserved.</div>
        <div className="links">
          <span aria-hidden>Built with ❤️</span>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  )
}
