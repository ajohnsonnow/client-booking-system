# 🛡️ Automatic Backup System Guide

**Last Updated:** 2026-01-28

## Overview

Your data is now **automatically protected** with a comprehensive backup system that creates encrypted backups after **every single change**. This ensures zero data loss regardless of crashes, bugs, or updates.

---

## How Automatic Backups Work

### Real-Time Protection

Every time you save data, a backup is automatically created:

✅ **Booking confirmed?** → Automatic backup created  
✅ **Setting changed?** → Automatic backup created  
✅ **Testimonial added?** → Automatic backup created  
✅ **Client updated?** → Automatic backup created  

**You don't have to do anything!** The system handles it automatically.

### What Gets Backed Up

The system tracks 4 separate data files:

1. **Bookings** (`bookings.enc`)
   - All booking submissions
   - Status changes (pending → confirmed → completed)
   - Dates, times, services, pricing

2. **Settings** (`settings.enc`)
   - Services list and pricing
   - Availability schedule
   - Email/SMS configuration

3. **Content** (`content.enc`)
   - Testimonials
   - FAQs
   - Website copy

4. **Clients** (`clients.enc`)
   - Client records
   - Session history
   - Total revenue

Each file type has its own backup history.

---

## Backup Types

### Automatic Backups

**Created:** After every data-changing operation  
**Location:** `data/backups/auto/`  
**Format:** `bookings_2026-01-28T14-30-45-123Z.enc`  
**Encryption:** AES-256-GCM (military-grade)  
**Retention:** Last 50 backups per file type  

**File naming:**
- `bookings_[timestamp].enc` - Booking data backups
- `settings_[timestamp].enc` - Settings backups
- `content_[timestamp].enc` - Content backups
- `clients_[timestamp].enc` - Client data backups

**Automatic rotation:**
- System keeps the 50 most recent backups
- Older backups are automatically deleted
- Prevents disk space issues

### Manual Backups

**Created:** When you click "Download Backup"  
**Location:** `data/backups/`  
**Format:** `backup-2026-01-28T14-30-45-123Z.json`  
**Includes:** ALL data (bookings, settings, content, clients, inquiries, codes)  
**Retention:** Last 20 manual backups  

**Use manual backups for:**
- Before major changes
- Weekly/monthly archives
- External storage (USB drive, cloud)
- Disaster recovery planning

---

## Using the Backup System

### Viewing Backups

1. **Login** to admin panel (`/admin.html`)
2. Navigate to **Export & Backup** page
3. Scroll to **"Automatic Backup System"** section
4. View statistics:
   - Total automatic backups
   - Total manual backups
   - Combined size
   - Time of latest backup

### Filtering Backups

Use the filter buttons to view specific types:

- **All** - Show all backups (auto + manual)
- **Bookings** - Only booking backups
- **Settings** - Only settings backups
- **Content** - Only content backups
- **Clients** - Only client backups
- **Manual** - Only manual full backups

### Restoring from Backup

**IMPORTANT:** Restoring replaces current data with backup data!

1. Find the backup you want to restore
2. Click the **↩️ Restore** button
3. Confirm the action
4. Your **current data is automatically backed up** before restoring
5. Selected backup is restored
6. Page refreshes with restored data

**Safety feature:** Before any restore operation, the system creates a manual backup of your current state named:
```
backup-before-restore-[filetype]-[timestamp].json
```

This means you can ALWAYS undo a restore operation!

---

## Backup Protection Features

### What Backups Protect Against

✅ **Server Crashes**
- Power failure
- System crash
- Process termination
- → Latest backup available

✅ **Software Bugs**
- Code errors
- Unexpected behavior
- Data corruption
- → Restore from any point in time

✅ **Bad Updates**
- Failed deployments
- Breaking changes
- Configuration errors
- → Rollback to previous state

✅ **Human Error**
- Accidental deletion
- Wrong data entry
- Mistaken confirmations
- → Restore exact previous state

✅ **Hardware Failures**
- Disk errors (if caught early)
- Memory issues
- File system corruption
- → Backup on different disk location

### What Backups CANNOT Protect Against

❌ **Stolen Encryption Key**
- If `.env` file is compromised
- → Keep `.env` secure and backed up separately

❌ **Manual Backup Deletion**
- If you manually delete backup folder
- → Don't delete `data/backups/` directory

❌ **Complete Disk Failure**
- If entire hard drive fails
- → Use external backups (see below)

❌ **Ransomware/Malware**
- If system is compromised
- → Keep offline backup copies

---

## Best Practices

### Daily Operations

✅ **Let automatic backups work**
- Don't disable or modify backup system
- Trust the automatic rotation
- Check backup stats weekly

