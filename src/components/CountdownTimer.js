import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiryDate }) => {
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
      // Get current time in UTC
      const now = new Date();
      const nowUTC = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
      );

      // Parse expiry date - assumes it's in ISO format or UTC
      let expiryTime;
      try {
        const expiryDateObj = new Date(expiryDate);
        
        // Check if the date string includes timezone info
        if (expiryDate.includes('Z') || expiryDate.includes('+') || expiryDate.includes('T')) {
          // Date string has timezone info, use it directly
          expiryTime = expiryDateObj.getTime();
        } else {
          // Date string doesn't have timezone info, treat as UTC
          expiryTime = Date.UTC(
            expiryDateObj.getUTCFullYear(),
            expiryDateObj.getUTCMonth(),
            expiryDateObj.getUTCDate(),
            expiryDateObj.getUTCHours(),
            expiryDateObj.getUTCMinutes(),
            expiryDateObj.getUTCSeconds(),
            expiryDateObj.getUTCMilliseconds()
          );
        }
      } catch (error) {
        console.error('Invalid expiry date format:', expiryDate, error);
        setIsExpired(true);
        return;
      }

      // Calculate difference using current local time vs expiry time
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

  if (isExpired) {
    return (
      <span className="countdown-timer expired">
        EXPIRED
      </span>
    );
  }

  // Show different formats based on time remaining
  if (timeLeft.days > 0) {
    return (
      <span className="countdown-timer">
        Expires in {timeLeft.days}d {formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m
      </span>
    );
  } else if (timeLeft.hours > 0) {
    return (
      <span className="countdown-timer">
        Expires in {formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s
      </span>
    );
  } else if (timeLeft.minutes > 0) {
    return (
      <span className="countdown-timer">
        Expires in {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s
      </span>
    );
  } else {
    return (
      <span className="countdown-timer">
        Expires in {formatTime(timeLeft.seconds)}s
      </span>
    );
  }
};

export default CountdownTimer;
