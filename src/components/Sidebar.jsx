// sideBar
import React, { useState } from 'react';
const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'schedule', icon: 'fas fa-upload', label: 'Upload Schedule' },
    { id: 'timetable', icon: 'fas fa-calendar', label: 'AI Timetable' },
    { id: 'goals', icon: 'fas fa-bullseye', label: 'Goals & Targets' },
    { id: 'activity', icon: 'fas fa-chart-pie', label: 'Activity Tracker' },
    { id: 'notifications', icon: 'fas fa-bell', label: 'Notifications' }
  ];

  return (
    <>
      {/* Hamburger Menu (visible when sidebar is closed) */}
{!isOpen && (
  <button 
    className="menu-btn"
    onClick={() => setIsOpen(true)}
  >
    <i className="fas fa-bars"></i>
  </button>
)}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i> 
            <span>AcadeTrack</span>
          </div>

          {/* Close button */}
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
         <hr />
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
