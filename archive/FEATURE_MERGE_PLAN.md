# 🔀 Feature Merge Plan: Ravi → Main Template

**Date**: 2026-02-03  
**Source Branch**: `ravi-sacred-healing`  
**Target Branch**: `main` (client-booking-system template)  
**Purpose**: Port new features to main template while keeping it generic

---

## 📋 Features to Port from Ravi Branch

### 1. Blog/Vlog System ✅
**Files to Merge:**
- `server.js` - Blog API endpoints (lines 1604-1697)
- `public/admin.html` - Blog management section (lines 2999-5539, 9647-9816)
- `public/blog.html` - Public blog page (entire file)
- `public/index.html` - Blog link (lines 70-76)

**Modifications Required:**
- Make categories configurable in settings (not hardcoded "Sensual/Spiritual")
- Default categories: "Category A" and "Category B" 
- Remove emoji icons (🔥 ✨) - make configurable
- Update terminology: "Blog & Vlogs" → "Blog & Media"

### 2. SMS Messaging Integration ✅
**Files to Merge:**
- `communications.js` - Already generic
- `server.js` - SMS notification endpoints

**Modifications Required:**
- Already template-ready (provider-agnostic)
- Document as optional feature in setup

### 3. CSV Client Import ✅
**Files to Merge:**
- `public/admin.html` - CSV import function

**Modifications Required:**
- None - already generic

### 4. Available Hours API ✅
**Files to Merge:**
- `server.js` - `/api/available-hours` endpoint (lines 2070-2101)

**Modifications Required:**
- None - already generic

### 5. Enhanced Backup System ✅
**Files to Merge:**
- `server.js` - Improved backup logic

**Modifications Required:**
- None - already generic

### 6. Pre-Deploy Automation ✅
**Files to Merge:**
- `scripts/pre-deploy.js` - Entire file

**Modifications Required:**
- Update CONFIG.branch to 'main'
- Make branch configurable
- Add template-specific checks

---

## 🚫 Content to STRIP (Ravi-Specific)

### Branding & Messaging
- [ ] All instances of "Ravi"
- [ ] "Sacred Healing" references
- [ ] Spiritual terminology (unless in customizable settings)
- [ ] "Sensual Arts" branding
- [ ] Personal photos/avatars

### Data Files
- [ ] `data/clients.enc` - Delete
- [ ] `data/bookings.enc` - Delete
- [ ] `data/inquiries.enc` - Delete
- [ ] `data/blog_posts.enc` - Delete
- [ ] `data/invitation_codes.enc` - Delete
- [ ] `data/magic_links.enc` - Delete
- [ ] `data/backups/*` - Delete all backups

### Documentation
- [ ] `VALUE_PROPOSITION_REPORT.md` - Remove Ravi specifics, generalize
- [ ] Custom guides mentioning Ravi's practice

### Code References
Search and replace:
```bash
# Find all "Ravi" mentions
grep -r "Ravi" --include="*.js" --include="*.html" --include="*.md"

# Find "Sacred Healing" mentions
grep -r "Sacred Healing" --include="*.js" --include="*.html"

# Find spiritual-specific terms
grep -r "sensual\|spiritual\|tantric" -i --include="*.js" --include="*.html"
```

---

## ✅ Keep Generic (Already Template-Ready)

### Core System
- ✅ Authentication system (JWT + bcrypt)
- ✅ Encryption (AES-256-GCM)
- ✅ Email integration (provider-agnostic)
- ✅ Booking system
- ✅ Client portal
- ✅ Admin dashboard
- ✅ Privacy/GDPR compliance

### File Structure
- ✅ `server.js` - Generic API
- ✅ `public/admin.html` - Generic admin UI
- ✅ `public/portal.html` - Generic client portal
- ✅ `public/app.js` - Generic frontend logic
- ✅ `public/styles.css` - Generic styling

---

## 🔧 Merge Strategy

### Phase 1: Preparation
1. Checkout main branch: `git checkout main`
2. Create feature branch: `git checkout -b feature/merge-ravi-enhancements`
3. Document current main branch features

### Phase 2: Copy Files
1. Copy new files from ravi-sacred-healing:
   - `public/blog.html`
   - Enhanced `scripts/pre-deploy.js`

2. Merge code changes:
   - Blog API endpoints → `server.js`
   - Blog admin UI → `public/admin.html`
   - Available hours API → `server.js`

### Phase 3: Sanitization
1. **Global Search & Replace:**
   ```bash
   # Remove "Ravi" references
   find . -type f \( -name "*.js" -o -name "*.html" -o -name "*.md" \) -exec sed -i 's/Ravi/[CLIENT_NAME]/g' {} +
   
   # Remove "Sacred Healing"
   find . -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i 's/Sacred Healing/[BUSINESS_NAME]/g' {} +
   ```

2. **Manual Review:**
   - Check all HTML comments
   - Review all console.log messages
   - Check email templates
   - Review admin dashboard labels

