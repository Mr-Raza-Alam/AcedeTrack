
import { useState, useEffect, useCallback } from 'react';

export const useNotifications = (studentData) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    classReminders: true,
    goalDeadlines: true,
    dailyProgress: true,
    weeklyReports: true,
    soundAlerts: true,
    emailNotifications: false,
    reminderMinutes: 15 // Minutes before class to notify
  });
  const [permission, setPermission] = useState('default');

  // Initialize notification settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setNotificationSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing notification settings:', error);
      }
    }

    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title, options = {}) => {
    if (permission === 'granted' && notificationSettings.soundAlerts) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    }
    return null;
  }, [permission, notificationSettings.soundAlerts]);

  // Add notification to the list
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
    return newNotification;
  }, []);

  // Generate class reminders
  const generateClassReminders = useCallback(() => {
    if (!studentData.timetable || !notificationSettings.classReminders) return [];

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todayClasses = studentData.timetable.filter(item => 
      item.day === today && item.type === 'class'
    );

    const reminders = [];

    todayClasses.forEach(classItem => {
      const [hours, minutes] = classItem.time.split(':');
      const classTime = new Date();
      classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const reminderTime = new Date(classTime.getTime() - (notificationSettings.reminderMinutes * 60000));
      const timeDiff = reminderTime.getTime() - now.getTime();

      // If reminder time is within the next minute
      if (timeDiff > 0 && timeDiff <= 60000) {
        const notification = {
          type: 'class',
          priority: 'high',
          title: 'Class Reminder',
          message: `${classItem.subject} starts in ${notificationSettings.reminderMinutes} minutes`,
          icon: 'fas fa-chalkboard-teacher',
          color: '#3b82f6',
          actionable: true,
          actions: [
            { label: 'View Details', action: 'view-timetable' },
            { label: 'Mark as Attended', action: 'mark-attended', data: classItem }
          ]
        };

        reminders.push(notification);
        
        // Show browser notification
        showBrowserNotification(notification.title, {
          body: notification.message,
          tag: `class-${classItem.subject}`,
          requireInteraction: true
        });
      }
    });

    return reminders;
  }, [studentData.timetable, notificationSettings, showBrowserNotification]);

  // Generate goal deadline reminders
  const generateGoalReminders = useCallback(() => {
    if (!studentData.goals || !notificationSettings.goalDeadlines) return [];

    const now = new Date();
    const reminders = [];

    studentData.goals.forEach(goal => {
      if (!goal.completed) {
        const deadline = new Date(goal.deadline);
        const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        // Notify for goals due in 1, 3, or 7 days
        if ([1, 3, 7].includes(daysUntilDeadline)) {
          const notification = {
            type: 'goal',
            priority: daysUntilDeadline === 1 ? 'high' : 'medium',
            title: 'Goal Deadline Approaching',
            message: `"${goal.title}" is due in ${daysUntilDeadline} day(s)`,
            icon: 'fas fa-bullseye',
            color: '#f59e0b',
            actionable: true,
            actions: [
              { label: 'View Goal', action: 'view-goals', data: goal },
              { label: 'Update Progress', action: 'update-goal-progress', data: goal }
            ]
          };

          reminders.push(notification);

          // Show browser notification for urgent goals
          if (daysUntilDeadline <= 3) {
            showBrowserNotification(notification.title, {
              body: notification.message,
              tag: `goal-${goal.id}`,
              requireInteraction: daysUntilDeadline === 1
            });
          }
        }
      }
    });

    return reminders;
  }, [studentData.goals, notificationSettings.goalDeadlines, showBrowserNotification]);

  // Generate daily progress notifications
  const generateProgressReminders = useCallback(() => {
    if (!notificationSettings.dailyProgress) return [];

    const now = new Date();
    const todayActivities = studentData.activities?.filter(activity => 
      activity.date === now.toISOString().split('T')[0]
    ) || [];

    const reminders = [];

    // Evening progress reminder (8 PM)
    if (now.getHours() === 20 && now.getMinutes() === 0 && todayActivities.length > 0) {
      const completedToday = todayActivities.filter(a => a.completed).length;
      const progressPercentage = Math.round((completedToday / todayActivities.length) * 100);

      const notification = {
        type: 'progress',
        priority: 'medium',
        title: 'Daily Progress Update',
        message: `You've completed ${progressPercentage}% of today's activities (${completedToday}/${todayActivities.length})`,
        icon: 'fas fa-chart-line',
        color: progressPercentage >= 80 ? '#10b981' : progressPercentage >= 60 ? '#f59e0b' : '#ef4444',
        actionable: true,
        actions: [
          { label: 'View Activities', action: 'view-activities' },
          { label: 'Add Activity', action: 'add-activity' }
        ]
      };

      reminders.push(notification);
      showBrowserNotification(notification.title, { body: notification.message });
    }

    // Midday motivation reminder (2 PM)
    if (now.getHours() === 14 && now.getMinutes() === 0) {
      const notification = {
        type: 'motivation',
        priority: 'low',
        title: 'Midday Motivation',
        message: 'Keep up the great work! Remember your goals and stay focused.',
        icon: 'fas fa-heart',
        color: '#ec4899'
      };

      reminders.push(notification);
    }

    return reminders;
  }, [studentData.activities, notificationSettings.dailyProgress, showBrowserNotification]);

  // Generate study break reminders
  const generateBreakReminders = useCallback(() => {
    const now = new Date();
    const reminders = [];

    // Every 2 hours during study time (9 AM - 9 PM)
    if (now.getHours() >= 9 && now.getHours() <= 21 && now.getMinutes() === 0 && now.getHours() % 2 === 0) {
      const notification = {
        type: 'break',
        priority: 'low',
        title: 'Study Break Reminder',
        message: 'Take a 10-minute break to refresh your mind and stay productive!',
        icon: 'fas fa-coffee',
        color: '#8b5cf6'
      };

      reminders.push(notification);
    }

    return reminders;
  }, []);

  // Generate weekly report notifications
  const generateWeeklyReports = useCallback(() => {
    if (!notificationSettings.weeklyReports) return [];

    const now = new Date();
    const reminders = [];

    // Sunday evening weekly report
    if (now.getDay() === 0 && now.getHours() === 19 && now.getMinutes() === 0) {
      const notification = {
        type: 'report',
        priority: 'medium',
        title: 'Weekly Progress Report',
        message: 'Your weekly progress report is ready! Review your achievements and plan for next week.',
        icon: 'fas fa-chart-bar',
        color: '#6366f1',
        actionable: true,
        actions: [
          { label: 'View Report', action: 'view-weekly-report' },
          { label: 'Set Weekly Goals', action: 'set-weekly-goals' }
        ]
      };

      reminders.push(notification);
      showBrowserNotification(notification.title, { body: notification.message });
    }

    return reminders;
  }, [notificationSettings.weeklyReports, showBrowserNotification]);

  // Main notification generation function
  const generateNotifications = useCallback(() => {
    const allReminders = [
      ...generateClassReminders(),
      ...generateGoalReminders(),
      ...generateProgressReminders(),
      ...generateBreakReminders(),
      ...generateWeeklyReports()
    ];

    allReminders.forEach(reminder => addNotification(reminder));
  }, [
    generateClassReminders,
    generateGoalReminders,
    generateProgressReminders,
    generateBreakReminders,
    generateWeeklyReports,
    addNotification
  ]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Update notification settings
  const updateSettings = useCallback((newSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority) => {
    return notifications.filter(notification => notification.priority === priority);
  }, [notifications]);

  // Set up automatic notification checking
  useEffect(() => {
    generateNotifications(); // Initial generation
    
    const interval = setInterval(generateNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [generateNotifications]);

  // Cleanup old notifications (older than 7 days)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setNotifications(prev =>
        prev.filter(notification => new Date(notification.timestamp) > sevenDaysAgo)
      );
    }, 24 * 60 * 60 * 1000); // Check daily

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    notifications,
    notificationSettings,
    permission,
    unreadCount,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
    updateSettings,
    getNotificationsByType,
    getNotificationsByPriority,
    showBrowserNotification
  };
};

