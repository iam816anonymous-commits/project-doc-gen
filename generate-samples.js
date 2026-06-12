async function generateSamples() {
  const SAMPLES = [
    "Hospital Management System",
    "AI Resume Analyzer",
    "E-Commerce Website",
    "Student Management System"
  ];

  console.log(`Generating samples...`);

  for (const title of SAMPLES) {
    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          projectType: title.includes('AI') ? 'AI' : 'Web Development',
          techStack: 'Next.js, Tailwind, SQLite',
          problemStatement: 'Manual systems are inefficient and error-prone.',
          features: 'User Authentication, Data Visualization, Report Generation',
          teamSize: 2,
          academicLevel: 'BTech'
        }),
      });
      const data = await response.json();
      console.log(`Sample Generated: ${title} -> ${data.projectId}`);

      // Unlock them immediately for sample display
      // Note: This requires direct DB access or a hidden API for sample generation
      // I'll assume I should just use the Admin API flow in the E2E test if needed
      // or just mark them is_paid = 1 here if I were running with ts-node
    } catch (e) {
      console.error(`Failed ${title}:`, e.message);
    }
  }
}

generateSamples();
