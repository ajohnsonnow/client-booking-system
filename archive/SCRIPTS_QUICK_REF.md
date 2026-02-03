# 🚀 Deployment Scripts - Quick Reference


**Last Updated:** 2026-01-28

## Commands

```bash
npm run pre-push      # Fast validation before git push
npm run pre-deploy    # Full production readiness check
npm run validate      # Same as pre-push
```

## When to Use

| Command | When | Time | Purpose |
|---------|------|------|---------|
| `pre-push` | Before `git push` | ~1s | Code quality validation |
| `pre-deploy` | Before deployment | ~2-3s | Production readiness + backup |
| `validate` | Anytime | ~1s | Quick health check |

## Exit Codes

- ✅ **0** = Passed, proceed with action
- ❌ **1** = Failed, fix errors first

## What's Validated

### Pre-Push (8 categories)
✓ Critical files exist  
✓ package.json valid  
✓ HTML structure  
✓ Data directories  
✓ Server features  
✓ No exposed secrets  
✓ Developer credits  
✓ **Documentation + README updates**  

### Pre-Deploy (10 categories)
✓ All pre-push checks  
✓ Production config  
✓ Security audit  
✓ Write permissions  
✓ **Creates backup** 💾  
✓ **Auto-generates FEATURE_LIST.md**  
✓ **Updates README.md timestamps**  
✓ Environment vars checklist  

## Files Created

```
scripts/50 lines - validation + docs)
  ├── pre-deploy.js        (500 lines - deployment + docs)
  └── README.md            (Full documentation)

DEPLOYMENT_SCRIPTS.md     (Quick start guide)
FEATURE_LIST.md           (Auto-generated on pre-deploy
DEPLOYMENT_SCRIPTS.md     (This quick start guide)
```

## Quick Troubleshooting

| Error | Fix |
|-------|-----|
| Missing file | Check file exists in correct location |
| Data directory error | Run `pre-deploy` to auto-create |
| Invalid package.json | Check required fields (name, version, type) |
| .env not in .gitignore | Add `.env` to .gitignore |

## Automation

### Git Hook (Optional)
```bash
# Auto-run on every git push
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
npm run pre-push
EOF
chmod +x .git/hooks/pre-push
```

### CI/CD Pipeline
```yaml
- name: Validate
  run: npm run pre-deploy
```

## Example Output

### ✅ Success
```
═══════════════════════════════════════════
✅ PRE-PUSH VALIDATION PASSED
═══════════════════════════════════════════
Code is ready to be pushed! 🚀
```

### ⚠️ Warnings (Non-blocking)
```
═══════════════════════════════════════════
⚠️  PRE-DEPLOY VALIDATION PASSED WITH WARNINGS
═══════════════════════════════════════════
Code is ready for deployment with caution. 🚀
```

### ❌ Failure
```
═══════════════════════════════════════════
❌ PRE-PUSH VALIDATION FAILED
═══════════════════════════════════════════
Please fix the errors above before pushing.
```

## Benefits

✓ Catch errors before CI/CD  
✓ Automatic pre-deploy backups  
✓ **Auto-update documentation**  
✓ **Generate feature lists**  
✓ Security scanning  
✓ Zero false positives  
✓ Clear, actionable feedback  

---

**Ready to deploy with confidence!** 🚀

Built by Anth@StructuredForGrowth.com