✅ **Monitor backup health**
- Admin panel → Export & Backup
- Verify "Latest Backup" is recent
- Check total backup count is growing

✅ **Create manual backups before major changes**
- Bulk data updates
- Settings reconfigurations
- Content overhauls

### Weekly Tasks

✅ **Review backup statistics**
- Verify automatic backups are working
- Check disk space usage
- Confirm all file types are backing up

✅ **Create manual full backup**
- Export & Backup → "Full Backup"
- Download the JSON file
- Store in external location

✅ **Test restore process**
- Pick an old booking backup
- Restore it
- Verify data is correct
- Restore current backup

### Monthly Tasks

✅ **External backup copy**
- Download manual backup
- Copy to USB drive
- Store in safe location
- Keep 3-6 months of archives

✅ **Backup inventory**
- Check total backups
- Verify oldest backup date
- Confirm no gaps in backup history

✅ **Disaster recovery test**
- Simulate data loss
- Practice restore procedure
- Time the recovery process
- Document any issues

---

## Backup Statistics

### Understanding the Stats

**Auto Backups: 234**
- Total number of automatic backups
- Across all file types
- Maximum: 200 (50 × 4 file types)

**Manual Backups: 8**
- Total manual full backups
- Created by "Download Backup" button
- Maximum: 20

**Total Size: 4.67 MB**
- Combined size of all backups
- Encrypted file sizes
- Includes both auto and manual

**Latest Backup: 2m ago**
- Time since most recent backup
- Should update with each change
- If old, check system logs

### Backup Size Guidelines

**Normal sizes:**
- Empty database: 50-100 backups ≈ 2-5 MB
- 50 bookings: 50-100 backups ≈ 3-8 MB
- 200 bookings: 50-100 backups ≈ 8-15 MB

**Size concerns:**
- Over 100 MB: Check for backup rotation
- Rapid growth: Possible backup loop (check logs)
- Zero size: Backups not working (restart server)

---

## Troubleshooting

### Backups Not Appearing

**Symptom:** Latest backup time is old or "None"

**Solutions:**
1. Verify server is running
2. Check server console for errors
3. Make a test change (edit a setting)
4. Refresh Export & Backup page
5. Check `data/backups/auto/` folder exists

### Restore Not Working

**Symptom:** Restore button doesn't work or throws error

**Solutions:**
1. Check backup file still exists
2. Verify file isn't corrupted
3. Check server logs for errors
4. Try restoring different backup
5. Use manual backup restore as fallback

### Disk Space Issues

**Symptom:** Server errors about disk space

**Solutions:**
1. Check backup folder size
2. Verify automatic rotation is working
3. Manually delete oldest backups if needed
4. Reduce MAX_AUTO_BACKUPS if necessary
5. Move manual backups to external storage

### Backup Rotation Not Working

**Symptom:** More than 50 auto backups per type

**Solutions:**
1. Restart the server
2. Check server.js for MAX_AUTO_BACKUPS
3. Manually trigger rotation:
   - Create new booking
   - System should auto-delete oldest
4. Check file permissions on backup folder

---

## Advanced: Manual Backup Management

### Backup File Locations

```
data/
├── backups/
│   ├── auto/                           # Automatic backups
│   │   ├── bookings_2026-01-28T14-30-45.enc
│   │   ├── bookings_2026-01-28T14-31-12.enc
│   │   ├── settings_2026-01-28T14-30-45.enc
│   │   └── ...
│   ├── backup-2026-01-28T14-00-00.json    # Manual backups
│   └── backup-before-restore-bookings-2026-01-28T15-00-00.json
```

### Manual Restore from File System

If admin panel is unavailable:

1. **Stop the server**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Locate backup file**
   ```
   data/backups/auto/bookings_[timestamp].enc
   ```

3. **Copy backup to main location**
   ```powershell
   Copy-Item "data/backups/auto/bookings_2026-01-28T14-30-45.enc" "data/bookings.enc" -Force
   ```

4. **Restart server**
   ```powershell
   node server.js
   ```

### Extracting Backup Contents

Backups are encrypted. To view contents:

1. Use admin panel restore feature (safest)
2. Or manually decrypt using encryption key from `.env`
3. Or restore to test environment first

### Backing Up to Cloud

**Recommended: Use version control (Git)**

1. **Add to .gitignore:**
   ```
   data/*.enc
   data/backups/auto/*
   .env
   ```

2. **Keep manual backups in Git:**
   ```
   data/backups/*.json  # These can be committed
   ```

3. **Use private repository on GitHub/GitLab**

