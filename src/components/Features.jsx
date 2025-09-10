import React, { useState, useEffect, useRef } from 'react';

const Features = () => {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const featuresRef = useRef(null);

  const features = [
    {
      icon: "fas fa-chart-line",
      title: "Smart Progress Analytics",
      description: "Get detailed insights into your study patterns, performance trends, and areas for improvement with our advanced analytics dashboard."
    },
    {
      icon: "fas fa-target",
      title: "Goal Setting & Tracking",
      description: "Set personalized academic goals and track your progress in real-time. Stay motivated with milestone celebrations and achievement badges."
    },
    {
      icon: "fas fa-brain",
      title: "AI-Powered Recommendations",
      description: "Receive personalized study recommendations based on your performance data and learning patterns to optimize your study efficiency."
    },
    {
      icon: "fas fa-calendar-alt",
      title: "Study Schedule Planner",
      description: "Create and manage your study schedule with intelligent time allocation based on subject difficulty and your performance history."
    },
    {
      icon: "fas fa-mobile-alt",
      title: "Mobile-First Experience",
      description: "Access your progress and study materials anywhere, anytime with our responsive design and dedicated mobile app."
    },
    {
      icon: "fas fa-users",
      title: "Collaborative Learning",
      description: "Connect with study groups, share progress with mentors, and participate in academic challenges with fellow students."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    const cards = featuresRef.current?.querySelectorAll('.feature-card');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features" id="features" ref={featuresRef}>
      <div className="container">
        <div className="section-title">
          <h2>Why Choose AcadeTrack?</h2>
          <p>Discover the powerful features that make AcadeTrack the ultimate study companion for ambitious students</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card ${visibleCards.has(index) ? 'visible' : ''}`}
              data-index={index}
            >
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

