
import React, { useState, useEffect } from 'react';
import { generateAITimetable } from '../Utils/aiTimeTableGene';
import '../styles/Timetable.css'

const Timetable = ({ studentData, updateStudentData }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [editMode, setEditMode] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alarms, setAlarms] = useState({});

  const [newActivity, setNewActivity] = useState({
    subject: '',
    type: 'class',
    time: '',
    duration: '60',
    room: '',
    professor: '',
    description: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00'
  ];

  useEffect(() => {
    // Load saved alarms from localStorage
    const savedAlarms = localStorage.getItem('timetableAlarms');
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch (error) {
        console.error('Error loading alarms:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save alarms to localStorage whenever they change
    localStorage.setItem('timetableAlarms', JSON.stringify(alarms));
  }, [alarms]);

  const getTodayTimetable = () => {
    if (!studentData.timetable) return [];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return studentData.timetable.filter(item => item.day === today);
  };

  const getDayTimetable = (day) => {
    if (!studentData.timetable) return [];
    return studentData.timetable
      .filter(item => item.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const regenerateTimetable = () => {
    if (studentData.schedule) {
      const newTimetable = generateAITimetable(studentData.schedule);
      updateStudentData({ timetable: newTimetable });
      alert('Timetable regenerated successfully!');
    } else {
      alert('Please upload your schedule first to generate a timetable.');
    }
  };

  const addCustomActivity = () => {
    if (!newActivity.subject || !newActivity.time) return;

    const activity = {
      id: Date.now(),
      day: selectedDay,
      subject: newActivity.subject,
      type: newActivity.type,
      time: newActivity.time,
      duration: `${newActivity.duration} minutes`,
      room: newActivity.room || 'TBA',
      professor: newActivity.professor || '',
      description: newActivity.description || '',
      custom: true
    };

    const updatedTimetable = [...(studentData.timetable || []), activity];
    updateStudentData({ timetable: updatedTimetable });

    setNewActivity({
      subject: '',
      type: 'class',
      time: '',
      duration: '60',
      room: '',
      professor: '',
      description: ''
    });
    setShowAddModal(false);
  };

  const deleteActivity = (activityId) => {
    const updatedTimetable = studentData.timetable.filter(item => item.id !== activityId);
    updateStudentData({ timetable: updatedTimetable });
  };

  const toggleAlarm = (activityId, isEnabled) => {
    setAlarms(prev => ({
      ...prev,
      [activityId]: {
        enabled: isEnabled,
        reminderMinutes: prev[activityId]?.reminderMinutes || 15
      }
    }));

    if (isEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const updateAlarmSettings = (activityId, reminderMinutes) => {
    setAlarms(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        reminderMinutes: parseInt(reminderMinutes)
      }
    }));
  };

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'class': return 'fas fa-chalkboard-teacher';
      case 'study': return 'fas fa-book';
      case 'break': return 'fas fa-coffee';
      case 'assignment': return 'fas fa-file-alt';
      case 'exam': return 'fas fa-clipboard-check';
      case 'lab': return 'fas fa-flask';
      default: return 'fas fa-calendar';
    }
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'class': return '#3b82f6';
      case 'study': return '#10b981';
      case 'break': return '#f59e0b';
      case 'assignment': return '#ef4444';
      case 'exam': return '#8b5cf6';
      case 'lab': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;
    
    // Calculate position as percentage of the day (8 AM to 10 PM = 14 hours)
    if (currentTime >= 8 && currentTime <= 22) {
      return ((currentTime - 8) / 14) * 100;
    }
    return null;
  };

  const isCurrentTime = (timeSlot) => {
    const now = new Date();
    const [hours] = timeSlot.split(':');
    return now.getHours() === parseInt(hours);
  };

  const isToday = (day) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return day === today;
  };

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <div className="header-left">
          <h2>AI Generated Timetable</h2>
          <p>Your personalized study schedule with intelligent time allocation</p>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              <i className="fas fa-calendar-week"></i>
              Week View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              <i className="fas fa-calendar-day"></i>
              Day View
            </button>
          </div>
          
          <button 
            className="regenerate-btn"
            onClick={regenerateTimetable}
          >
            <i className="fas fa-sync"></i>
            Regenerate
          </button>
          
          <button 
            className="add-activity-btn"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus"></i>
            Add Activity
          </button>
        </div>
      </div>

      {!studentData.timetable || studentData.timetable.length === 0 ? (
        <div className="no-timetable">
          <i className="fas fa-calendar-times"></i>
          <h3>No Timetable Generated</h3>
          <p>Upload your class schedule first, then generate your AI timetable</p>
          <button 
            className="generate-first-btn"
            onClick={regenerateTimetable}
          >
            Generate My First Timetable
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'week' ? (
            <div className="week-view">
              <div className="week-grid">
                <div className="time-column">
                  <div className="time-header">Time</div>
                  {timeSlots.map(time => (
                    <div 
                      key={time} 
                      className={`time-slot ${isCurrentTime(time) ? 'current-time' : ''}`}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                
                {daysOfWeek.map(day => (
                  <div key={day} className="day-column">
                    <div className={`day-header ${isToday(day) ? 'today' : ''}`}>
                      <span className="day-name">{day}</span>
                      <span className="day-date">
                        {new Date().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="day-schedule">
                      {timeSlots.map(timeSlot => {
                        const activity = getDayTimetable(day).find(item => item.time === timeSlot);
                        return (
                          <div 
                            key={timeSlot} 
                            className={`schedule-slot ${activity ? 'has-activity' : ''} ${isCurrentTime(timeSlot) && isToday(day) ? 'current' : ''}`}
                          >
                            {activity && (
                              <div 
                                className="activity-card"
                                style={{ borderLeft: `4px solid ${getActivityTypeColor(activity.type)}` }}
                              >
                                <div className="activity-header">
                                  <i className={getActivityTypeIcon(activity.type)}></i>
                                  <span className="activity-title">{activity.subject}</span>
                                  {activity.custom && (
                                    <button 
                                      className="delete-activity"
                                      onClick={() => deleteActivity(activity.id)}
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  )}
                                </div>
                                
                                <div className="activity-details">
                                  <span className="activity-duration">{activity.duration}</span>
                                  {activity.room && (
                                    <span className="activity-room">📍 {activity.room}</span>
                                  )}
                                  {activity.professor && (
                                    <span className="activity-professor">👨‍🏫 {activity.professor}</span>
                                  )}
                                </div>
                                
                                <div className="activity-actions">
                                  <label className="alarm-toggle">
                                    <input
                                      type="checkbox"
                                      checked={alarms[activity.id]?.enabled || false}
                                      onChange={(e) => toggleAlarm(activity.id, e.target.checked)}
                                    />
                                    <span className="alarm-icon">
                                      <i className="fas fa-bell"></i>
                                    </span>
                                  </label>
                                  
                                  {alarms[activity.id]?.enabled && (
                                    <select
                                      value={alarms[activity.id]?.reminderMinutes || 15}
                                      onChange={(e) => updateAlarmSettings(activity.id, e.target.value)}
                                      className="reminder-select"
                                    >
                                      <option value={5}>5 min</option>
                                      <option value={10}>10 min</option>
                                      <option value={15}>15 min</option>
                                      <option value={30}>30 min</option>
                                    </select>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="day-view">
              <div className="day-selector">
                <h3>Select Day:</h3>
                <div className="day-buttons">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      className={`day-btn ${selectedDay === day ? 'active' : ''} ${isToday(day) ? 'today' : ''}`}
                      onClick={() => setSelectedDay(day)}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="selected-day-schedule">
                <h3>{selectedDay} Schedule</h3>
                <div className="day-activities">
                  {getDayTimetable(selectedDay).length > 0 ? (
                    getDayTimetable(selectedDay).map((activity, index) => (
                      <div 
                        key={activity.id || index}
                        className="day-activity-card"
                        style={{ borderLeft: `5px solid ${getActivityTypeColor(activity.type)}` }}
                      >
                        <div className="activity-time">
                          <span className="time">{activity.time}</span>
                          <span className="duration">{activity.duration}</span>
                        </div>
                        
                        <div className="activity-info">
                          <div className="activity-title-row">
                            <i className={getActivityTypeIcon(activity.type)}></i>
                            <h4>{activity.subject}</h4>
                            <span className="activity-type-badge" style={{ background: getActivityTypeColor(activity.type) }}>
                              {activity.type}
                            </span>
                          </div>
                          
                          <div className="activity-meta">
                            {activity.room && <span>📍 {activity.room}</span>}
                            {activity.professor && <span>👨‍🏫 {activity.professor}</span>}
                          </div>
                          
                          {activity.description && (
                            <p className="activity-description">{activity.description}</p>
                          )}
                        </div>
                        
                        <div className="activity-controls">
                          <label className="alarm-control">
                            <input
                              type="checkbox"
                              checked={alarms[activity.id]?.enabled || false}
                              onChange={(e) => toggleAlarm(activity.id, e.target.checked)}
                            />
                            <i className="fas fa-bell"></i>
                          </label>
                          
                          {activity.custom && (
                            <button 
                              className="delete-btn"
                              onClick={() => deleteActivity(activity.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activities">
                      <i className="fas fa-calendar-plus"></i>
                      <p>No activities scheduled for {selectedDay}</p>
                      <button 
                        className="add-activity-btn"
                        onClick={() => setShowAddModal(true)}
                      >
                        Add Activity
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="timetable-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h4>Total Activities</h4>
                  <span>{studentData.timetable?.length || 0}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-info">
                  <h4>Today's Classes</h4>
                  <span>{getTodayTimetable().filter(item => item.type === 'class').length}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-bell"></i>
                </div>
                <div className="stat-info">
                  <h4>Active Alarms</h4>
                  <span>{Object.values(alarms).filter(alarm => alarm.enabled).length}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="stat-info">
                  <h4>Study Hours/Week</h4>
                  <span>
                    {Math.round(
                      (studentData.timetable?.filter(item => item.type === 'study').length || 0) * 1.5
                    )}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Custom Activity</h3>
              <button 
                className="close-modal"
                onClick={() => setShowAddModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Activity Name</label>
                  <input
                    type="text"
                    value={newActivity.subject}
                    onChange={(e) => setNewActivity({...newActivity, subject: e.target.value})}
                    placeholder="e.g., Mathematics, Study Session"
                  />
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  >
                    <option value="class">Class</option>
                    <option value="study">Study Session</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="lab">Lab</option>
                    <option value="break">Break</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                    min="15"
                    max="180"
                  />
                </div>
                
                <div className="form-group">
                  <label>Room/Location</label>
                  <input
                    type="text"
                    value={newActivity.room}
                    onChange={(e) => setNewActivity({...newActivity, room: e.target.value})}
                    placeholder="e.g., Room 101, Library"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Professor/Instructor</label>
                  <input
                    type="text"
                    value={newActivity.professor}
                    onChange={(e) => setNewActivity({...newActivity, professor: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                    placeholder="Additional details about this activity"
                    rows="3"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={addCustomActivity}
                disabled={!newActivity.subject || !newActivity.time}
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
