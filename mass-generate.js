async function massGenerate() {
  const PROJECT_TYPES = [
    "Hospital Management System", "AI Resume Analyzer", "E-Commerce Platform", "Chat Application",
    "Student Management System", "Face Recognition System", "IoT Smart Irrigation", "Cybersecurity Analyzer",
    "Blood Bank Management", "Virtual Classroom", "Online Voting System", "Smart Home Automation",
    "Traffic Signal Control", "Online Food Ordering", "Library Management", "Vehicle Tracking System",
    "Weather Forecasting App", "Task Management Tool", "Quiz Application", "Stock Management System"
  ];

  console.log(`Starting mass generation...`);

  for (const title of PROJECT_TYPES) {
    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          projectType: 'AI',
          techStack: 'React, Node.js',
          problemStatement: 'Manual work is hard.',
          features: 'Feature A, Feature B',
          teamSize: 1,
          academicLevel: 'BTech'
        }),
      });
      const data = await response.json();
      console.log(`Generated: ${title} -> ${data.projectId}`);
    } catch (e) {
      console.error(`Failed ${title}:`, e.message);
    }
  }
}

massGenerate();
