import React from 'react';

export const CloseIcon = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L18 18" stroke="#08122A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18L18 6" stroke="#08122A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const UserIcon = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="#08122A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#08122A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const CalendarIcon = ({size=16}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="#08122A" strokeWidth="1.6"/>
    <path d="M16 3V7" stroke="#08122A" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M8 3V7" stroke="#08122A" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
