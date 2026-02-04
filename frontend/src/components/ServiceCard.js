import React from 'react';
import './ServiceCard.css';

export default function ServiceCard({ title, subtitle, price, image, tags = [], onBook, children }) {
  return (
    <div className="service-card card float">
      <div className="service-media">
        {image ? <img src={image} alt={title} /> : <div className="placeholder">{title?.slice(0,1)}</div>}
      </div>

      <div className="service-body">
        <div className="service-head">
          <h4 className="service-title">{title}</h4>
          <div className="service-price">{price ? `₹${price}` : <span className="muted">Free</span>}</div>
        </div>
        <p className="service-sub muted">{subtitle}</p>

        <div className="service-tags">
          {tags.map((t,i)=> <span key={i} className="tag">{t}</span>)}
        </div>

        <div className="service-actions">
          <button className="btn primary" onClick={onBook}>Book</button>
        </div>
      </div>
    </div>
  )
}