**Alternative: Cloud sync**
- Dropbox sync `data/backups/` folder
- Google Drive backup sync
- OneDrive for Business
- AWS S3 bucket (requires setup)

---

## Emergency Recovery

### Complete Data Loss Scenario

**If all data files are lost:**

1. **Stop server**
2. **Find most recent manual backup**
   - Check `data/backups/`
   - Check external USB/cloud storage
3. **Use admin panel restore**
   - Login to admin panel
   - Export & Backup → Upload Backup
   - Select manual backup JSON
4. **Verify data**
   - Check bookings
   - Check clients
   - Check settings
5. **Create new manual backup**

### Partial Data Loss

**If only one file is corrupted:**

1. **Go to Export & Backup**
2. **Filter by file type** (e.g., Bookings)
3. **Find most recent backup**
4. **Click Restore**
5. **Verify data integrity**

### Rollback to Yesterday

1. **Export & Backup page**
2. **Note current time**
3. **Filter backups by time**
4. **Find backup from ~24 hours ago**
5. **Restore selected backup**
6. **Verify correct date/time**

---

## Technical Details

### Encryption Specifications

- **Algorithm:** AES-256-GCM
- **Key Derivation:** SHA-256 from ENCRYPTION_KEY
- **IV:** Unique 16-byte random per encryption
- **Format:** `iv:encryptedData:authTag`

### Backup Timing

Backups are created **synchronously** after data writes:
1. Data is prepared
2. Original file is encrypted and saved
3. Backup is created immediately
4. Rotation check runs
5. Operation completes

**Performance impact:** Negligible (<50ms per backup)

### Rotation Algorithm

```javascript
function rotateAutoBackups(fileName) {
  // Get all backups for this file type
  // Sort by modification time (newest first)
  // If count > MAX_AUTO_BACKUPS (50)
  // Delete oldest backups
}
```

### File Naming Convention

**ISO 8601 timestamp format:**
```
bookings_2026-01-28T14-30-45-123Z.enc
         └─────┬─────┘└──┬──┘└─┬─┘└┬┘
          Date      Time  Ms  UTC
```

This ensures:
- Chronological sorting
- No filename conflicts
- Easy date parsing
- Cross-platform compatibility

---

## Frequently Asked Questions

### Q: Are automatic backups enabled by default?

**A:** YES! They activate as soon as the server starts. No configuration needed.

### Q: Can I disable automatic backups?

**A:** Not recommended! But if needed, modify `saveData()` function in `server.js` to remove the `createAutoBackup()` call.

### Q: How much disk space do I need?

**A:** Budget 10-50 MB for typical usage. With 200 backups and moderate data, expect 15-30 MB total.

### Q: Can I increase the backup retention limit?

**A:** Yes! Edit `server.js`:
```javascript
const MAX_AUTO_BACKUPS = 100; // Increase from 50
```

### Q: Are backups accessible from outside the admin panel?

**A:** No. All backup management requires admin authentication. Backup files are encrypted and require the encryption key.

### Q: What if I accidentally restore the wrong backup?

**A:** No problem! Before every restore, your current data is backed up as a manual backup with "before-restore" in the filename. Just restore that file!

### Q: Can I backup to a different drive?

**A:** Yes! Modify `BACKUP_DIR` in `server.js`:
```javascript
const BACKUP_DIR = 'D:\\Ravi-Backups\\';
```

### Q: Do backups work on Render.com free tier?

**A:** YES! Backups work perfectly. However, note:
- Free tier has limited storage (512 MB)
- Consider downloading manual backups weekly
- Use external storage for long-term archives

---

## Summary

### ✅ What You Get

✨ **Zero-effort protection** - Automatic backups after every change  
🔒 **Military-grade encryption** - AES-256-GCM on all backups  
♻️ **Smart rotation** - Old backups automatically cleaned up  
↩️ **One-click restore** - Recover from any point in time  
🛡️ **Safety net** - Current data backed up before restoring  
📊 **Full visibility** - Stats and complete backup list  

### 🎯 Your Action Items

1. ✅ **Trust the system** - Automatic backups are working
2. ✅ **Check weekly** - Review backup stats in admin panel
3. ✅ **Manual backup weekly** - Download full backup to external storage
4. ✅ **Test monthly** - Practice restore process
5. ✅ **Keep .env safe** - Encryption key is critical

---

## Getting Help

📖 **QUICK_REFERENCE.md** - Quick backup procedures  
📚 **SETUP_GUIDE.md** - Initial configuration  
👥 **ADMIN_USER_GUIDE.md** - Full admin documentation  

---

**🛡️ Your data is protected. Focus on healing.**

*Last Updated: January 28, 2026*
