# 🪷 Ravi's Sacred Healing Website

**Version:** 1.0.0  
**Last Updated:** 2026-01-28

A beautiful, secure, privacy-first scheduling website for Ravi's Sacred Pelvic Healing and BlissFlow Rituals practice.

## ✨ Features

### Security & Privacy (100% Secure)
- 🔐 **Password-protected entry** - Only screened clients can access
- 🔒 **Encrypted data storage** - All client data is AES encrypted
- 🛡️ **Rate limiting** - Prevents brute force attacks
- 🚫 **No tracking/cookies** - Zero third-party analytics
- 🔑 **JWT authentication** - Secure session management
- 🪖 **Helmet.js security headers** - Industry best practices

### For Clients
- 📝 Comprehensive intake form (mirrors your Google Form)
- 📅 Service selection with all pricing tiers ($111-$777)
- 💬 Space for intentions, concerns, and health notes
- ✍️ Electronic consent signature
- 📱 Mobile-responsive design

### For Ravi (Admin Panel)
- 📊 Dashboard with booking statistics
- 📋 View all booking requests with full details
- ✏️ Update booking status (pending → confirmed → completed)
- 📝 Add private admin notes
- ⚙️ Configure available days and time slots
- 📧 Email notifications for new bookings

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Site password (give this to screened clients)
SITE_PASSWORD=your_client_password

# Admin credentials
ADMIN_USERNAME=ravi
ADMIN_PASSWORD=your_secure_admin_password

# Generate these (64+ random characters)
JWT_SECRET=your_very_long_random_secret_string
ENCRYPTION_KEY=your_32_character_key

# Email (for booking notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=RavishingRavi77@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=RavishingRavi77@gmail.com
```

### 3. Start the Server
```bash
npm start
```

Visit:
- **Client Site:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html

## 📧 Email Setup (Gmail)

To receive booking notifications:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Create a new app password for "Mail"
5. Copy the 16-character password to `EMAIL_PASS` in `.env`

## 🌐 Deploying to Render.com (Free)

1. Push code to GitHub (make sure `.env` is in `.gitignore`!)
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy!

**Environment Variables to set in Render:**
- `SITE_PASSWORD`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_TO`
- `NODE_ENV=production`

## 📁 Project Structure

```
ravi-sacred-healing/
├── server.js           # Express server with all API routes
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .gitignore          # Security - excludes .env and data
├── public/
│   ├── index.html      # Main client-facing website
│   ├── styles.css      # Beautiful goddess-inspired styles
│   ├── app.js          # Client-side JavaScript
│   └── admin.html      # Admin dashboard (single file)
└── data/               # Created automatically
    ├── bookings.enc    # Encrypted booking data
    └── settings.enc    # Encrypted settings
```

## 🔒 Security Features Explained

### Password Gate
- Clients must enter a password you provide after screening
- Protects the site from random visitors
- Session lasts 24 hours

### Data Encryption
- All booking data is encrypted with AES-256
- Even if someone accesses the server, data is unreadable
- Encryption key is only in your `.env` file

### Rate Limiting
- Login attempts: 5 per 15 minutes (prevents password guessing)
- General requests: 60 per minute (prevents abuse)

### Secure Headers
- Helmet.js adds security headers
- Prevents XSS, clickjacking, and other attacks
- Content Security Policy restricts resource loading

## 💰 Pricing Tiers (Pre-configured)

| Service | Duration | Price |
|---------|----------|-------|
| Tantric Coaching (Video) | 30 min | $111 |
| "Angel" Session | 1 hour | $333 |
| Standard Session | 90 min | $444 |
| Extended Session | 2 hours | $555 |
| Couples Session | 2 hours | $666 |
| Duo Session | 2 hours | $777 |

## 🎨 Customization

### Adding Your Photos
Replace the placeholder in `public/index.html` with your actual images:

```html
<div class="image-frame">
  <img src="your-photo.jpg" alt="Ravi - Intuitive Healer">
</div>
```

### Changing Colors
Edit the CSS variables in `public/styles.css`:

```css
:root {
  --color-burgundy: #722F37;  /* Primary color */
  --color-rose: #C4A484;      /* Accent color */
  --color-cream: #FDF8F3;     /* Background */
}
```

## 🙏 Support

This website was created with love and care for Ravi's sacred healing practice. 

For technical support or customizations, contact your developer.

---

*"You are worthy of nurturing touch, unconditional love, and sacred healing."* 🪷

