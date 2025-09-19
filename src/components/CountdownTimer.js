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
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

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
