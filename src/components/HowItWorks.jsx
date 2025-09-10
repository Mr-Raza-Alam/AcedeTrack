import React, { useState, useEffect, useRef } from 'react';

const HowItWorks = () => {
  const [visibleSteps, setVisibleSteps] = useState(new Set());
  const stepsRef = useRef(null);

  const steps = [
    {
      number: 1,
      title: "Create Your Profile",
      description: "Sign up and set up your academic profile with subjects, goals, and study preferences"
    },
    {
      number: 2,
      title: "Log Your Activities",
      description: "Track your daily study sessions, assignments, and academic activities with our easy-to-use interface"
    },
    {
      number: 3,
      title: "Analyze Your Progress",
      description: "View detailed reports and analytics about your study patterns, performance trends, and productivity"
    },
    {
      number: 4,
      title: "Optimize & Improve",
      description: "Use insights and recommendations to optimize your study strategy and achieve better results"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleSteps(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.5 }
    );

    const stepElements = stepsRef.current?.querySelectorAll('.step');
    stepElements?.forEach(step => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-it-works" id="how-it-works" ref={stepsRef}>
      <div className="container">
        <div className="section-title">
          <h2>How AcadeTrack Works</h2>
          <p>Get started in just four simple steps and transform your academic performance</p>
        </div>

        <div className="steps">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step ${visibleSteps.has(index) ? 'visible' : ''}`}
              data-index={index}
            >
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

