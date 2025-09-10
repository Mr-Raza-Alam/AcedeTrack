import React, { useState, useRef, useEffect } from 'react';

const AIAssistant = ({ studentData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI study assistant. I can help you with study planning, progress analysis, goal setting, and academic advice. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    {
      id: 'analyze-progress',
      icon: 'fas fa-chart-line',
      text: 'Analyze my progress',
      action: () => handleQuickAction('analyze-progress')
    },
    {
      id: 'study-plan',
      icon: 'fas fa-calendar-alt',
      text: 'Create study plan',
      action: () => handleQuickAction('study-plan')
    },
    {
      id: 'goal-suggestions',
      icon: 'fas fa-bullseye',
      text: 'Goal suggestions',
      action: () => handleQuickAction('goal-suggestions')
    },
    {
      id: 'productivity-tips',
      icon: 'fas fa-lightbulb',
      text: 'Productivity tips',
      action: () => handleQuickAction('productivity-tips')
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    generateSuggestions();
  }, [studentData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateSuggestions = () => {
    const newSuggestions = [];
    
    // Analyze student data and generate contextual suggestions
    if (studentData.activities?.length > 0) {
      const todayActivities = studentData.activities.filter(activity => 
        activity.date === new Date().toISOString().split('T')[0]
      );
      const completionRate = (todayActivities.filter(a => a.completed).length / todayActivities.length) * 100;
      
      if (completionRate < 50) {
        newSuggestions.push("Your completion rate is low today. Would you like tips to improve focus?");
      }
    }

    if (studentData.goals?.length > 0) {
      const overdueGoals = studentData.goals.filter(goal => 
        !goal.completed && new Date(goal.deadline) < new Date()
      );
      
      if (overdueGoals.length > 0) {
        newSuggestions.push(`You have ${overdueGoals.length} overdue goal(s). Need help prioritizing?`);
      }
    }

    setSuggestions(newSuggestions);
  };

  const processAIResponse = (userMessage, userData) => {
    const message = userMessage.toLowerCase();
    
    // Progress Analysis
    if (message.includes('progress') || message.includes('analyze')) {
      return generateProgressAnalysis(userData);
    }
    
    // Study Plan
    if (message.includes('study plan') || message.includes('schedule')) {
      return generateStudyPlan(userData);
    }
    
    // Goal Suggestions
    if (message.includes('goal') || message.includes('target')) {
      return generateGoalSuggestions(userData);
    }
    
    // Productivity Tips
    if (message.includes('tips') || message.includes('productivity') || message.includes('focus')) {
      return generateProductivityTips();
    }
    
    // Time Management
    if (message.includes('time') || message.includes('manage')) {
      return generateTimeManagementAdvice();
    }
    
    // Motivation
    if (message.includes('motivation') || message.includes('help') || message.includes('stuck')) {
      return generateMotivationalResponse();
    }
    
    // Default response
    return "I understand you're asking about your studies. Could you be more specific? I can help with progress analysis, study planning, goal setting, productivity tips, or general academic advice.";
  };

  const generateProgressAnalysis = (userData) => {
    const activities = userData.activities || [];
    const goals = userData.goals || [];
    
    const todayActivities = activities.filter(activity => 
      activity.date === new Date().toISOString().split('T')[0]
    );
    
    const completionRate = todayActivities.length > 0 
      ? Math.round((todayActivities.filter(a => a.completed).length / todayActivities.length) * 100)
      : 0;
    
    const activeGoals = goals.filter(g => !g.completed).length;
    const completedGoals = goals.filter(g => g.completed).length;
    
    return `📊 **Your Progress Analysis:**

**Today's Performance:**
- Activity completion rate: ${completionRate}%
- Activities completed: ${todayActivities.filter(a => a.completed).length}/${todayActivities.length}

**Goal Status:**
- Active goals: ${activeGoals}
- Completed goals: ${completedGoals}
- Success rate: ${goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0}%

**Recommendations:**
${completionRate >= 80 
  ? "🎉 Excellent work today! You're maintaining great consistency." 
  : completionRate >= 60 
    ? "👍 Good progress, but there's room for improvement. Consider breaking larger tasks into smaller ones."
    : "⚠️ Your completion rate needs attention. Let's work on better time management and realistic goal setting."
}`;
  };

  const generateStudyPlan = (userData) => {
    const schedule = userData.timetable || [];
    const goals = userData.goals || [];
    
    return `📅 **Personalized Study Plan:**

**This Week's Focus:**
${goals.slice(0, 3).map((goal, index) => 
  `${index + 1}. ${goal.title} (Priority: ${goal.priority})`
).join('\n') || 'No active goals set. Consider setting 2-3 specific goals for this week.'}

**Daily Study Strategy:**
- **Morning (9-11 AM):** Focus on your most challenging subjects
- **Afternoon (2-4 PM):** Review and practice problems
- **Evening (7-9 PM):** Light reading and revision

**Study Techniques to Try:**
- Pomodoro Technique (25 min study, 5 min break)
- Active recall and spaced repetition
- Mind mapping for complex topics

**Weekly Schedule Optimization:**
${schedule.length > 0 
  ? "Based on your class schedule, I recommend scheduling study sessions during your free periods."
  : "Upload your class schedule for more personalized timing recommendations."
}`;
  };

  const generateGoalSuggestions = (userData) => {
    const goals = userData.goals || [];
    const activities = userData.activities || [];
    
    return `🎯 **Smart Goal Suggestions:**

**Based on Your Activity Pattern:**
1. **Daily Consistency Goal:** Complete at least 80% of daily activities for 7 consecutive days
2. **Subject Mastery Goal:** Dedicate 2 hours daily to your weakest subject for 2 weeks
3. **Assignment Goal:** Submit all assignments 2 days before deadline

**Academic Goals to Consider:**
- Improve GPA by 0.5 points this semester
- Read 2 additional books related to your major
- Join a study group or academic club
- Complete online certification in your field

**SMART Goal Template:**
- **Specific:** What exactly do you want to achieve?
- **Measurable:** How will you track progress?
- **Achievable:** Is it realistic with your current schedule?
- **Relevant:** Does it align with your academic objectives?
- **Time-bound:** What's your deadline?

${goals.length === 0 
  ? "\n💡 **Getting Started:** I recommend setting 2-3 goals to begin with - one short-term (1 week), one medium-term (1 month), and one long-term (semester)."
  : "\n✅ **Current Goal Status:** You have active goals! Consider reviewing their progress and adjusting if needed."
}`;
  };

  const generateProductivityTips = () => {
    const tips = [
      "🍅 Try the Pomodoro Technique: 25 minutes focused work, 5-minute break",
      "📱 Use apps like Forest or Freedom to block distracting websites",
      "🎵 Listen to instrumental music or white noise while studying",
      "☀️ Study during your peak energy hours (usually morning for most people)",
      "📝 Write down tomorrow's tasks before ending today's study session",
      "🧘‍♀️ Take 5-minute meditation breaks between study sessions"
    ];
    
    const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    return `💡 **Productivity Tips for Better Focus:**

${randomTips.join('\n')}

**Environment Optimization:**
- Clean, organized workspace
- Good lighting and ventilation
- Comfortable but not too comfortable seating
- All necessary materials within reach

**Mental Strategies:**
- Start with easier tasks to build momentum
- Use the "2-minute rule" - if something takes less than 2 minutes, do it now
- Celebrate small wins throughout the day
- Practice saying "no" to non-essential commitments

Would you like specific tips for any particular challenge you're facing?`;
  };

  const generateTimeManagementAdvice = () => {
    return `⏰ **Time Management Strategies:**

**The Eisenhower Matrix:**
- **Urgent + Important:** Do first (deadlines, crises)
- **Important + Not Urgent:** Schedule (study sessions, exercise)
- **Urgent + Not Important:** Delegate or minimize
- **Neither:** Eliminate

**Time Blocking Technique:**
1. Block similar tasks together
2. Set specific time limits for each activity
3. Include buffer time for unexpected tasks
4. Protect your deep work hours

**Quick Time Savers:**
- Prepare materials the night before
- Use templates for recurring tasks
- Batch similar activities (reading, problem-solving)
- Set specific times for checking messages/social media

**Weekly Planning:**
- Sunday: Plan upcoming week
- Each evening: Review day and plan tomorrow
- Monthly: Assess progress and adjust strategies

Remember: Perfect planning isn't the goal - consistent execution is!`;
  };

  const generateMotivationalResponse = () => {
    const motivationalMessages = [
      "Remember: Every expert was once a beginner. Your current struggles are building your future strengths! 💪",
      "It's okay to have tough days. What matters is showing up consistently, even when motivation is low. 🌟",
      "Think of your studies as an investment in your future self. Every hour you put in now pays dividends later! 🚀",
      "Progress isn't always visible day-to-day, but it compounds over time. Trust the process! 📈",
      "You've overcome challenges before, and you'll overcome this one too. Break it into smaller steps! 🎯"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    return `🌈 **You've Got This!**

${randomMessage}

**When Feeling Overwhelmed:**
1. Take 3 deep breaths
2. Write down what's bothering you
3. Break large tasks into smaller ones
4. Focus on just the next small step
5. Remember your "why" - your goals and dreams

**Quick Mood Boosters:**
- Take a 10-minute walk outside
- Listen to your favorite upbeat song
- Do 5 minutes of stretching
- Call a friend or family member
- Look at your progress from last month

Is there something specific that's making you feel stuck? I'm here to help you work through it! 💙`;
  };

  const handleQuickAction = (actionId) => {
    let message = '';
    switch (actionId) {
      case 'analyze-progress':
        message = 'Can you analyze my current progress?';
        break;
      case 'study-plan':
        message = 'Help me create a study plan';
        break;
      case 'goal-suggestions':
        message = 'What goals should I set?';
        break;
      case 'productivity-tips':
        message = 'Give me some productivity tips';
        break;
      default:
        return;
    }
    
    setInputMessage(message);
    setTimeout(() => sendMessage(), 100);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = processAIResponse(inputMessage, studentData);
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-assistant">
      <div className="assistant-header">
        <div className="ai-avatar">
          <i className="fas fa-robot"></i>
        </div>
        <div className="assistant-info">
          <h2>AI Study Assistant</h2>
          <p className="status">
            <span className="status-dot online"></span>
            Online - Ready to help
          </p>
        </div>
      </div>

      <div className="quick-actions">
        <h4>Quick Actions:</h4>
        <div className="actions-grid">
          {quickActions.map(action => (
            <button
              key={action.id}
              className="quick-action-btn"
              onClick={action.action}
            >
              <i className={action.icon}></i>
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h4>Personalized Suggestions:</h4>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              <i className="fas fa-lightbulb"></i>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      <div className="chat-container">
        <div className="messages-container">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'ai' ? (
                  <i className="fas fa-robot"></i>
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content.split('\n').map((line, index) => {
                    // Handle markdown-style formatting
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h4 key={index}>{line.slice(2, -2)}</h4>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={index}>{line.slice(2)}</li>;
                    }
                    return <p key={index}>{line}</p>;
                  })}
                </div>
                <div className="message-time">{message.timestamp}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies, goals, or need academic advice..."
              rows="2"
              disabled={isTyping}
            />
            <button 
              className="send-btn"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

