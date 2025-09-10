
import React, { useState } from 'react';
import { generateAITimetable } from '../Utils/aiTimeTableGene';

const ScheduleUpload = ({ studentData, updateStudentData }) => {
  const [scheduleFile, setScheduleFile] = useState(null);
  const [manualSchedule, setManualSchedule] = useState([]);
  const [uploadMethod, setUploadMethod] = useState('file');
  const [newClass, setNewClass] = useState({
    subject: '',
    day: '',
    time: '',
    duration: '',
    room: '',
    professor: ''
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setScheduleFile(file);
    // In a real app, you'd parse the file content here
    console.log('File uploaded:', file.name);
  };

  const addManualClass = () => {
    if (newClass.subject && newClass.day && newClass.time) {
      setManualSchedule([...manualSchedule, { ...newClass, id: Date.now() }]);
      setNewClass({
        subject: '',
        day: '',
        time: '',
        duration: '',
        room: '',
        professor: ''
      });
    }
  };

  const removeManualClass = (id) => {
    setManualSchedule(manualSchedule.filter(cls => cls.id !== id));
  };

  const generateTimetable = () => {
    const schedule = uploadMethod === 'file' ? scheduleFile : manualSchedule;
    const aiTimetable = generateAITimetable(schedule);
    
    updateStudentData({
      schedule: schedule,
      timetable: aiTimetable
    });

    alert('AI Timetable generated successfully!');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="schedule-upload">
      <div className="upload-header">
        <h2>Upload Your Semester Schedule</h2>
        <p>Upload your class schedule and let our AI create a personalized timetable</p>
      </div>

      <div className="upload-methods">
        <div className="method-selector">
          <button 
            className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            <i className="fas fa-file-upload"></i>
            Upload File
          </button>
          <button 
            className={`method-btn ${uploadMethod === 'manual' ? 'active' : ''}`}
            onClick={() => setUploadMethod('manual')}
          >
            <i className="fas fa-keyboard"></i>
            Manual Entry
          </button>
        </div>

        {uploadMethod === 'file' ? (
          <div className="file-upload-section">
            <div className="upload-area">
              <input 
                type="file" 
                id="scheduleFile"
                accept=".pdf,.doc,.docx,.xlsx,.csv"
                onChange={handleFileUpload}
                className="file-input"
              />
              <label htmlFor="scheduleFile" className="upload-label">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Click to upload or drag and drop</span>
                <small>PDF, DOC, XLSX, CSV files accepted</small>
              </label>
            </div>
            {scheduleFile && (
              <div className="file-info">
                <i className="fas fa-file"></i>
                <span>{scheduleFile.name}</span>
                <button onClick={() => setScheduleFile(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="manual-entry-section">
            <div className="add-class-form">
              <h3>Add Class Details</h3>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={newClass.subject}
                  onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                />
                <select
                  value={newClass.day}
                  onChange={(e) => setNewClass({...newClass, day: e.target.value})}
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="time"
                  placeholder="Time"
                  value={newClass.time}
                  onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 1h 30m)"
                  value={newClass.duration}
                  onChange={(e) => setNewClass({...newClass, duration: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Room Number"
                  value={newClass.room}
                  onChange={(e) => setNewClass({...newClass, room: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Professor Name"
                  value={newClass.professor}
                  onChange={(e) => setNewClass({...newClass, professor: e.target.value})}
                />
              </div>
              <button className="add-class-btn" onClick={addManualClass}>
                <i className="fas fa-plus"></i>
                Add Class
              </button>
            </div>

            {manualSchedule.length > 0 && (
              <div className="schedule-preview">
                <h3>Schedule Preview</h3>
                <div className="schedule-table">
                  {manualSchedule.map((cls) => (
                    <div key={cls.id} className="schedule-row">
                      <span className="subject">{cls.subject}</span>
                      <span className="day">{cls.day}</span>
                      <span className="time">{cls.time}</span>
                      <span className="duration">{cls.duration}</span>
                      <span className="room">{cls.room}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => removeManualClass(cls.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="generate-section">
          <button 
            className="generate-btn"
            onClick={generateTimetable}
            disabled={!scheduleFile && manualSchedule.length === 0}
          >
            <i className="fas fa-magic"></i>
            Generate AI Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUpload;
