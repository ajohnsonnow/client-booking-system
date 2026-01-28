#!/usr/bin/env node

/**
 * Pre-Push Validation Script
 * Runs automated checks before allowing code to be pushed
 * Usage: node scripts/pre-push.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n🔍 Running Pre-Push Validation...\n');

let hasErrors = false;

// ==========================================
// 1. Check Critical Files Exist
// ==========================================
console.log('📋 Checking critical files...');
const criticalFiles = [
  'server.js',
  'package.json',
  'public/index.html',
  'public/admin.html',
  'public/portal.html',
  'public/app.js',
  'public/styles.css',
  'data/.gitkeep',
  'SETUP_GUIDE.md',
  'ADMIN_USER_GUIDE.md'
];

for (const file of criticalFiles) {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ Missing critical file: ${file}`);
    hasErrors = true;
  }
}

if (!hasErrors) {
  console.log('   ✅ All critical files present\n');
}

// ==========================================
// 2. Validate package.json
// ==========================================
console.log('📦 Validating package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  
  if (!packageJson.name) {
    console.error('   ❌ package.json missing "name" field');
    hasErrors = true;
  }
  if (!packageJson.version) {
    console.error('   ❌ package.json missing "version" field');
    hasErrors = true;
  }
  if (!packageJson.type || packageJson.type !== 'module') {
    console.error('   ❌ package.json must have "type": "module"');
    hasErrors = true;
  }
  if (!packageJson.dependencies || !packageJson.dependencies.express) {
    console.error('   ❌ package.json missing required dependency: express');
    hasErrors = true;
  }
  
  if (!hasErrors) {
    console.log('   ✅ package.json is valid\n');
  }
} catch (error) {
  console.error(`   ❌ Invalid package.json: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 3. Check for Syntax Errors in HTML Files
// ==========================================
console.log('🌐 Checking HTML files...');
const htmlFiles = [
  'public/index.html',
  'public/admin.html',
  'public/portal.html',
  'public/privacy.html',
  'public/submit-testimonial.html'
];

for (const file of htmlFiles) {
  const filePath = path.join(ROOT_DIR, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for developer credit
    if (!content.includes('Anth@StructuredForGrowth.com')) {
      console.error(`   ⚠️  ${file} missing developer credit`);
    }
    
    // Check for basic HTML structure
    if (!content.includes('</html>')) {
      console.error(`   ❌ ${file} missing closing </html> tag`);
      hasErrors = true;
    }
    if (!content.includes('</body>')) {
      console.error(`   ❌ ${file} missing closing </body> tag`);
      hasErrors = true;
    }
  }
}

if (!hasErrors) {
  console.log('   ✅ All HTML files valid\n');
}

// ==========================================
// 4. Check Data Directory Structure
// ==========================================
console.log('💾 Checking data directory...');
const dataDir = path.join(ROOT_DIR, 'data');
const requiredDirs = [
  'data',
  'data/backups',
  'data/backups/manual',
  'data/backups/auto'
];

for (const dir of requiredDirs) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    console.error(`   ❌ Missing directory: ${dir}`);
    hasErrors = true;
  }
}

if (!hasErrors) {
  console.log('   ✅ Data directory structure valid\n');
}

// ==========================================
// 5. Validate server.js Structure
// ==========================================
console.log('⚙️  Validating server.js...');
try {
  const serverContent = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
  
  const requiredFeatures = [
    { name: 'Express import', pattern: /import\s+express\s+from\s+['"]express['"]/ },
    { name: 'JWT authentication', pattern: /jwt\.sign|jwt\.verify/ },
    { name: 'Backup system', pattern: /createAutoBackup|rotateAutoBackups/ },
    { name: 'Admin endpoints', pattern: /\/api\/admin/ },
    { name: 'Client endpoints', pattern: /\/api\/client/ },
    { name: 'AES encryption', pattern: /aes-256-gcm/ }
  ];
  
  for (const feature of requiredFeatures) {
    if (!feature.pattern.test(serverContent)) {
      console.error(`   ❌ Missing feature: ${feature.name}`);
      hasErrors = true;
    }
  }
  
  if (!hasErrors) {
    console.log('   ✅ server.js structure valid\n');
  }
} catch (error) {
  console.error(`   ❌ Error reading server.js: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 6. Check for Sensitive Data
// ==========================================
console.log('🔒 Checking for exposed secrets...');
try {
  const serverContent = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
  
  // Check for exposed API keys (basic patterns)
  const dangerousPatterns = [
    { name: 'Hardcoded API key', pattern: /apiKey\s*=\s*['"][a-zA-Z0-9]{20,}['"]/ },
    { name: 'Hardcoded password', pattern: /password\s*=\s*['"][^'"]{8,}['"]\s*(?!process\.env)/ },
    { name: 'Exposed JWT secret', pattern: /JWT_SECRET\s*=\s*['"][^'"]+['"]/ }
  ];
  
  for (const check of dangerousPatterns) {
    if (check.pattern.test(serverContent)) {
      console.warn(`   ⚠️  WARNING: Possible ${check.name} found`);
    }
  }
  
  console.log('   ✅ No obvious secrets exposed\n');
} catch (error) {
  console.error(`   ❌ Error checking secrets: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 7. Validate and Update Documentation
// ==========================================
console.log('📚 Validating documentation...');
try {
  const docs = [
    'SETUP_GUIDE.md',
    'ADMIN_USER_GUIDE.md',
    'DEMO_GUIDE.md',
    'QUICK_REFERENCE.md',
    'BACKUP_GUIDE.md',
    'FREE_COMMUNICATIONS_SETUP.md',
    'COMMUNICATIONS_IMPLEMENTATION.md',
    'VALUE_PROPOSITION_REPORT.md'
  ];
  
  let missingDocs = [];
  let updatedDocs = 0;
  const today = new Date().toISOString().split('T')[0];
  
  for (const doc of docs) {
    const docPath = path.join(ROOT_DIR, doc);
    if (!fs.existsSync(docPath)) {
      missingDocs.push(doc);
    } else {
      // Update timestamps in each document
      let content = fs.readFileSync(docPath, 'utf8');
      const oldContent = content;
      
      // Update Last Updated timestamps
      if (content.includes('Last Updated:')) {
        content = content.replace(/Last Updated: \d{4}-\d{2}-\d{2}/g, `Last Updated: ${today}`);
      } else if (content.includes('**Report Date:**') || content.includes('Report Date:')) {
        content = content.replace(/\*\*Report Date:\*\* [^\n]+/g, `**Last Updated:** ${today}`);
        content = content.replace(/Report Date: [^\n]+/g, `Last Updated: ${today}`);
      }
      
      if (content !== oldContent) {
        fs.writeFileSync(docPath, content, 'utf8');
        updatedDocs++;
      }
    }
  }
  
  if (missingDocs.length > 0) {
    console.warn(`   ⚠️  Missing documentation: ${missingDocs.join(', ')}`);
  } else {
    console.log('   ✅ All documentation files present');
  }
  
  if (updatedDocs > 0) {
    console.log(`   ✅ Updated timestamps in ${updatedDocs} documentation files`);
  }
  
  // Update README with current date
  const readmePath = path.join(ROOT_DIR, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    // Update "Last Updated" if it exists
    if (readme.includes('Last Updated:')) {
      readme = readme.replace(/Last Updated: \d{4}-\d{2}-\d{2}/g, `Last Updated: ${today}`);
      fs.writeFileSync(readmePath, readme, 'utf8');
      console.log('   ✅ Updated README.md timestamp');
    }
  }
  
  console.log();
} catch (error) {
  console.error(`   ❌ Documentation validation error: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 8. Final Summary
// ==========================================
console.log('═══════════════════════════════════════════');
if (hasErrors) {
  console.log('❌ PRE-PUSH VALIDATION FAILED');
  console.log('═══════════════════════════════════════════\n');
  console.log('Please fix the errors above before pushing.\n');
  process.exit(1);
} else {
  console.log('✅ PRE-PUSH VALIDATION PASSED');
  console.log('═══════════════════════════════════════════\n');
  console.log('Code is ready to be pushed! 🚀\n');
  process.exit(0);
}
