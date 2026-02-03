# Email & SMS Setup Guide

Quick setup for sending booking confirmations and notifications.

---

## 📧 Gmail Email Setup (FREE Forever)

**Time Required:** 2 minutes  
**Cost:** $0  
**Limit:** 500 emails/day

### Step 1: Get Your Gmail App Password

1. Go to your **Google Account**: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Scroll down to **"How you sign in to Google"**
4. Click **2-Step Verification** 
   - If not enabled, turn it on first (required for app passwords)
5. Scroll to bottom → Click **App passwords**
6. In "Select app" dropdown → Choose **Mail**
7. In "Select device" dropdown → Choose **Other (Custom name)**
8. Type: `Ravi Sacred Healing`
9. Click **Generate**
10. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 2: Add to Render Environment Variables

Go to your Render service → **Environment** tab → Add these 4 variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

**Replace:**
- `your-email@gmail.com` → Your actual Gmail address
- `your-16-char-app-password` → The password from Step 1 (remove spaces)

### Step 3: Save & Redeploy

Click **Save Changes** in Render → It will auto-redeploy (takes ~1 minute)

### ✅ Test It

Once deployed, book a test appointment. You should receive:
- Client confirmation email
- Admin notification email

---

## 📱 Twilio SMS Setup (Optional - Costs Money)

**Time Required:** 10 minutes  
**Cost:** ~$0.0075/SMS sent + $1.15/month for phone number  
**Free Trial:** $15 credit (enough for ~2,000 texts)

### Step 1: Create Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Sign up (requires phone number for verification)
3. Verify your phone number via SMS
4. You'll get **$15 free trial credit** 🎉

### Step 2: Get a Phone Number

1. In Twilio Console → Click **Get a Trial Number**
2. Accept the number they give you (or search for a specific one)
3. Copy the phone number (format: `+12345678900`)

### Step 3: Find Your Credentials

1. In Twilio Console → Go to **Account** dropdown (top right)
2. Copy these values:
   - **Account SID** (looks like: `ACxxxxxxxxxxxxx`)
   - **Auth Token** (click eye icon to reveal)
   - **Phone Number** (from Step 2)

### Step 4: Install Twilio Package

SSH into your server or add to `package.json`:

```bash
npm install twilio
```

Add to your `package.json` dependencies:
```json
"twilio": "^5.0.0"
```

Commit and push:
```bash
git add package.json
git commit -m "Add Twilio for SMS"
git push
```

### Step 5: Add to Render Environment Variables

Go to your Render service → **Environment** tab → Add these 3 variables:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+12345678900
```

### Step 6: Save & Redeploy

Click **Save Changes** → Render will redeploy with Twilio enabled

### ✅ Test It

Book a test appointment with your phone number. You should get an SMS confirmation!

---

## 🚨 Important Notes

### Gmail Limits
- **500 emails/day** - More than enough for small business
- If you hit the limit, Gmail will queue them for next day
- For higher volume (1000+/day), upgrade to Google Workspace ($6/month)

### Twilio Trial Limitations
- Can only send to **verified phone numbers** during trial
- Add numbers here: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Once you add $20 credit, trial restrictions are removed

### Cost Breakdown (Twilio)
- **Phone number:** $1.15/month
- **SMS sent:** $0.0075 each (~$0.75 per 100 texts)
- **SMS received:** $0.0075 each

### Privacy & Security
- Never commit these credentials to Git!
- Only store in Render environment variables
- Rotate passwords/tokens every 90 days for best security

---

## 📋 Quick Reference

### Current Setup Status

After following both guides, your Render environment should have:

**Required (Already set):**
```
JWT_SECRET=...
ENCRYPTION_KEY=...
ADMIN_PASSWORD=...
```

**Email (Gmail):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**SMS (Twilio - Optional):**
```
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🆘 Troubleshooting

### Emails Not Sending?

**Error: "Invalid login"**
- Make sure 2-Step Verification is enabled
- Use App Password, NOT your regular Gmail password
- Remove any spaces from the 16-char password

**Error: "Connection timeout"**
- Check `EMAIL_HOST` is `smtp.gmail.com`
- Check `EMAIL_PORT` is `587` (not 465 or 25)
- Render might block port 587 - try port `465` with `EMAIL_SECURE=true`

**Still not working?**
- Check Render logs for error messages
- Test your credentials locally first

### SMS Not Sending?

**Error: "Unable to create record"**
- Phone number must be verified in Twilio console during trial
- Phone number must include country code: `+1` for US

**Error: "Authenticate"**
- Double-check Account SID and Auth Token
- Make sure there are no extra spaces

**"To" number is not a valid phone number**
- Format must be: `+12345678900` (country code + number)
- No spaces, dashes, or parentheses

---

## ✨ What You Get

Once both are set up:

### Client Experience:
1. Books appointment on your website
2. ✅ Sees instant confirmation on screen
3. 📧 Gets email with booking details
4. 📱 Gets SMS confirmation (if Twilio enabled)
5. 📱 Gets SMS reminder 24 hours before (if Twilio enabled)

### Your Experience:
1. 📧 Email notification of new booking
2. 📧 Email notification of cancellations
3. 💼 Full admin dashboard to manage everything
4. 📊 All data securely encrypted

---

**Need help?** Check Render logs in your dashboard → Logs tab for any error messages.
