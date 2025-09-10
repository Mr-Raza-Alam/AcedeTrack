
import React, { useState } from 'react';

const ActivityTracker = ({ studentData, updateStudentData }) => {
  const [newActivity, setNewActivity] = useState({
    name: '',
    duration: '',
    type: 'study'
  });

  const addActivity = () => {
    if (newActivity.name && newActivity.duration) {
      const activity = {
        id: Date.now(),
        ...newActivity,
        date: new Date().toISOString().split('T')[0],
        completed: false
      };

      updateStudentData({
        activities: [...studentData.activities, activity]
      });

      setNewActivity({
        name: '',
        duration: '',
        type: 'study'
      });
    }
  };

  const toggleActivity = (activityId) => {
    const updatedActivities = studentData.activities.map(activity =>
      activity.id === activityId
        ? { ...activity, completed: !activity.completed }
        : activity
    );
    updateStudentData({ activities: updatedActivities });
  };

  const deleteActivity = (activityId) => {
    const updatedActivities = studentData.activities.filter(
      activity => activity.id !== activityId
    );
    updateStudentData({ activities: updatedActivities });
  };

  const getTodayActivities = () => {
    const today = new Date().toISOString().split('T')[0];
    return studentData.activities.filter(activity => activity.date === today);
  };

  const getActivityStats = () => {
    const todayActivities = getTodayActivities();
    const completed = todayActivities.filter(a => a.completed).length;
    const total = todayActivities.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const stats = getActivityStats();

  return (
    <div className="activity-tracker">
      <div className="tracker-header">
        <h2>Daily Activity Tracker</h2>
        <div className="activity-stats">
          <div className="stat-circle">
            <div className="percentage">{stats.percentage}%</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-details">
            <div className="completed">{stats.completed} Completed</div>
            <div className="total">{stats.total} Total Activities</div>
          </div>
        </div>
      </div>

      <div className="add-activity-section">
        <h3>Add New Activity</h3>
        <div className="activity-form">
          <input
            type="text"
            placeholder="Activity Name"
            value={newActivity.name}
            onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Duration (e.g., 2 hours)"
            value={newActivity.duration}
            onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
          />
          <select
            value={newActivity.type}
            onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
          >
            <option value="study">Study</option>
            <option value="assignment">Assignment</option>
            <option value="reading">Reading</option>
            <option value="project">Project Work</option>
            <option value="revision">Revision</option>
            <option value="practice">Practice</option>
          </select>
          <button className="add-activity-btn" onClick={addActivity}>
            <i className="fas fa-plus"></i>
            Add Activity
          </button>
        </div>
      </div>

      <div className="activities-list">
        <h3>Today's Activities</h3>
        {getTodayActivities().length > 0 ? (
          <div className="activities">
            {getTodayActivities().map(activity => (
              <div 
                key={activity.id} 
                className={`activity-item ${activity.completed ? 'completed' : ''}`}
              >
                <div className="activity-checkbox">
                  <input
                    type="checkbox"
                    checked={activity.completed}
                    onChange={() => toggleActivity(activity.id)}
                  />
                </div>
                <div className="activity-details">
                  <div className="activity-name">{activity.name}</div>
                  <div className="activity-meta">
                    <span className="duration">
                      <i className="fas fa-clock"></i>
                      {activity.duration}
                    </span>
                    <span className="type">
                      <i className="fas fa-tag"></i>
                      {activity.type}
                    </span>
                  </div>
                </div>
                <button 
                  className="delete-activity"
                  onClick={() => deleteActivity(activity.id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-activities">
            <i className="fas fa-clipboard-list"></i>
            <p>No activities for today. Add your first activity!</p>
          </div>
        )}
      </div>

      <div className="activity-chart">
        <h3>Weekly Progress</h3>
        <div className="chart-placeholder">
          <p>Activity progress chart will be displayed here</p>
          {/* In a real app, you'd implement a chart library like Chart.js */}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
