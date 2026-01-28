# Deployment & Validation Scripts

This directory contains automated validation scripts to ensure code quality and production readiness.

## 📋 Available Scripts

### 1. Pre-Push Validation (`pre-push.js`)

**Purpose:** Validates code before pushing to Git repository  
**Usage:** `npm run pre-push` or `npm run validate`

**What it checks:**
- ✅ All critical files exist
- ✅ package.json is valid and properly configured
- ✅ HTML files have proper structure and developer credits
- ✅ Data directory structure is correct
- ✅ server.js contains all required features
- ✅ No exposed secrets or API keys in code

**Exit codes:**
- `0` - All checks passed, safe to push
- `1` - Validation failed, fix errors before pushing

---

### 2. Pre-Deploy Validation (`pre-deploy.js`)

**Purpose:** Comprehensive production readiness checks before deployment  
**Usage:** `npm run pre-deploy`

**What it checks:**
- ✅ All critical files and documentation
- ✅ Production configuration (package.json, engines, scripts)
- ✅ Server features (JWT, encryption, backups, error handling)
- ✅ Data directory permissions and write access
- ✅ HTML integrity and security headers
- ✅ Security audit (secrets, .gitignore, encryption)
- ✅ Creates pre-deploy backup of all data
- ✅ Documentation completeness
- ⚠️ Environment variables checklist

**Exit codes:**
- `0` - Ready for production deployment
- `1` - Critical errors found, DO NOT DEPLOY

**Warnings:** Non-critical issues that should be reviewed but don't block deployment.

---

## 🚀 Recommended Workflow

### Before Git Push
```bash
npm run pre-push
```

### Before Deployment
```bash
npm run pre-deploy
```

### Quick Validation
```bash
npm run validate    # Same as pre-push
```

---

## 🔧 Setting Up Git Hooks (Optional)

To automatically run pre-push validation before every git push:

### Windows (PowerShell):
```powershell
$hookContent = @"
#!/bin/sh
npm run pre-push
"@
New-Item -Force -Path ".git/hooks/pre-push" -Value $hookContent
```

### Mac/Linux:
```bash
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
npm run pre-push
EOF
chmod +x .git/hooks/pre-push
```

---

## 📦 What Gets Checked

### Critical Files
- `server.js` - Main application server
- `package.json` - Dependencies and configuration
- `public/*.html` - All HTML pages
- `public/app.js` - Client-side JavaScript
- `public/styles.css` - Stylesheets
- All documentation guides

### Security
- No hardcoded API keys or passwords
- .env file properly gitignored
- JWT secrets use environment variables
- Password hashing with bcrypt
- Data encryption with AES-256-GCM

### Data Protection
- Backup directories exist and are writable
- Data directory has proper permissions
- Pre-deploy creates automatic backup

### Code Quality
- Valid JSON files
- Complete HTML structure
- Required Node.js features present
- Error handling implemented

---

## 🛠️ Troubleshooting

### "Missing critical file" error
**Solution:** Ensure all required files are present. Check the file list in the script.

### "Data directory error"
**Solution:** Run: `npm run pre-deploy` to auto-create directories, or manually create:
```powershell
New-Item -ItemType Directory -Force -Path "data/backups/manual", "data/backups/auto"
```

### "package.json missing required field"
**Solution:** Ensure package.json has:
- `name`
- `version`
- `type: "module"`
- `scripts.start`
- `engines.node`

### ".env file not in .gitignore"
**Solution:** Add `.env` to your `.gitignore` file:
```bash
echo ".env" >> .gitignore
```

---

## 📊 Success Output Examples

### Pre-Push Success ✅
```
🔍 Running Pre-Push Validation...

📋 Checking critical files...
   ✅ All critical files present

📦 Validating package.json...
   ✅ package.json is valid

🌐 Checking HTML files...
   ✅ All HTML files valid

💾 Checking data directory...
   ✅ Data directory structure valid

⚙️  Validating server.js...
   ✅ server.js structure valid

🔒 Checking for exposed secrets...
   ✅ No obvious secrets exposed

═══════════════════════════════════════════
✅ PRE-PUSH VALIDATION PASSED
═══════════════════════════════════════════

Code is ready to be pushed! 🚀
```

### Pre-Deploy Success ✅
```
🚀 Running Pre-Deploy Validation...

[All checks pass...]

═══════════════════════════════════════════
✅ PRE-DEPLOY VALIDATION PASSED
═══════════════════════════════════════════

🎉 All checks passed! Ready for deployment.

📋 Final deployment checklist:
   ✓ All critical files present
   ✓ Server configuration validated
   ✓ Security checks passed
   ✓ Data directories configured
   ✓ Pre-deploy backup created
   ✓ Documentation complete

🚀 Ready to deploy to production!
```

---

## 🔐 Environment Variables

Before deploying, ensure these are set on your hosting platform:

### Required
- `JWT_SECRET` - Secret key for JWT token generation
- `ADMIN_PASSWORD` - Initial admin password (hashed on first use)

### Optional
- `PORT` - Server port (defaults to 3000)
- `NODE_ENV` - Environment (development/production)

---

## 📝 Notes

- **Pre-push** is fast and focused on code quality
- **Pre-deploy** is comprehensive and includes production readiness
- Both scripts automatically create backups when possible
- Scripts are idempotent - safe to run multiple times
- Zero false positives for critical errors
- Warnings are informational, not blockers

---

## 🎯 Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Validate Code
  run: npm run pre-push

- name: Pre-Deploy Checks
  run: npm run pre-deploy
```

---

## 💡 Tips

1. **Run pre-push before every commit** to catch issues early
2. **Run pre-deploy locally** before pushing to production
3. **Review warnings** even if they don't block deployment
4. **Keep scripts updated** as new features are added
5. **Check exit codes** in automation scripts

---

Built by Anth@StructuredForGrowth.com
