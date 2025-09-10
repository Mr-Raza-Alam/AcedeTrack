// Student Dashboard

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ScheduleUpload from './components/ScheduleUpload';
import Timetable from './components/Timetable';
import Goals from './components/Goals';
import ActivityTracker from './components/ActivityTracker';
import Notifications from './components/Notifications';
import './styles/dashboard.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentData, setStudentData] = useState({
    name: 'John Doe',
    semester: '3rd Semester',
    schedule: null,
    goals: [],
    activities: [],
    timetable: null
  });

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem('studentData');
    if (savedData) {
      setStudentData(JSON.parse(savedData));
    }
  }, []);

  const updateStudentData = (newData) => {
    const updatedData = { ...studentData, ...newData };
    setStudentData(updatedData);
    localStorage.setItem('studentData', JSON.stringify(updatedData));
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard studentData={studentData} updateStudentData={updateStudentData} />;
      case 'schedule':
        return <ScheduleUpload studentData={studentData} updateStudentData={updateStudentData} />;
      case 'timetable':
        return <Timetable studentData={studentData} updateStudentData={updateStudentData} />;
      case 'goals':
        return <Goals studentData={studentData} updateStudentData={updateStudentData} />;
      case 'activity':
        return <ActivityTracker studentData={studentData} updateStudentData={updateStudentData} />;
      case 'notifications':
        return <Notifications studentData={studentData} />;
      default:
        return <Dashboard studentData={studentData} updateStudentData={updateStudentData} />;
    }
  };

  return (
    <div className="dashboard-app">
      <div className="main-content">
       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Header studentData={studentData} />
        <div className="content-area">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
}

export default App;