3. **Configuration File:**
   Create `config.template.js`:
   ```javascript
   module.exports = {
     branding: {
       businessName: '[BUSINESS_NAME]',
       ownerName: '[CLIENT_NAME]',
       blogCategories: [
         { id: 'category_a', name: 'Category A', icon: '📝' },
         { id: 'category_b', name: 'Category B', icon: '🎬' }
       ]
     }
   };
   ```

### Phase 4: Data Reset
1. Delete all encrypted data files
2. Create empty data structure:
   ```bash
   mkdir -p data/backups/auto
   mkdir -p data/backups/manual
   touch data/.gitkeep
   ```

3. Update `.gitignore`:
   ```
   # Data files (never commit)
   data/*.enc
   data/backups/**/*.enc
   ```

### Phase 5: Documentation Update
1. Update `README.md`:
   - Add blog system to features
   - Document SMS as optional
   - Update setup steps

2. Update `SETUP_GUIDE.md`:
   - Blog system configuration
   - SMS provider setup (optional)
   - Custom categories

3. Create `FEATURE_CHANGELOG.md`:
   - Blog/Vlog system
   - SMS messaging
   - CSV import
   - Available hours API
   - Enhanced backups
   - Pre-deploy automation

### Phase 6: Testing
1. Fresh install test:
   - Clone repository
   - Run `npm install`
   - Run `npm start`
   - Verify no Ravi references in UI
   - Test all features

2. Feature verification:
   - Blog CRUD operations
   - SMS sending (if configured)
   - CSV import
   - Available hours API
   - Backups

### Phase 7: Merge to Main
1. Commit all changes:
   ```bash
   git add .
   git commit -m "feat: merge enhancements from ravi-sacred-healing
   
   - Blog/vlog system with configurable categories
   - SMS messaging integration (optional)
   - CSV client import
   - Available hours public API
   - Enhanced backup system
   - Pre-deploy automation script
   
   All Ravi-specific branding removed.
   All features genericized for template use."
   ```

2. Merge to main:
   ```bash
   git checkout main
   git merge feature/merge-ravi-enhancements
   git push origin main
   ```

---

## 📝 Checklist

### Pre-Merge Verification
- [ ] All "Ravi" mentions removed/genericized
- [ ] All "Sacred Healing" mentions removed
- [ ] Blog categories made configurable
- [ ] Spiritual terminology replaced with generic terms
- [ ] Data files deleted/reset
- [ ] Documentation updated with new features
- [ ] `.env.example` updated with SMS variables
- [ ] No client data in repository

### Post-Merge Verification
- [ ] Fresh install works without errors
- [ ] Admin dashboard shows generic branding
- [ ] Blog system creates posts successfully
- [ ] CSV import works
- [ ] Available hours API returns data
- [ ] Pre-deploy script runs successfully
- [ ] All tests pass
- [ ] No console warnings about missing files

### Documentation Verification
- [ ] README.md lists all features
- [ ] SETUP_GUIDE.md covers new features
- [ ] ADMIN_USER_GUIDE.md includes blog section
- [ ] FEATURE_LIST.md updated
- [ ] DEPLOYMENT.md is generic (not Ravi-specific)

---

## 🎯 Success Criteria

### Template Quality
- ✅ Zero hardcoded client-specific data
- ✅ All branding configurable
- ✅ Clean, professional code
- ✅ Comprehensive documentation
- ✅ Easy to customize for new clients

### Feature Completeness
- ✅ Blog system fully functional
- ✅ SMS optional but working
- ✅ All admin features working
- ✅ Client portal unchanged (generic)
- ✅ Security maintained

### Professional Standard
- ✅ No TODO comments
- ✅ Consistent code style
- ✅ Clear variable names
- ✅ Proper error handling
- ✅ Production-ready

---

## 📊 Impact Analysis

### Lines of Code Added to Main
- Blog system: ~800 lines
- Available hours API: ~35 lines
- Pre-deploy script: ~600 lines
- **Total**: ~1,435 new lines

### New Dependencies
- None (all using existing stack)

### Breaking Changes
- None (all additive features)

### Migration Guide for Existing Users
Not needed - all features are additive and optional.

---

## 🚀 Timeline

| Phase | Estimated Time | Priority |
|-------|---------------|----------|
| 1. Preparation | 30 min | High |
| 2. Copy Files | 1 hour | High |
| 3. Sanitization | 2 hours | Critical |
| 4. Data Reset | 15 min | High |
| 5. Documentation | 1 hour | High |
| 6. Testing | 1 hour | Critical |
| 7. Merge | 30 min | High |
| **Total** | **6 hours** | - |

---

## 💡 Notes

- Keep `ravi-sacred-healing` branch intact (never delete)
- This is a one-way merge (features go to main, not back)
- Future Ravi-specific features stay on `ravi-sacred-healing`
- Main branch remains the generic template
- Both branches evolve independently after merge

---

**Next Action**: Review this plan, then execute Phase 1 when ready to merge.