// Hook for managing notification sounds
export const useNotificationSounds = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const playNotificationSound = useCallback((type = 'default') => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio();
      
      // Different sounds for different notification types
      switch (type) {
        case 'class':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYgAUCLz+/PgC'; // Bell sound
          break;
        case 'goal':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYgAUCLz+/PgC'; // Chime sound
          break;
        default:
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYgAUCLz+/PgC'; // Default sound
      }
      
      audio.volume = volume;
      audio.play().catch(error => console.warn('Could not play notification sound:', error));
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }, [soundEnabled, volume]);

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playNotificationSound
  };
};

// Hook for scheduling future notifications
export const useScheduledNotifications = () => {
  const [scheduledNotifications, setScheduledNotifications] = useState([]);

  const scheduleNotification = useCallback((notification, date) => {
    const id = Date.now() + Math.random();
    const timeoutId = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          ...notification.options
        });
      }
      
      // Remove from scheduled list
      setScheduledNotifications(prev => 
        prev.filter(scheduled => scheduled.id !== id)
      );
    }, date.getTime() - Date.now());

    const scheduledNotification = {
      id,
      timeoutId,
      notification,
      scheduledFor: date
    };

    setScheduledNotifications(prev => [...prev, scheduledNotification]);
    return id;
  }, []);

  const cancelScheduledNotification = useCallback((id) => {
    setScheduledNotifications(prev => {
      const scheduled = prev.find(s => s.id === id);
      if (scheduled) {
        clearTimeout(scheduled.timeoutId);
        return prev.filter(s => s.id !== id);
      }
      return prev;
    });
  }, []);

  const cancelAllScheduledNotifications = useCallback(() => {
    scheduledNotifications.forEach(scheduled => {
      clearTimeout(scheduled.timeoutId);
    });
    setScheduledNotifications([]);
  }, [scheduledNotifications]);

  return {
    scheduledNotifications,
    scheduleNotification,
    cancelScheduledNotification,
    cancelAllScheduledNotifications
  };
};
