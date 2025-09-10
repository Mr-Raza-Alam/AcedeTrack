
import React, { useState, useEffect } from 'react';

const Header = ({ studentData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Welcome back, {studentData.name}!</h1>
        <p className="semester-info">{studentData.semester}</p>
      </div>
      
      <div className="header-right">
        <div className="current-time">
          <i className="fas fa-clock"></i>
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
        <div className="current-date">
          <i className="fas fa-calendar-day"></i>
          <span>{currentTime.toLocaleDateString()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
