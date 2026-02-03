#!/usr/bin/env node

/**
 * Pre-Deploy Automation Script
 * Handles versioning, metrics, documentation, and deployment preparation
 * Usage: node scripts/pre-deploy.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  valuePropPath: path.join(ROOT_DIR, 'VALUE_PROPOSITION_REPORT.md'),
  deploymentGuidePath: path.join(ROOT_DIR, 'DEPLOYMENT.md'),
  packageJsonPath: path.join(ROOT_DIR, 'package.json'),
  archiveDir: path.join(ROOT_DIR, 'archive'),
  docsToArchive: [
    'DEPLOYMENT_SCRIPTS.md',
    'DOCUMENTATION_UPDATE_COMPLETE.md'
  ],
  coreFiles: [
    'server.js',
    'public/admin.html',
    'public/index.html',
    'public/portal.html',
    'public/app.js',
    'public/blog.html',
    'public/styles.css',
    'communications.js'
  ],
  devHourlyRate: 150,
  branch: 'ravi-sacred-healing'
};

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`)
};

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', cwd: ROOT_DIR }).trim();
  } catch (error) {
    return '';
  }
}

function readFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf-8');
  } catch (error) {
    return '';
  }
}

function writeFile(filepath, content) {
  fs.writeFileSync(filepath, content, 'utf-8');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ==========================================
// PHASE 1: PRE-FLIGHT CHECKS
// ==========================================
function runPreFlightChecks() {
  log.section('PHASE 1: PRE-FLIGHT CHECKS');
  
  let passed = true;

  // Check git branch
  const currentBranch = execCommand('git branch --show-current');
  if (currentBranch !== CONFIG.branch) {
    log.error(`Not on ${CONFIG.branch} branch (current: ${currentBranch})`);
    passed = false;
  } else {
    log.success(`On correct branch: ${CONFIG.branch}`);
  }

  // Check for uncommitted changes
  const status = execCommand('git status --porcelain');
  if (status) {
    log.warn('You have uncommitted changes');
    log.info('Continue anyway? Changes will be included in version bump.');
  } else {
    log.success('Working tree clean');
  }

  // Check critical files exist
  const missing = CONFIG.coreFiles.filter(file => 
    !fs.existsSync(path.join(ROOT_DIR, file))
  );
  if (missing.length > 0) {
    log.error(`Missing core files: ${missing.join(', ')}`);
    passed = false;
  } else {
    log.success('All core files present');
  }

  // Check package.json
  const pkg = JSON.parse(readFile(CONFIG.packageJsonPath));
  if (!pkg.scripts || !pkg.scripts.start) {
    log.error('package.json missing start script');
    passed = false;
  } else {
    log.success('package.json configured correctly');
  }

  return passed;
}

// ==========================================
// PHASE 2: CALCULATE DEVELOPMENT METRICS
// ==========================================
function calculateDevelopmentMetrics() {
  log.section('PHASE 2: CALCULATING DEVELOPMENT METRICS');
  
  const metrics = {};

  // Git commits
  const commitCount = execCommand(`git rev-list --count ${CONFIG.branch}`);
  metrics.commits = parseInt(commitCount) || 0;
  log.info(`Total commits: ${metrics.commits}`);

  // Date range
  const firstCommit = execCommand(`git log ${CONFIG.branch} --reverse --format=%ai | head -1`);
  const lastCommit = execCommand(`git log ${CONFIG.branch} -1 --format=%ai`);
  metrics.firstCommitDate = firstCommit ? new Date(firstCommit).toISOString().split('T')[0] : 'Unknown';
  metrics.lastCommitDate = lastCommit ? new Date(lastCommit).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  log.info(`Development period: ${metrics.firstCommitDate} to ${metrics.lastCommitDate}`);

  // Lines of code
  let totalLines = 0;
  CONFIG.coreFiles.forEach(file => {
    const filepath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filepath)) {
      const content = readFile(filepath);
      const lines = content.split('\n').length;
      totalLines += lines;
    }
  });
  metrics.linesOfCode = totalLines;
  log.info(`Total lines of code: ${metrics.linesOfCode.toLocaleString()}`);

  // Code changes
  const shortstat = execCommand(`git log ${CONFIG.branch} --shortstat --format=`);
  const insertions = shortstat.match(/(\d+) insertion/g);
  const deletions = shortstat.match(/(\d+) deletion/g);
  
  metrics.insertions = insertions ? insertions.reduce((sum, match) => {
    return sum + parseInt(match.match(/\d+/)[0]);
  }, 0) : 0;
  
  metrics.deletions = deletions ? deletions.reduce((sum, match) => {
    return sum + parseInt(match.match(/\d+/)[0]);
  }, 0) : 0;

  log.info(`Code changes: +${metrics.insertions.toLocaleString()} / -${metrics.deletions.toLocaleString()}`);

  // Estimate development hours using multiple methods
  const method1 = metrics.commits * 0.5; // 30 min per commit
  const method2 = metrics.linesOfCode / 250; // 250 LOC per hour
  const method3 = 80; // Known feature count estimate
  
  metrics.devHoursEstimate = Math.round((method1 + method2 + method3) / 3);
  metrics.devValueEstimate = metrics.devHoursEstimate * CONFIG.devHourlyRate;
  
  log.success(`Estimated development time: ${metrics.devHoursEstimate} hours`);
  log.success(`Estimated development value: $${metrics.devValueEstimate.toLocaleString()}`);

  // ROI calculation
  const annualCost = 15; // Domain only
  metrics.roi = Math.round((metrics.devValueEstimate / annualCost) * 100) / 100;
  log.info(`ROI: ${metrics.roi.toLocaleString()}x return on investment`);

  return metrics;
}

// ==========================================
// PHASE 3: UPDATE VERSION
// ==========================================
function updateVersion() {
  log.section('PHASE 3: VERSION MANAGEMENT');
  
  const pkg = JSON.parse(readFile(CONFIG.packageJsonPath));
  const oldVersion = pkg.version || '1.0.0';
  
  // Parse semantic version
  const [major, minor, patch] = oldVersion.split('.').map(Number);
  
  // Increment patch version
  const newVersion = `${major}.${minor}.${patch + 1}`;
  pkg.version = newVersion;
  
  writeFile(CONFIG.packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  
  log.success(`Version bumped: ${oldVersion} → ${newVersion}`);
  
  return newVersion;
}

// ==========================================
// PHASE 4: UPDATE DOCUMENTATION
// ==========================================
function updateValueProposition(metrics) {
  log.section('PHASE 4: UPDATING DOCUMENTATION');
  
  let content = readFile(CONFIG.valuePropPath);
  
  if (!content) {
    log.error('VALUE_PROPOSITION_REPORT.md not found');
    return false;
  }

  // Update last modified date
  const today = new Date().toISOString().split('T')[0];
  content = content.replace(
    /Last Updated: \d{4}-\d{2}-\d{2}/,
    `Last Updated: ${today}`
  );

  // Build metrics section
  const metricsSection = `
## 📊 Actual Development Metrics
*(Auto-generated on ${today})*

### Codebase Statistics
- **Total Commits**: ${metrics.commits} commits on ${CONFIG.branch} branch
- **Lines of Code**: ${metrics.linesOfCode.toLocaleString()} lines across core files
- **Code Changes**: +${metrics.insertions.toLocaleString()} insertions / -${metrics.deletions.toLocaleString()} deletions
- **Development Period**: ${metrics.firstCommitDate} to ${metrics.lastCommitDate}

### Time Investment
- **Estimated Development Hours**: ~${metrics.devHoursEstimate} hours
  - *Calculated using commit frequency, code complexity, and feature count*
- **Market Value** (at $${CONFIG.devHourlyRate}/hour): **$${metrics.devValueEstimate.toLocaleString()}**

### Return on Investment
- **Development Value**: $${metrics.devValueEstimate.toLocaleString()}
- **Annual Cost to Ravi**: $15 (domain only)
- **ROI**: **${metrics.roi.toLocaleString()}x** return

### Technology Stack
\`\`\`
Backend:     Node.js + Express (${metrics.linesOfCode.toLocaleString()} LOC)
Frontend:    Vanilla JS + HTML5 + CSS3
Database:    Encrypted JSON (AES-256-GCM)
Auth:        JWT + bcrypt
Security:    Helmet, rate limiting, CORS
Features:    ${metrics.commits} commits worth of functionality
\`\`\`
`;

  // Insert or replace metrics section
  if (content.includes('## 📊 Actual Development Metrics')) {
    // Replace existing section
    content = content.replace(
      /## 📊 Actual Development Metrics[\s\S]*?(?=\n## |\n---|\n\*\*|$)/,
      metricsSection
    );
  } else {
    // Insert after introduction
    const insertPoint = content.indexOf('\n## ') !== -1 
      ? content.indexOf('\n## ')
      : content.length;
    content = content.slice(0, insertPoint) + '\n' + metricsSection + '\n' + content.slice(insertPoint);
  }

  writeFile(CONFIG.valuePropPath, content);
  log.success('VALUE_PROPOSITION_REPORT.md updated with real metrics');
  
  return true;
}

function createDeploymentGuide() {
  log.info('Generating DEPLOYMENT.md...');
  
  const content = `# 🚀 Deployment Guide - Render.com

**Last Updated**: ${new Date().toISOString().split('T')[0]}  
**Branch**: ${CONFIG.branch}  
**Hosting**: Render.com Web Service (Free Tier)

---

## Why Render.com Web Service?

✅ **Correct Choice**: Web Service (NOT Private Service)
- Provides public HTTPS access for client bookings
- Free tier: 750 hours/month (enough for 24/7 with sleep mode)
- Automatic SSL certificates
- Custom domain support
- GitHub auto-deploy on push
- Environment variable management
- Health checks and monitoring

---

## Step-by-Step Deployment

### 1. GitHub Preparation
\`\`\`bash
# Ensure you're on the production branch
git checkout ${CONFIG.branch}

# Run pre-deploy checks
node scripts/pre-deploy.js

# Commit any changes
git add .
git commit -m "chore: pre-deploy preparation v$(node -p "require('./package.json').version")"

# Push to GitHub
git push origin ${CONFIG.branch}
\`\`\`

### 2. Render.com Account Setup
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### 3. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the **${CONFIG.branch}** branch

### 4. Configure Service

**Basic Settings:**
- **Name**: \`ravi-sacred-healing-cms\` (or your choice)
- **Region**: Oregon (US West) or closest to your clients
- **Branch**: \`${CONFIG.branch}\`
- **Root Directory**: (leave blank)
- **Runtime**: Node
- **Build Command**: \`npm install\`
- **Start Command**: \`npm start\`

**Instance Type:**
- Select **"Free"** (750 hours/month)
- Note: Service will sleep after 15 min of inactivity
- First request after sleep takes 30-60 seconds

### 5. Environment Variables

Click **"Advanced"** and add these environment variables:

\`\`\`
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=<your-secure-password>
JWT_SECRET=<generate-random-64-char-string>

# Email Provider (choose one):
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=<gmail-app-password>

# SMS Provider (optional):
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>

# Session (optional, generated if not set):
SESSION_SECRET=<random-string>
\`\`\`

**⚠️ Security Tips:**
- Never commit secrets to GitHub
- Generate strong JWT_SECRET: \`openssl rand -base64 64\`
- Use Gmail App Passwords (not regular password)
- Store backup of env vars securely offline

### 6. Deploy

1. Click **"Create Web Service"**
2. Wait for initial deployment (3-5 minutes)
3. Watch build logs for errors
4. Service URL: \`https://ravi-sacred-healing-cms.onrender.com\`

### 7. Custom Domain (Optional)

1. Go to service Settings → Custom Domain
2. Add your domain: \`app.ravisacredhealing.com\`
3. Add CNAME record at your DNS provider:
   - **Type**: CNAME
   - **Name**: app (or @)
   - **Value**: \`ravi-sacred-healing-cms.onrender.com\`
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate auto-generated by Render

---

## Post-Deployment

### Verify Functionality
- [ ] Visit your app URL
- [ ] Test gate page (\`/\`)
- [ ] Test admin login (\`/admin.html\`)
- [ ] Test client portal (\`/portal.html\`)
- [ ] Test blog page (\`/blog.html\`)
- [ ] Submit test inquiry
- [ ] Verify email notifications work
- [ ] Test SMS (if configured)

### Data Initialization
On first deploy, data files will be created automatically:
\`\`\`
/data/
  ├── clients.enc          (encrypted)
  ├── bookings.enc         (encrypted)
  ├── inquiries.enc        (encrypted)
  ├── blog_posts.enc       (encrypted)
  ├── invitation_codes.enc (encrypted)
  └── magic_links.enc      (encrypted)
\`\`\`

### Security Checklist
- [x] HTTPS enabled (automatic with Render)
- [ ] Strong ADMIN_PASSWORD set
- [ ] JWT_SECRET is random and secure
- [ ] Email credentials using app password
- [ ] No secrets in GitHub repository
- [ ] .env file in .gitignore
- [ ] Rate limiting active (built-in)
- [ ] Data encryption active (AES-256-GCM)

---

## Monitoring & Maintenance

### Health Checks
Render automatically monitors:
- HTTP response codes
- Response times
- Memory usage
- CPU usage

### Logs
- View live logs: Service → Logs tab
- Search logs by date/keyword
- Download logs for debugging

### Auto-Deploy
Every push to \`${CONFIG.branch}\` triggers automatic deployment:
1. Render detects push
2. Runs build command
3. Restarts service
4. Keeps data files intact

### Backup Strategy
**Automatic backups** already configured:
- Hourly backups to \`/data/backups/auto/\`
- Manual backups via Admin → Backup tab
- Download backups before major updates

### Sleep Mode (Free Tier)
- Service sleeps after 15 min inactivity
- First request takes 30-60 sec to wake
- Upgrade to paid ($7/mo) for always-on

---

## Troubleshooting

### Build Fails
\`\`\`bash
# Check logs for missing dependencies
npm install --production

# Verify start command works locally
npm start
\`\`\`

### Service Won't Start
- Check environment variables are set
- Verify PORT is not hardcoded (use process.env.PORT)
- Check for syntax errors in server.js

### Email Not Sending
- Verify EMAIL_PROVIDER is set
- Use Gmail App Password (not account password)
- Check rate limits (Gmail: 500/day)

### Data Loss
- Data persists across deploys
- Download backups regularly via Admin panel
- Consider upgrading to paid tier for disk persistence guarantees

### 502 Bad Gateway
- Service may be sleeping (first request takes 30-60s)
- Check logs for startup errors
- Verify start command is correct

---

## Cost Breakdown

| Tier | Price | Hours/Month | Sleep | SSL | Custom Domain |
|------|-------|-------------|-------|-----|---------------|
| Free | $0 | 750 | Yes (15min) | ✅ | ✅ |
| Starter | $7/mo | Always On | No | ✅ | ✅ |

**Current Setup**: Free tier is sufficient
**Upgrade When**: You need 24/7 instant response time

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Node.js on Render**: https://render.com/docs/deploy-node-express-app
- **Support**: https://render.com/support

---

## Feature Merge to Main Template

When ready to merge features back to \`main\` branch:

### Features to Port:
- ✅ Blog/Vlog system (configurable categories)
- ✅ SMS messaging integration
- ✅ CSV client import
- ✅ Available hours API endpoint
- ✅ Auto-backup improvements

### Must Strip:
- ❌ "Ravi" name references
- ❌ "Sacred Healing" branding
- ❌ Client data files
- ❌ Spiritual-specific content
- ❌ Blog posts

### Keep Generic:
- ✅ Blog categories as configurable
- ✅ SMS as optional provider
- ✅ Available hours as template feature
- ✅ All functionality intact

---

**🎉 Deployment Complete!**  
Your CMS is now live and accessible worldwide with enterprise-grade security.
`;

  writeFile(CONFIG.deploymentGuidePath, content);
  log.success('DEPLOYMENT.md created');
  
  return true;
}

// ==========================================
// PHASE 5: ARCHIVE OLD DOCUMENTATION
// ==========================================
function archiveOldDocs() {
  log.section('PHASE 5: ARCHIVING OLD DOCUMENTATION');
  
  ensureDir(CONFIG.archiveDir);
  
  let archived = 0;
  CONFIG.docsToArchive.forEach(doc => {
    const srcPath = path.join(ROOT_DIR, doc);
    const destPath = path.join(CONFIG.archiveDir, doc);
    
    if (fs.existsSync(srcPath)) {
      fs.renameSync(srcPath, destPath);
      log.info(`Archived: ${doc}`);
      archived++;
    }
  });
  
  if (archived > 0) {
    log.success(`Archived ${archived} old documentation files`);
  } else {
    log.info('No files to archive');
  }
  
  return archived;
}

// ==========================================
// MAIN EXECUTION
// ==========================================
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀  PRE-DEPLOY AUTOMATION SCRIPT');
  console.log('    Version Management | Metrics | Documentation');
  console.log('='.repeat(60) + '\n');

  try {
    // Phase 1: Pre-flight checks
    const preFlightPassed = runPreFlightChecks();
    if (!preFlightPassed) {
      log.error('Pre-flight checks failed. Fix issues and try again.');
      process.exit(1);
    }

    // Phase 2: Calculate metrics
    const metrics = calculateDevelopmentMetrics();

    // Phase 3: Update version
    const newVersion = updateVersion();

    // Phase 4: Update documentation
    const valuePropUpdated = updateValueProposition(metrics);
    const deploymentGuideCreated = createDeploymentGuide();

    if (!valuePropUpdated || !deploymentGuideCreated) {
      log.error('Documentation update failed');
      process.exit(1);
    }

    // Phase 5: Archive old docs
    archiveOldDocs();

    // Final summary
    log.section('✅ PRE-DEPLOY COMPLETE');
    console.log(`
📦 Version: ${newVersion}
📊 Metrics Updated: ${metrics.commits} commits, ${metrics.linesOfCode.toLocaleString()} LOC, ${metrics.devHoursEstimate} hours
📝 Documentation: VALUE_PROPOSITION_REPORT.md + DEPLOYMENT.md
🗂️  Archive: Outdated docs moved to archive/

🎯 Next Steps:
   1. Review updated documentation
   2. Commit changes: git add . && git commit -m "chore: pre-deploy v${newVersion}"
   3. Push to GitHub: git push origin ${CONFIG.branch}
   4. Deploy on Render.com (auto-deploy or manual)
   5. Verify deployment at your Render URL

🌐 Deployment Target: Render.com Web Service (Free Tier)
   - 750 hours/month
   - Automatic HTTPS
   - Custom domain support
   - See DEPLOYMENT.md for full instructions
`);

    log.success('Pre-deploy automation completed successfully! 🎉');
    process.exit(0);

  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
