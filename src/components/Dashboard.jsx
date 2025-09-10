
import React from 'react';

const Dashboard = ({ studentData }) => {
  const calculateActivityPercentage = () => {
    if (!studentData.activities.length) return 0;
    const completedActivities = studentData.activities.filter(activity => activity.completed);
    return Math.round((completedActivities.length / studentData.activities.length) * 100);
  };

  const getTodayClasses = () => {
    if (!studentData.timetable) return [];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return studentData.timetable.filter(item => item.day === today);
  };

  const getUpcomingGoals = () => {
    if (!studentData.goals.length) return [];
    return studentData.goals.filter(goal => !goal.completed).slice(0, 3);
  };

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card activity-percentage">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>Activity Progress</h3>
            <div className="percentage-circle">
              <span className="percentage">{calculateActivityPercentage()}%</span>
            </div>
            <p>Daily Activities Completed</p>
          </div>
        </div>

        <div className="stat-card goals-card">
          <div className="stat-icon">
            <i className="fas fa-target"></i>
          </div>
          <div className="stat-content">
            <h3>Active Goals</h3>
            <span className="stat-number">{studentData.goals.filter(g => !g.completed).length}</span>
            <p>Goals in Progress</p>
          </div>
        </div>

        <div className="stat-card classes-card">
          <div className="stat-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="stat-content">
            <h3>Today's Classes</h3>
            <span className="stat-number">{getTodayClasses().length}</span>
            <p>Scheduled Classes</p>
          </div>
        </div>

        <div className="stat-card streak-card">
          <div className="stat-icon">
            <i className="fas fa-fire"></i>
          </div>
          <div className="stat-content">
            <h3>Study Streak</h3>
            <span className="stat-number">7</span>
            <p>Days Consecutive</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section today-schedule">
          <h3>Today's Schedule</h3>
          {getTodayClasses().length > 0 ? (
            <div className="schedule-list">
              {getTodayClasses().map((classItem, index) => (
                <div key={index} className="schedule-item">
                  <div className="time">{classItem.time}</div>
                  <div className="subject">{classItem.subject}</div>
                  <div className="room">{classItem.room}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No classes scheduled for today</p>
          )}
        </div>

        <div className="section upcoming-goals">
          <h3>Upcoming Goals</h3>
          {getUpcomingGoals().length > 0 ? (
            <div className="goals-list">
              {getUpcomingGoals().map((goal, index) => (
                <div key={index} className="goal-item">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-deadline">Due: {goal.deadline}</div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <span>{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No active goals</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
