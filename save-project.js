/**
 * Project Structure Documentation
 * 
 * This file lists all the important files in the project.
 * You can use this as a reference when saving or sharing the project.
 */

const projectStructure = {
  // Root files
  'package.json': 'Backend dependencies and scripts',
  'mock-server.js': 'Backend API server implementation',
  'README.md': 'Project documentation and instructions',
  
  // Frontend files
  'frontend/package.json': 'Frontend dependencies and scripts',
  'frontend/public/index.html': 'Main HTML file',
  'frontend/public/manifest.json': 'Web app manifest',
  'frontend/src/index.jsx': 'React entry point',
  'frontend/src/index.css': 'Global CSS styles',
  'frontend/src/App.jsx': 'Main React component with routing',
  'frontend/src/App.css': 'App-specific CSS styles',
  'frontend/src/reportWebVitals.js': 'Performance reporting',
  
  // React components
  'frontend/src/components/Navbar.jsx': 'Navigation bar component',
  'frontend/src/components/PetitionCard.jsx': 'Petition card component',
  
  // React pages
  'frontend/src/pages/HomePage.jsx': 'Home page showing all petitions',
  'frontend/src/pages/PetitionPage.jsx': 'Individual petition page with signing form',
  'frontend/src/pages/CreatePetitionPage.jsx': 'Form to create new petitions',
};

console.log('Online Petition Platform - Project Structure');
console.log('============================================');
console.log('');
console.log('Important files in this project:');
console.log('');

Object.entries(projectStructure).forEach(([file, description]) => {
  console.log(`- ${file}: ${description}`);
});

console.log('');
console.log('To save this project:');
console.log('1. Make sure all files are saved');
console.log('2. Copy the entire project directory');
console.log('3. To run the project again, follow the instructions in README.md'); 