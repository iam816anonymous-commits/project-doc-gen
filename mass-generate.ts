import db from './src/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { SECTIONS, getSectionTemplate } from './src/lib/prompts';

const PROJECT_TYPES = [
  "Hospital Management System",
  "AI Resume Analyzer",
  "E-Commerce Platform",
  "Chat Application",
  "Student Management System",
  "Face Recognition System",
  "IoT Smart Irrigation",
  "Cybersecurity Analyzer",
  "Blood Bank Management",
  "Virtual Classroom",
  "Online Voting System",
  "Smart Home Automation",
  "Traffic Signal Control",
  "Online Food Ordering",
  "Library Management",
  "Vehicle Tracking System",
  "Weather Forecasting App",
  "Task Management Tool",
  "Quiz Application",
  "Stock Management System"
];

async function massGenerate() {
  console.log(`Starting mass generation of ${PROJECT_TYPES.length} project types...`);

  const userId = uuidv4();
  db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(userId, `mass_${userId}@example.com`);

  for (const title of PROJECT_TYPES) {
    const id = uuidv4();
    const details = {
      title,
      projectType: title.includes('AI') ? 'AI' : 'Web Development',
      techStack: 'React, Node.js, SQLite',
      problemStatement: `Managing ${title.toLowerCase()} manually is difficult.`,
      features: 'Dashboard, Reports, User Auth',
      teamSize: 2,
      academicLevel: 'BTech'
    };

    const content: Record<string, string> = {};
    SECTIONS.forEach((section: string) => {
      content[section] = getSectionTemplate(section, details);
    });

    db.prepare(`
      INSERT INTO projects (id, user_id, title, project_type, tech_stack, problem_statement, features, team_size, academic_level, content, is_paid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, userId, title, details.projectType, details.techStack, details.problemStatement, details.features, details.teamSize, details.academicLevel, JSON.stringify(content));

    console.log(`Generated: ${title}`);
  }

  console.log('Mass generation complete.');
  process.exit(0);
}

massGenerate();
