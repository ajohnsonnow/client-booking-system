# 🔐 Quick Reference - Admin Access & Recovery

**Last Updated:** 2026-01-28

## Default Admin Credentials

**⚠️ CHANGE THESE IMMEDIATELY AFTER FIRST LOGIN!**

- **Admin URL:** `http://localhost:3000/admin.html`
- **Username:** `ravi`
- **Default Password:** `admin2024`

---

## Changing Your Password

### Method 1: Via Admin Panel (Recommended)

1. Login to admin panel
2. Go to **Settings** page
3. Click **Security** tab
4. Fill out the form:
   - Current password
   - New password (min 12 characters)
   - Confirm new password
5. Click "Change Password"
6. You'll be logged out - login with new password

### Method 2: Via .env File

1. Stop the server
2. Open `.env` file in project root
3. Change this line:
   ```
   ADMIN_PASSWORD=YourNewSecurePassword123!
   ```
4. Save file
5. Restart server
6. Login with new password

---

## Password Requirements

✅ **Minimum 12 characters**  
✅ **At least one uppercase letter** (A-Z)  
✅ **At least one lowercase letter** (a-z)  
✅ **At least one number** (0-9)  
✅ **At least one special character** (!@#$%^&*)  

**Good Example:** `Rv!H3al1ng$ecure2026`  
**Bad Example:** `password123` ❌

---

## Password Recovery

### If You Forget Your Password:

1. **Stop the server:**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Edit `.env` file:**
   - Open in text editor
   - Find: `ADMIN_PASSWORD=old_password`
   - Change to: `ADMIN_PASSWORD=TemporaryPassword123!`
   - Save file

3. **Restart server:**
   ```powershell
   cd E:\VS_Studio\Ravi
   node server.js
   ```

4. **Login with temporary password**

5. **Immediately change password** via Settings → Security tab

---

## Email Configuration

### Required for:
- Booking notifications
- Client confirmations
- Appointment reminders
- Magic login links

### Gmail Setup:

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Search for "App passwords"
   - Select "Mail" and "Other"
   - Name it: "Ravi Healing System"
   - Copy the 16-character password

3. **Configure .env:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=Ravi's Sacred Healing <your.email@gmail.com>
   EMAIL_TO=your.email@gmail.com
   ```

4. **Restart server**

### Test Email:
1. Admin panel → Export & Backup
2. Click "Populate Demo Data"
3. Go to Bookings → Open booking
4. Confirm booking and send email
5. Check your inbox

---

## SMS Configuration (Optional)

### Twilio Setup:

1. **Create account:** https://www.twilio.com/try-twilio
2. **Get phone number** from Twilio
3. **Find credentials** in Twilio Console
4. **Configure .env:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   SMS_ENABLED=true
   ```
5. **Restart server**

---

## Emergency Commands

### Kill Server:
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Start Server:
```powershell
cd E:\VS_Studio\Ravi
node server.js
```

### Check if Server is Running:
```powershell
Get-Process -Name node
```

### View Server on Different Port:
If port 3000 is busy, edit `.env`:
```env
PORT=3001
```
Then restart server and visit `http://localhost:3001`

---

## Important Files

| File | Purpose | Location |
|------|---------|----------|
| `.env` | All configuration & passwords | Project root |
| `server.js` | Main server file | Project root |
| `data/` | Encrypted database | Project root |
| `data/backups/` | Backup files | Project root |
| `public/admin.html` | Admin panel | public/ folder |
| `SETUP_GUIDE.md` | Complete setup instructions | Project root |
| `ADMIN_USER_GUIDE.md` | Admin panel documentation | Project root |

---

## Important URLs

| Page | URL |
|------|-----|
| Landing Page | `http://localhost:3000` |
| Client Portal | `http://localhost:3000/portal.html` |
| **Admin Panel** | `http://localhost:3000/admin.html` |
| Privacy Policy | `http://localhost:3000/privacy.html` |

---

## 🛡️ Automatic Backup System

### How It Works

**Every data change is automatically backed up!**

✅ **Real-Time:** Backup created after EVERY save operation  
✅ **Encrypted:** All backups use AES-256-GCM encryption  
✅ **Smart Rotation:** Keeps last 50 automatic backups  
✅ **Zero Config:** Works automatically, no setup needed  

### Backup Types

**Automatic Backups:**
- Created every time you:
  - Confirm/update/complete a booking
  - Change settings
  - Add/edit testimonials or FAQs
  - Update client information
- Stored in: `data/backups/auto/`
- Filename format: `bookings_2026-01-28T14-30-45-123Z.enc`
- Kept: Last 50 per file type

**Manual Backups:**
- Created when you click "Download Backup"
- Includes ALL data (bookings, clients, settings, etc.)
- Stored in: `data/backups/`
- Filename format: `backup-2026-01-28T14-30-45-123Z.json`
- Kept: Last 20 manual backups

### Viewing Backups

1. Login to admin panel
2. Go to **Export & Backup** page
3. Scroll to "Automatic Backup System"
4. See stats: Total backups, size, latest backup time
5. Filter by type: All, Bookings, Settings, Content, Clients, Manual

### Restoring from Backup

1. **Export & Backup** page
2. Find the backup you want to restore
3. Click **Restore** button
4. Confirm (your current data is backed up first!)
5. Data restored automatically

### Backup Protection

**What backups protect against:**
- 🔥 Server crashes
- 💥 Software bugs
- 🔄 Bad updates
- 👤 Human error (accidental deletion)
- ⚡ Power failures
- 🖥️ Hardware failures

**Backups CANNOT protect against:**
- 🔓 Stolen encryption key (keep `.env` secure!)
- 🗑️ Manually deleting backup folder
- 💾 Full disk failure (use external backups too!)

---

## Demo Mode

- **Demo Code:** `DEMO-2026`
- **Use at:** `/portal.html`
- **Purpose:** Testing and demonstrations
- **Demo Token:** Automatically set (no email required)

### Populate Demo Data:
1. Admin panel → Export & Backup
2. Click "Populate Demo Data"
3. Creates sample bookings, clients, inquiries

### Clear All Data:
1. Admin panel → Export & Backup
2. Click "Clear All Data"
3. Confirm twice
4. Everything deleted except settings

---

## Security Best Practices

✅ **Change default password immediately**  
✅ **Use password manager** (1Password, LastPass, Bitwarden)  
✅ **Never share credentials** via email/text  
✅ **Enable 2FA** on email account  
✅ **Use app-specific passwords** for email  
✅ **Automatic backups enabled** (happens on every save)  
✅ **Manual backup weekly** (Export & Backup page)  
✅ **Test restore process** monthly  
✅ **Log out** when finished (especially on shared computers)  
✅ **Change password** every 90 days  

---

## Quick Troubleshooting

### Can't Login:
- ✅ Check username is exactly: `ravi`
- ✅ Verify password in `.env` file
- ✅ Restart server after changing `.env`
- ✅ Clear browser cache/cookies
- ✅ Try different browser

### Emails Not Sending:
- ✅ Use app-specific password (not regular password)
- ✅ Check port is 587
- ✅ Remove spaces from app password in `.env`
- ✅ Verify 2FA enabled on email
- ✅ Check spam folder

### Server Won't Start:
- ✅ Kill existing node processes first
- ✅ Check port 3000 isn't in use
- ✅ Verify `.env` file exists
- ✅ Run `npm install` to reinstall dependencies

### Forgot Password:
- ✅ Edit `.env` → Change `ADMIN_PASSWORD`
- ✅ Restart server
- ✅ Login with new password
- ✅ Immediately change via Settings → Security

---

## Getting More Help

📖 **Setup Guide:** `SETUP_GUIDE.md` - Complete configuration instructions  
📚 **User Guide:** `ADMIN_USER_GUIDE.md` - Full admin panel documentation  
🎭 **Demo Guide:** `DEMO_GUIDE.md` - Demonstration walkthrough  
💼 **Value Report:** `VALUE_PROPOSITION_REPORT.md` - Business analysis  

---

## Support Contacts

**For Technical Issues:**
- Check documentation first
- Review server logs/error messages
- Consult Render.com docs (for deployment)
- Node.js/Express documentation

**Keep Safe:**
- Backup `.env` file (encrypted location)
- Store passwords in password manager
- Document recovery procedures
- Test restore process regularly

---

**🪷 Built with love for Ravi's Sacred Healing Practice**

*Last Updated: January 28, 2026*
