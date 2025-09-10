
export const generateAITimetable = (schedule) => {
  // AI Timetable Generation Logic
  const timetable = [];
  const studyHours = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Generate study sessions based on classes
  daysOfWeek.forEach(day => {
    // Add classes for the day
    if (Array.isArray(schedule)) {
      const dayClasses = schedule.filter(cls => cls.day === day);
      dayClasses.forEach(cls => {
        timetable.push({
          day,
          time: cls.time,
          subject: cls.subject,
          type: 'class',
          room: cls.room || 'TBA',
          duration: cls.duration || '1 hour'
        });
      });
    }

    // Add AI-generated study sessions
    studyHours.forEach(time => {
      const isClassTime = timetable.some(item => 
        item.day === day && item.time === time && item.type === 'class'
      );

      if (!isClassTime) {
        // AI decides what to study based on schedule
        const subjects = Array.isArray(schedule) 
          ? [...new Set(schedule.map(cls => cls.subject))]
          : ['Mathematics', 'Physics', 'Chemistry']; // Default subjects

        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        
        if (Math.random() > 0.6) { // 40% chance to add study session
          timetable.push({
            day,
            time,
            subject: `Study - ${randomSubject}`,
            type: 'study',
            duration: '1 hour',
            room: 'Self Study'
          });
        }
      }
    });

    // Add break times
    timetable.push({
      day,
      time: '12:00',
      subject: 'Lunch Break',
      type: 'break',
      duration: '1 hour',
      room: 'Cafeteria'
    });
  });

  return timetable.sort((a, b) => {
    const dayOrder = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    return a.time.localeCompare(b.time);
  });
};
