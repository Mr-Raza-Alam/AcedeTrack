
import React, { useState, useEffect } from 'react';

const Notifications = ({ studentData }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    classReminders: true,
    goalDeadlines: true,
    dailyProgress: true,
    weeklyReports: true,
    soundAlerts: true,
    emailNotifications: false
  });

  useEffect(() => {
    generateNotifications();
    // Set up automatic notification checks
    const interval = setInterval(generateNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [studentData]);

  const generateNotifications = () => {
    const newNotifications = [];
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);

    // Class reminders
    if (studentData.timetable && notificationSettings.classReminders) {
      const todayClasses = studentData.timetable.filter(item => 
        item.day === today && item.type === 'class'
      );

      todayClasses.forEach(classItem => {
        const classTime = new Date(`${now.toDateString()} ${classItem.time}`);
        const reminderTime = new Date(classTime.getTime() - 15 * 60000); // 15 minutes before
        const timeDiff = reminderTime.getTime() - now.getTime();

        if (timeDiff > 0 && timeDiff <= 60000) { // Within next minute
          newNotifications.push({
            id: `class-${classItem.subject}-${Date.now()}`,
            type: 'class',
            title: 'Class Reminder',
            message: `${classItem.subject} starts in 15 minutes`,
            time: now.toLocaleTimeString(),
            priority: 'high',
            icon: 'fas fa-chalkboard-teacher',
            color: '#3b82f6'
          });
        }
      });
    }

    // Goal deadline reminders
    if (studentData.goals && notificationSettings.goalDeadlines) {
      studentData.goals.forEach(goal => {
        if (!goal.completed) {
          const deadline = new Date(goal.deadline);
          const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

          if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
            newNotifications.push({
              id: `goal-${goal.id}-${Date.now()}`,
              type: 'goal',
              title: 'Goal Deadline Approaching',
              message: `"${goal.title}" is due in ${daysUntilDeadline} day(s)`,
              time: now.toLocaleTimeString(),
              priority: daysUntilDeadline === 1 ? 'high' : 'medium',
              icon: 'fas fa-bullseye',
              color: '#f59e0b'
            });
          }
        }
      });
    }

    // Daily progress reminders
    if (notificationSettings.dailyProgress) {
      const todayActivities = studentData.activities?.filter(activity => 
        activity.date === now.toISOString().split('T')[0]
      ) || [];

      if (todayActivities.length > 0) {
        const completedToday = todayActivities.filter(a => a.completed).length;
        const progressPercentage = Math.round((completedToday / todayActivities.length) * 100);

        if (now.getHours() === 20 && now.getMinutes() === 0) { // 8 PM reminder
          newNotifications.push({
            id: `progress-${Date.now()}`,
            type: 'progress',
            title: 'Daily Progress Update',
            message: `You've completed ${progressPercentage}% of today's activities`,
            time: now.toLocaleTimeString(),
            priority: 'medium',
            icon: 'fas fa-chart-line',
            color: '#10b981'
          });
        }
      }
    }

    // Study break reminders
    if (now.getMinutes() === 0 && (now.getHours() % 2 === 0)) { // Every 2 hours
      newNotifications.push({
        id: `break-${Date.now()}`,
        type: 'break',
        title: 'Study Break Reminder',
        message: 'Take a 10-minute break to refresh your mind!',
        time: now.toLocaleTimeString(),
        priority: 'low',
        icon: 'fas fa-coffee',
        color: '#8b5cf6'
      });
    }

    // Update notifications state
    setNotifications(prev => {
      const combined = [...prev, ...newNotifications];
      // Keep only last 20 notifications
      return combined.slice(-20).sort((a, b) => new Date(b.time) - new Date(a.time));
    });

    // Trigger browser notifications if enabled
    if ('Notification' in window && Notification.permission === 'granted' && notificationSettings.soundAlerts) {
      newNotifications.forEach(notification => {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.type
        });
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...notificationSettings,
      [setting]: value
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-left">
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="clear-all-btn"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            <i className="fas fa-trash"></i>
            Clear All
          </button>
          <button 
            className="permission-btn"
            onClick={requestNotificationPermission}
          >
            <i className="fas fa-bell"></i>
            Enable Notifications
          </button>
        </div>
      </div>

      <div className="notifications-content">
        <div className="notifications-list">
          <h3>Recent Notifications</h3>
          {notifications.length > 0 ? (
            <div className="notifications">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon" style={{ color: notification.color }}>
                    <i className={notification.icon}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <div className="notification-meta">
                        <span 
                          className="priority-indicator"
                          style={{ backgroundColor: getPriorityColor(notification.priority) }}
                        ></span>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                    <p>{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-notifications">
              <i className="fas fa-bell-slash"></i>
              <h4>No Notifications</h4>
              <p>You're all caught up! New notifications will appear here.</p>
            </div>
          )}
        </div>

        <div className="notification-settings">
          <h3>Notification Settings</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Class Reminders</h4>
                <p>Get notified 15 minutes before classes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.classReminders}
                  onChange={(e) => updateSettings('classReminders', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Goal Deadlines</h4>
                <p>Reminders for approaching goal deadlines</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.goalDeadlines}
                  onChange={(e) => updateSettings('goalDeadlines', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Daily Progress</h4>
                <p>Evening summary of daily activities</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.dailyProgress}
                  onChange={(e) => updateSettings('dailyProgress', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Weekly Reports</h4>
                <p>Weekly progress and analytics reports</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) => updateSettings('weeklyReports', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Sound Alerts</h4>
                <p>Play sound for important notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.soundAlerts}
                  onChange={(e) => updateSettings('soundAlerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => updateSettings('emailNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
