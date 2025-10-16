import React, { useState, useEffect } from 'react';

const TimerChipIcon = () => (
  <svg
    aria-hidden="true"
    className="meta-icon"
    viewBox="0 0 16 16"
    focusable="false"
  >
    <circle
      cx="8"
      cy="8"
      r="5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M8 4.5V8l2.25 1.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CountdownTimer = ({ expiryDate, variant = 'card' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  // If no expiry date is provided, don't render anything
  if (!expiryDate) {
    return null;
  }

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Get current time
      const now = new Date();

      // Parse expiry date - API sends UTC time
      let expiryTime;
      try {
        // Ensure the date is treated as UTC
        let utcDateString = expiryDate;
        
        // If date has 'T' but no 'Z' and no timezone offset, add 'Z' to treat as UTC
        if (expiryDate.includes('T') && !expiryDate.includes('Z') && !expiryDate.includes('+') && !expiryDate.includes('-', 10)) {
          utcDateString = expiryDate + 'Z';
        }
        
        const expiryDateObj = new Date(utcDateString);
        
        // Validate the parsed date
        if (isNaN(expiryDateObj.getTime())) {
          throw new Error('Invalid date');
        }
        
        expiryTime = expiryDateObj.getTime();
      } catch (error) {
        console.error('Invalid expiry date format:', expiryDate, error);
        setIsExpired(true);
        return;
      }

      // Calculate difference
      const currentLocalTime = now.getTime();
      const difference = expiryTime - currentLocalTime;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          total: difference
        });
        setIsExpired(false);
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        });
        setIsExpired(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  const formatTime = (value) => {
    return value.toString().padStart(2, '0');
  };

  const getDisplayTime = () => {
    if (isExpired) {
      return 'EXPIRED';
    }

    // Show different formats based on time remaining
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;
    } else {
      return `${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;
    }
  };

  if (variant === 'chip') {
    return (
      <span className="meta-chip timer-chip" role="listitem" aria-label="Expires In">
        <TimerChipIcon />
        <span className={`timer-compact ${isExpired ? 'expired' : ''}`}>
          {getDisplayTime()}
        </span>
      </span>
    );
  }

  return (
    <div className="countdown-timer-card">
      <h3>Expires In</h3>
      <div className={`timer-display ${isExpired ? 'expired' : ''}`}>
        {getDisplayTime()}
      </div>
    </div>
  );
};

export default CountdownTimer;
