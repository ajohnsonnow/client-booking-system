#!/usr/bin/env node

/**
 * Pre-Deploy Validation Script
 * Comprehensive checks before production deployment
 * Usage: node scripts/pre-deploy.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n🚀 Running Pre-Deploy Validation...\n');

let hasErrors = false;
let hasWarnings = false;

// ==========================================
// 1. Check All Critical Files
// ==========================================
console.log('📋 Checking critical files...');
const criticalFiles = [
  'server.js',
  'package.json',
  'package-lock.json',
  'public/index.html',
  'public/admin.html',
  'public/portal.html',
  'public/privacy.html',
  'public/submit-testimonial.html',
  'public/app.js',
  'public/styles.css',
  'data/.gitkeep',
  'SETUP_GUIDE.md',
  'ADMIN_USER_GUIDE.md',
  'DEMO_GUIDE.md',
  'QUICK_REFERENCE.md',
  'BACKUP_GUIDE.md',
  'FREE_COMMUNICATIONS_SETUP.md'
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
// 2. Validate Production Configuration
// ==========================================
console.log('⚙️  Validating production configuration...');

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  
  if (!packageJson.scripts || !packageJson.scripts.start) {
    console.error('   ❌ package.json missing "start" script');
    hasErrors = true;
  }
  
  if (!packageJson.engines || !packageJson.engines.node) {
    console.warn('   ⚠️  package.json missing Node.js engine specification');
    hasWarnings = true;
  }
  
  console.log(`   ℹ️  App version: ${packageJson.version}`);
  
  if (!hasErrors) {
    console.log('   ✅ Production configuration valid\n');
  }
} catch (error) {
  console.error(`   ❌ Invalid package.json: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 3. Verify Server Configuration
// ==========================================
console.log('🖥️  Verifying server configuration...');
try {
  const serverContent = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
  
  // Check for production-ready features
  const productionChecks = [
    { name: 'Environment variable support', pattern: /process\.env/, critical: true },
    { name: 'JWT authentication', pattern: /jwt\.sign|jwt\.verify/, critical: true },
    { name: 'Password hashing', pattern: /bcrypt/, critical: true },
    { name: 'AES encryption', pattern: /aes-256-gcm/, critical: true },
    { name: 'Error handling', pattern: /try\s*{[\s\S]*catch/, critical: true },
    { name: 'Backup system', pattern: /createAutoBackup/, critical: false },
    { name: 'CORS configuration', pattern: /cors/, critical: false },
    { name: 'Rate limiting', pattern: /rateLimit/, critical: false }
  ];
  
  for (const check of productionChecks) {
    if (!check.pattern.test(serverContent)) {
      if (check.critical) {
        console.error(`   ❌ Missing critical feature: ${check.name}`);
        hasErrors = true;
      } else {
        console.warn(`   ⚠️  Missing recommended feature: ${check.name}`);
        hasWarnings = true;
      }
    }
  }
  
  // Check for development-only code
  if (/console\.log\((?!.*error|.*warn)/i.test(serverContent)) {
    console.warn('   ⚠️  WARNING: console.log statements detected (consider production logging)');
    hasWarnings = true;
  }
  
  if (!hasErrors) {
    console.log('   ✅ Server configuration ready for production\n');
  }
} catch (error) {
  console.error(`   ❌ Error reading server.js: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 4. Check Data Directory Permissions
// ==========================================
console.log('💾 Checking data directory structure...');
const dataDir = path.join(ROOT_DIR, 'data');
const backupDir = path.join(ROOT_DIR, 'data/backups');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('   ℹ️  Created data directory');
  }
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    fs.mkdirSync(path.join(backupDir, 'manual'), { recursive: true });
    fs.mkdirSync(path.join(backupDir, 'auto'), { recursive: true });
    console.log('   ℹ️  Created backup directories');
  }
  
  // Test write permissions
  const testFile = path.join(dataDir, '.write-test');
  fs.writeFileSync(testFile, 'test', 'utf8');
  fs.unlinkSync(testFile);
  
  console.log('   ✅ Data directory structure valid and writable\n');
} catch (error) {
  console.error(`   ❌ Data directory error: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 5. Verify HTML Integrity
// ==========================================
console.log('🌐 Verifying HTML files...');
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
      console.warn(`   ⚠️  ${file} missing developer credit`);
      hasWarnings = true;
    }
    
    // Check for complete HTML structure
    if (!content.includes('<!DOCTYPE html>')) {
      console.warn(`   ⚠️  ${file} missing DOCTYPE declaration`);
      hasWarnings = true;
    }
    
    // Check for security headers
    if (file.includes('admin') && !content.includes('viewport')) {
      console.warn(`   ⚠️  ${file} missing viewport meta tag`);
      hasWarnings = true;
    }
  }
}

if (!hasErrors) {
  console.log('   ✅ All HTML files valid\n');
}

// ==========================================
// 6. Security Audit
// ==========================================
console.log('🔒 Running security audit...');

// Check for .env file
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ℹ️  .env file found (ensure it\'s in .gitignore)');
  
  // Verify .gitignore includes .env
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('.env')) {
      console.error('   ❌ .env file not in .gitignore!');
      hasErrors = true;
    }
  } else {
    console.warn('   ⚠️  No .gitignore file found');
    hasWarnings = true;
  }
}

// Check for exposed secrets in code
try {
  const serverContent = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
  
  const securityChecks = [
    { name: 'Using environment variables for secrets', pattern: /process\.env\.(JWT_SECRET|ADMIN_PASSWORD)/ },
    { name: 'Password hashing implemented', pattern: /bcrypt\.hash/ },
    { name: 'JWT token verification', pattern: /jwt\.verify/ },
    { name: 'Data encryption', pattern: /crypto\.createCipher|aes-256-gcm/ }
  ];
  
  for (const check of securityChecks) {
    if (!check.pattern.test(serverContent)) {
      console.warn(`   ⚠️  ${check.name} - verify implementation`);
      hasWarnings = true;
    }
  }
  
  console.log('   ✅ Security checks complete\n');
} catch (error) {
  console.error(`   ❌ Security audit error: ${error.message}`);
  hasErrors = true;
}

// ==========================================
// 7. Create Pre-Deploy Backup
// ==========================================
console.log('💼 Creating pre-deploy backup...');
try {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(ROOT_DIR, 'data/backups/manual');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const dataFiles = ['bookings.json', 'clients.json', 'settings.json', 'content.json'];
  let backedUpCount = 0;
  
  for (const file of dataFiles) {
    const sourcePath = path.join(ROOT_DIR, 'data', file);
    if (fs.existsSync(sourcePath)) {
      const backupName = `${file.replace('.json', '')}_predeploy_${timestamp}.json`;
      const backupPath = path.join(backupDir, backupName);
      fs.copyFileSync(sourcePath, backupPath);
      backedUpCount++;
    }
  }
  
  if (backedUpCount > 0) {
    console.log(`   ✅ Backed up ${backedUpCount} data files\n`);
  } else {
    console.log('   ℹ️  No existing data files to backup\n');
  }
} catch (error) {
  console.warn(`   ⚠️  Backup creation failed: ${error.message}`);
  hasWarnings = true;
}

// ==========================================
// 8. Validate and Update Documentation
// ==========================================
console.log('📚 Validating and updating documentation...');
try {
  const docs = [
    'SETUP_GUIDE.md',
    'ADMIN_USER_GUIDE.md',
    'DEMO_GUIDE.md',
    'QUICK_REFERENCE.md',
    'BACKUP_GUIDE.md',
    'FREE_COMMUNICATIONS_SETUP.md',
    'COMMUNICATIONS_IMPLEMENTATION.md',
    'VALUE_PROPOSITION_REPORT.md',
    'DEPLOYMENT_SCRIPTS.md',
    'SCRIPTS_QUICK_REF.md',
    'AUTO_DOCUMENTATION_SYSTEM.md'
  ];
  
  let missingDocs = [];
  let totalLines = 0;
  let updatedDocs = 0;
  const today = new Date().toISOString().split('T')[0];
  
  // Check and update all documentation files
  for (const doc of docs) {
    const docPath = path.join(ROOT_DIR, doc);
    if (!fs.existsSync(docPath)) {
      missingDocs.push(doc);
      hasWarnings = true;
    } else {
      let content = fs.readFileSync(docPath, 'utf8');
      totalLines += content.split('\n').length;
      
      // Update "Last Updated" timestamp in each doc
      let updated = false;
      if (content.includes('Last Updated:')) {
        const oldContent = content;
        content = content.replace(/Last Updated: \d{4}-\d{2}-\d{2}/g, `Last Updated: ${today}`);
        if (content !== oldContent) {
          fs.writeFileSync(docPath, content, 'utf8');
          updated = true;
          updatedDocs++;
        }
      } else if (content.includes('**Report Date:**') || content.includes('Report Date:')) {
        // Update report date format
        const oldContent = content;
        content = content.replace(/\*\*Report Date:\*\* [^\n]+/g, `**Last Updated:** ${today}`);
        content = content.replace(/Report Date: [^\n]+/g, `Last Updated: ${today}`);
        if (content !== oldContent) {
          fs.writeFileSync(docPath, content, 'utf8');
          updated = true;
          updatedDocs++;
        }
      } else {
        // Add Last Updated if it doesn't exist (after first heading)
        const oldContent = content;
        if (content.includes('# ')) {
          // Find first markdown heading
          const lines = content.split('\n');
          let insertIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('# ')) {
              insertIndex = i + 1;
              // Skip any existing metadata lines
              while (insertIndex < lines.length && (lines[insertIndex].startsWith('**') || lines[insertIndex].trim() === '')) {
                insertIndex++;
              }
              break;
            }
          }
          if (insertIndex > 0 && insertIndex < lines.length) {
            lines.splice(insertIndex, 0, `\n**Last Updated:** ${today}\n`);
            content = lines.join('\n');
          }
        }
        if (content !== oldContent) {
          fs.writeFileSync(docPath, content, 'utf8');
          updated = true;
          updatedDocs++;
        }
      }
    }
  }
  
  if (missingDocs.length > 0) {
    console.warn(`   ⚠️  Missing documentation: ${missingDocs.join(', ')}`);
  } else {
    console.log(`   ✅ All ${docs.length} documentation files present`);
  }
  
  console.log(`   ℹ️  Total documentation: ${totalLines.toLocaleString()} lines`);
  if (updatedDocs > 0) {
    console.log(`   ✅ Updated timestamps in ${updatedDocs} documentation files`);
  }
  
  // Update README.md with current stats
  const readmePath = path.join(ROOT_DIR, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    // Update "Last Updated" date
    if (readme.includes('Last Updated:')) {
      readme = readme.replace(/Last Updated: \d{4}-\d{2}-\d{2}/g, `Last Updated: ${today}`);
    } else {
      // Add last updated if it doesn't exist
      if (readme.includes('# ')) {
        readme = readme.replace(/(# [^\n]+)/, `$1\n\n**Last Updated:** ${today}`);
      }
    }
    
    // Get package.json version
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    
    // Update version in README if it exists
    if (readme.includes('Version:')) {
      readme = readme.replace(/Version: [\d.]+/g, `Version: ${packageJson.version}`);
    }
    
    fs.writeFileSync(readmePath, readme, 'utf8');
    console.log('   ✅ Updated README.md with current date and version');
  }
  
  // Generate/Update FEATURE_LIST.md
  const featureListPath = path.join(ROOT_DIR, 'FEATURE_LIST.md');
  const serverContent = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
  
  const features = [
    { name: 'JWT Authentication', present: /jwt\.sign|jwt\.verify/.test(serverContent) },
    { name: 'Password Hashing (bcrypt)', present: /bcrypt/.test(serverContent) },
    { name: 'AES-256 Encryption', present: /aes-256-gcm/.test(serverContent) },
    { name: 'Automatic Backups', present: /createAutoBackup/.test(serverContent) },
    { name: 'Manual Backups', present: /createManualBackup/.test(serverContent) },
    { name: 'Client Management', present: /\/api\/admin\/clients/.test(serverContent) },
    { name: 'Booking System', present: /\/api\/bookings/.test(serverContent) },
    { name: 'Demo Mode', present: /DEMO-2026/.test(serverContent) },
    { name: 'Rate Limiting', present: /rateLimit/.test(serverContent) },
    { name: 'CORS Protection', present: /cors/.test(serverContent) },
    { name: 'Helmet Security', present: /helmet/.test(serverContent) },
    { name: 'Content Management', present: /\/api\/admin\/content/.test(serverContent) },
    { name: 'Settings Management', present: /\/api\/admin\/settings/.test(serverContent) },
    { name: 'Email Notifications', present: /nodemailer|resend|brevo/.test(serverContent) },
    { name: 'SMS Notifications', present: /textbelt|twilio/.test(serverContent) }
  ];
  
  const enabledFeatures = features.filter(f => f.present);
  
  const featureListContent = `# Feature List - Ravi Sacred Healing

**Last Updated:** ${today}  
**Total Features:** ${enabledFeatures.length}/${features.length}

## ✅ Enabled Features

${enabledFeatures.map(f => `- ✅ ${f.name}`).join('\n')}

${features.filter(f => !f.present).length > 0 ? `## ⚠️ Disabled Features\n\n${features.filter(f => !f.present).map(f => `- ⚠️ ${f.name}`).join('\n')}` : ''}

---

## Documentation

- [Setup Guide](SETUP_GUIDE.md)
- [Admin User Guide](ADMIN_USER_GUIDE.md)
- [Demo Guide](DEMO_GUIDE.md)
- [Backup Guide](BACKUP_GUIDE.md)
- [Communications Setup](FREE_COMMUNICATIONS_SETUP.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Deployment Scripts](DEPLOYMENT_SCRIPTS.md)
- [Value Proposition](VALUE_PROPOSITION_REPORT.md)

---

Built by Anth@StructuredForGrowth.com
`;
  
  fs.writeFileSync(featureListPath, featureListContent, 'utf8');
  console.log('   ✅ Generated/updated FEATURE_LIST.md');
  console.log(`   ℹ️  Active features: ${enabledFeatures.length}/${features.length}`);
  
  console.log();
} catch (error) {
  console.error(`   ❌ Documentation error: ${error.message}`);
  hasWarnings = true;
}

// ==========================================
// 9. Environment Variables Check
// ==========================================
console.log('🌍 Environment variables checklist...');
const requiredEnvVars = [
  'JWT_SECRET',
  'ADMIN_PASSWORD',
  'PORT (optional, defaults to 3000)'
];

console.log('   Ensure these are set on your hosting platform:');
requiredEnvVars.forEach(v => console.log(`   • ${v}`));
console.log();

// ==========================================
// 10. Final Deployment Summary
// ==========================================
console.log('═══════════════════════════════════════════');
if (hasErrors) {
  console.log('❌ PRE-DEPLOY VALIDATION FAILED');
  console.log('═══════════════════════════════════════════\n');
  console.log('⚠️  CRITICAL ERRORS DETECTED - DO NOT DEPLOY\n');
  console.log('Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  PRE-DEPLOY VALIDATION PASSED WITH WARNINGS');
  console.log('═══════════════════════════════════════════\n');
  console.log('✅ No critical errors found\n');
  console.log('⚠️  Warnings detected - review before deploying:\n');
  console.log('   • Check warnings above and address if needed');
  console.log('   • Verify environment variables are set');
  console.log('   • Ensure backup systems are working\n');
  console.log('Code is ready for deployment with caution. 🚀\n');
  process.exit(0);
} else {
  console.log('✅ PRE-DEPLOY VALIDATION PASSED');
  console.log('═══════════════════════════════════════════\n');
  console.log('🎉 All checks passed! Ready for deployment.\n');
  console.log('📋 Final deployment checklist:');
  console.log('   ✓ All critical files present');
  console.log('   ✓ Server configuration validated');
  console.log('   ✓ Security checks passed');
  console.log('   ✓ Data directories configured');
  console.log('   ✓ Pre-deploy backup created');
  console.log('   ✓ Documentation complete\n');
  console.log('🚀 Ready to deploy to production!\n');
  process.exit(0);
}
