import React from 'react';
import './Loader.css';

export default function Loader({ size = 48 }) {
  return (
    <div className="loader" style={{ width: size, height: size }} aria-hidden>
      <svg className="spinner" viewBox="0 0 50 50">
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
      </svg>
    </div>
  );
}
