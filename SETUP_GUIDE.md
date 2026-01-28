# 🚀 Initial Setup Guide - Ravi's Sacred Healing

**Last Updated:** 2026-01-28

## Complete First-Time Configuration

---

## 📋 Table of Contents

1. [Quick Start Checklist](#quick-start-checklist)
2. [Step 1: Environment Configuration](#step-1-environment-configuration)
3. [Step 2: Change Admin Password](#step-2-change-admin-password)
4. [Step 3: Email Setup](#step-3-email-setup)
5. [Step 4: SMS Setup (Optional)](#step-4-sms-setup-optional)
6. [Step 5: Test the System](#step-5-test-the-system)
7. [Step 6: Deploy to Production](#step-6-deploy-to-production)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start Checklist

Before launching your system, complete these essential steps:

- [ ] Copy `.env.example` to `.env`
- [ ] Set strong admin password
- [ ] Configure email settings
- [ ] Test email delivery
- [ ] (Optional) Configure SMS/Twilio
- [ ] Test booking flow end-to-end
- [ ] Deploy to Render.com
- [ ] Connect custom domain

**Estimated Setup Time:** 30-45 minutes

---

## Step 1: Environment Configuration

### 1.1 Copy Environment Template

```powershell
# In your project directory
Copy-Item .env.example .env
```

### 1.2 Edit `.env` File

Open the `.env` file in a text editor and configure the following:

```dotenv
# ===========================================
# ADMIN CREDENTIALS
# ===========================================

ADMIN_USERNAME=ravi
ADMIN_PASSWORD=YourStrongPasswordHere123!

# IMPORTANT: 
# - Use at least 12 characters
# - Include uppercase, lowercase, numbers, and symbols
# - Don't use common words or personal info
# - Example: Rv!H3al1ng$ecure2026
```

**Password Requirements:**
- ✅ Minimum 12 characters
- ✅ Mix of uppercase and lowercase
- ✅ At least one number
- ✅ At least one special character
- ❌ No dictionary words
- ❌ No personal information

### 1.3 Generate Strong Secrets

```dotenv
# JWT_SECRET - Used for secure session tokens
# Generate a random 64+ character string
JWT_SECRET=paste_your_64_character_random_string_here

# ENCRYPTION_KEY - Used for encrypting client data
# Generate a random 32+ character string
ENCRYPTION_KEY=paste_your_32_character_random_string_here
```

**How to Generate Random Strings:**

**Option 1: Using PowerShell**
```powershell
# Generate 64-character JWT secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate 32-character encryption key
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option 2: Using Online Tool**
- Visit: https://www.random.org/strings/
- Set length to 64 (for JWT) or 32 (for encryption)
- Character set: Alphanumeric
- Generate and copy

### 1.4 Port Configuration

```dotenv
PORT=3000
NODE_ENV=development  # Change to 'production' when deploying
```

---

## Step 2: Change Admin Password

### Default Credentials

**⚠️ IMPORTANT: Change these immediately!**

- **Username:** `ravi`
- **Default Password:** `admin2024`

### Method 1: Via .env File (Recommended for First Setup)

1. Open `.env` file
2. Change `ADMIN_PASSWORD` value:
   ```dotenv
   ADMIN_PASSWORD=YourNewSecurePassword123!
   ```
3. Restart the server
4. Login with new password

### Method 2: Via Admin Panel (After Initial Setup)

**Coming Soon:** Password change feature in admin settings panel.

### Password Recovery

If you forget your admin password:

1. **Stop the server** (if running)
2. **Edit `.env` file:**
   ```dotenv
   ADMIN_PASSWORD=TemporaryPassword123!
   ```
3. **Restart server**
4. **Login with temporary password**
5. **Immediately change to new secure password**

**⚠️ Security Note:** Always use strong, unique passwords. Never share your admin credentials.

---

## Step 3: Email Setup

Email is required for:
- Booking notifications to you
- Confirmation emails to clients
- Reminder emails before sessions
- Magic login links

### 3.1 Gmail Setup (Recommended)

#### Create App-Specific Password

1. **Go to Google Account:**
   - Visit: https://myaccount.google.com/security
   - Login with your Gmail account

2. **Enable 2-Factor Authentication** (if not already enabled)
   - Click "2-Step Verification"
   - Follow setup wizard

3. **Generate App Password:**
   - Search for "App passwords" in settings
   - Select app: "Mail"
   - Select device: "Other" (type "Ravi Healing System")
   - Click "Generate"
   - **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

4. **Configure .env:**
   ```dotenv
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=Ravi's Sacred Healing <your.email@gmail.com>
   EMAIL_TO=your.email@gmail.com  # Where you receive booking notifications
   ```

### 3.2 Outlook/Hotmail Setup

```dotenv
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your.email@outlook.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=Ravi's Sacred Healing <your.email@outlook.com>
EMAIL_TO=your.email@outlook.com
```

**Generate App Password:**
1. Go to: https://account.microsoft.com/security
2. Advanced security options → App passwords
3. Create new app password

### 3.3 Other Email Providers

**Yahoo:**
```dotenv
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

**ProtonMail:**
```dotenv
EMAIL_HOST=smtp.protonmail.ch
EMAIL_PORT=587
```

**Custom Domain Email:** Contact your hosting provider for SMTP settings

### 3.4 Test Email Configuration

**After configuring, test email:**

1. Start your server:
   ```powershell
   node server.js
   ```

2. Login to admin panel: `http://localhost:3000/admin.html`

3. Go to **Export & Backup** page

4. Click "Populate Demo Data"

5. Go to **Bookings** page

6. Open any pending booking

7. Click "Confirm Booking"

8. When prompted "Send confirmation email?", click "Yes"

9. **Check your email** (both sending and receiving addresses)

**✅ Success:** You receive emails in both inboxes  
**❌ Failed:** See [Email Troubleshooting](#email-troubleshooting)

---

## Step 4: SMS Setup (Optional)

SMS notifications via Twilio for appointment reminders and confirmations.

### 4.1 Create Twilio Account

1. Visit: https://www.twilio.com/try-twilio
2. Sign up for free trial (includes $15 credit)
3. Verify your phone number
4. Get a Twilio phone number

### 4.2 Get Credentials

1. Go to Twilio Console: https://console.twilio.com/
2. Find your:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)
   - **Twilio Phone Number** (format: +1234567890)

### 4.3 Configure .env

```dotenv
# SMS Configuration (Optional - via Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
SMS_ENABLED=true
```

### 4.4 Test SMS

1. In admin panel, open a confirmed booking
2. Click "Send Reminder"
3. If SMS is enabled, both email and SMS will be sent
4. Check the client's phone number for text message

**Note:** Trial accounts can only send to verified numbers. Upgrade for production use.

---

## Step 5: Test the System

### 5.1 Start the Server

```powershell
# Kill any existing Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server
cd E:\VS_Studio\Ravi
node server.js
```

**Expected Output:**
```
🪷 Ravi's Sacred Healing Server
✅ Server running on http://localhost:3000
✅ Data directory: E:\VS_Studio\Ravi\data
✅ Environment: development
```

### 5.2 Test Landing Page

1. Open browser: `http://localhost:3000`
2. Verify landing page displays correctly
3. Fill out inquiry form with test data
4. Submit and verify success message
5. Check admin panel → Inquiries (should show your test inquiry)

### 5.3 Test Client Portal Flow

1. Go to: `http://localhost:3000/portal.html`
2. Enter demo code: `DEMO-2026`
3. Should redirect to main site
4. Verify all sections load:
   - Services
   - Testimonials
   - FAQs
   - Booking form

### 5.4 Test Booking Flow

1. On main site, scroll to "Book a Session"
2. Fill out complete booking form:
   - Personal information
   - Select a service
   - Provide availability
   - Complete intake questions
   - Sign electronically
3. Submit booking
4. Verify success message
5. Check admin panel → Bookings (should show your test booking)

### 5.5 Test Admin Panel

1. Go to: `http://localhost:3000/admin.html`
2. Login with credentials:
   - Username: `ravi`
   - Password: (from your .env file)
3. Test each page:
   - ✅ Overview (statistics display)
   - ✅ Inquiries (view your test inquiry)
   - ✅ Bookings (view your test booking)
   - ✅ Calendar (confirm booking, view on calendar)
   - ✅ Clients (check client created from booking)
   - ✅ Invitation Codes (generate test code)
   - ✅ Content (view services, FAQs, testimonials)
   - ✅ Settings (check availability, email config)
   - ✅ Export & Backup (test CSV export, backup download)

### 5.6 Test Email Notifications

1. Confirm a test booking
2. Choose "Yes" to send confirmation email
3. Check recipient email inbox
4. Verify email received with correct information

### 5.7 Clean Up Test Data

After testing:
1. Admin panel → Export & Backup
2. Click "Clear All Data"
3. Confirm twice
4. System is now ready for real use

---

## Step 6: Deploy to Production

### 6.1 Deploy to Render.com (Free Hosting)

#### Create Render Account

1. Go to: https://render.com
2. Sign up with GitHub account (recommended)
3. Verify email

#### Connect Repository

1. Push your code to GitHub (private repository recommended)
2. In Render dashboard, click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Grant Render access to the repository

#### Configure Service

**Settings:**
- **Name:** `ravi-sacred-healing` (or your choice)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Plan:** `Free`

**Environment Variables:**

Click "Advanced" and add all variables from your `.env` file:

```
ADMIN_USERNAME=ravi
ADMIN_PASSWORD=your_production_password
JWT_SECRET=your_64_character_secret
ENCRYPTION_KEY=your_32_character_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Ravi's Sacred Healing <your.email@gmail.com>
EMAIL_TO=your.email@gmail.com
NODE_ENV=production
```

**⚠️ IMPORTANT:** Use different, stronger passwords for production!

#### Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Wait for "Live" status (2-3 minutes)
4. Click the URL (e.g., `https://ravi-sacred-healing.onrender.com`)

### 6.2 Connect Custom Domain

#### In Render Dashboard:

1. Go to your service
2. Click "Settings"
3. Scroll to "Custom Domains"
4. Click "Add Custom Domain"
5. Enter: `yourdomain.com` or `www.yourdomain.com`
6. Render provides DNS instructions

#### In Your Domain Registrar:

**For Root Domain (yourdomain.com):**
- Add A record: `76.76.21.21`

**For Subdomain (www.yourdomain.com):**
- Add CNAME record: `your-service.onrender.com`

**Wait for DNS propagation** (can take 24-48 hours, usually faster)

### 6.3 Enable HTTPS

Render automatically provides free SSL certificates via Let's Encrypt.

**Verify:**
1. Visit your custom domain
2. Check for 🔒 padlock in browser
3. Certificate should be valid

---

## Troubleshooting

### Email Troubleshooting

#### Problem: "Authentication failed"

**Solution:**
- ✅ Verify you're using app-specific password, not regular password
- ✅ Check for typos in email credentials
- ✅ Ensure 2FA is enabled on Gmail account
- ✅ Remove any spaces in app password

#### Problem: "Connection timeout"

**Solution:**
- ✅ Check EMAIL_PORT (should be 587 for TLS)
- ✅ Verify EMAIL_HOST is correct
- ✅ Check firewall isn't blocking port 587
- ✅ Try port 465 (SSL) instead

#### Problem: "Emails go to spam"

**Solution:**
- ✅ Use professional FROM name
- ✅ Keep message content professional
- ✅ Avoid spam trigger words
- ✅ Consider using custom domain email

#### Problem: No emails received

**Solution:**
- ✅ Check spam/junk folder
- ✅ Verify EMAIL_TO address is correct
- ✅ Check server logs for errors
- ✅ Test with different email address

### Server Troubleshooting

#### Problem: "Port already in use"

**Solution:**
```powershell
# Find and kill processes on port 3000
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

#### Problem: "Cannot find module"

**Solution:**
```powershell
# Reinstall dependencies
npm install
```

#### Problem: "ENCRYPTION_KEY not set"

**Solution:**
- ✅ Verify `.env` file exists in project root
- ✅ Check ENCRYPTION_KEY is set in `.env`
- ✅ Restart server after editing `.env`

### Login Troubleshooting

#### Problem: "Invalid credentials"

**Solution:**
- ✅ Check ADMIN_USERNAME matches exactly (default: `ravi`)
- ✅ Verify ADMIN_PASSWORD in `.env` file
- ✅ Ensure no extra spaces in credentials
- ✅ Restart server after changing `.env`
- ✅ Clear browser cache and cookies

#### Problem: Forgot admin password

**Solution:**
1. Stop server
2. Edit `.env` file
3. Change `ADMIN_PASSWORD=NewPasswordHere123!`
4. Restart server
5. Login with new password

### Render.com Deployment Issues

#### Problem: Build fails

**Solution:**
- ✅ Verify `package.json` exists
- ✅ Check Node version compatibility
- ✅ Review build logs for specific error
- ✅ Ensure all dependencies listed in package.json

#### Problem: Service won't start

**Solution:**
- ✅ Check environment variables are set
- ✅ Verify start command is `node server.js`
- ✅ Review service logs
- ✅ Ensure PORT variable is not set (Render provides it)

#### Problem: Free tier limitations

**Solution:**
- Free tier spins down after 15 minutes of inactivity
- First request after spindown takes 30-60 seconds
- Upgrade to Starter ($7/month) for always-on service
- Perfect for low-traffic healing practice

---

## Post-Setup Checklist

After completing setup:

- [ ] Admin password changed from default
- [ ] Email sending and receiving tested
- [ ] SMS tested (if configured)
- [ ] Complete booking flow tested
- [ ] All admin panel sections verified
- [ ] Test data cleared
- [ ] Deployed to Render.com
- [ ] Custom domain connected
- [ ] HTTPS working
- [ ] Backup created and downloaded
- [ ] Password recovery method documented
- [ ] Email and SMS credentials stored securely

---

## Security Best Practices

### Password Management

- ✅ **Use unique password** for admin panel
- ✅ **Change password every 90 days**
- ✅ **Never share credentials** via email or text
- ✅ **Use password manager** (1Password, LastPass, Bitwarden)
- ✅ **Document recovery process** in secure location

### Email Security

- ✅ **Use app-specific passwords** (never regular password)
- ✅ **Enable 2FA** on email account
- ✅ **Monitor login activity** regularly
- ✅ **Revoke unused app passwords**

### Data Security

- ✅ **Weekly backups** (Export & Backup page)
- ✅ **Store backups securely** (encrypted cloud storage)
- ✅ **Test restore process** quarterly
- ✅ **Monitor server logs** for suspicious activity

### Production Environment

- ✅ **Change all default passwords**
- ✅ **Use strong JWT_SECRET** (64+ characters)
- ✅ **Set NODE_ENV=production**
- ✅ **Keep dependencies updated** (`npm update`)
- ✅ **Monitor Render logs** for errors

---

## Getting Help

### Resources

- **User Guide:** `ADMIN_USER_GUIDE.md` - Complete admin panel documentation
- **Demo Guide:** `DEMO_GUIDE.md` - Demonstration walkthrough
- **Value Report:** `VALUE_PROPOSITION_REPORT.md` - Business value analysis

### Support

For technical issues:
1. Check this setup guide first
2. Review error messages in server logs
3. Search Render.com documentation
4. Check Node.js/Express documentation

### Common Questions

**Q: Can I change the admin username?**
A: Yes, edit `ADMIN_USERNAME` in `.env` file

**Q: How many bookings can the free tier handle?**
A: Easily 1,000+ bookings per year with current configuration

**Q: Do I need to configure SMS?**
A: No, SMS is optional. Email is sufficient for most practices.

**Q: How do I backup my data?**
A: Admin panel → Export & Backup → Download Backup (do weekly!)

**Q: Can I use a different email provider?**
A: Yes, any SMTP provider works (Gmail, Outlook, custom domain, etc.)

---

## Quick Reference

### Default Credentials
- **Admin Username:** `ravi`
- **Default Admin Password:** `admin2024` ⚠️ CHANGE THIS!
- **Demo Invitation Code:** `DEMO-2026`

### Important URLs
- **Landing Page:** `http://localhost:3000`
- **Client Portal:** `http://localhost:3000/portal.html`
- **Admin Panel:** `http://localhost:3000/admin.html`
- **Privacy Policy:** `http://localhost:3000/privacy.html`

### Key Files
- **`.env`** - All configuration and secrets
- **`server.js`** - Main server file
- **`data/`** - Encrypted data storage
- **`data/backups/`** - Backup files

### Emergency Commands

**Kill server:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Start server:**
```powershell
cd E:\VS_Studio\Ravi
node server.js
```

**Reset admin password:**
1. Stop server
2. Edit `.env`: `ADMIN_PASSWORD=NewPassword123!`
3. Start server

---

**🎉 Congratulations!** Your system is now fully configured and ready for use.

**Next Steps:**
1. Review the [Admin User Guide](ADMIN_USER_GUIDE.md)
2. Practice with [Demo Mode](DEMO_GUIDE.md)
3. Make your first real booking!

🪷 **Built with love for Ravi's Sacred Healing Practice**

---

*Last Updated: January 28, 2026*
*Version: 1.0*
