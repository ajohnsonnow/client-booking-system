# 🎭 Ravi's Sacred Healing - Demo Guide


**Last Updated:** 2026-01-28

## Quick Start Demo

This guide will walk you through demonstrating the complete system to Ravi.

---

## 🌟 System Overview

This is a **premium, secure booking and client management system** designed specifically for Ravi's sacred healing practice. It includes:

- **Privacy-first design** - No tracking, no cookies
- **Military-grade encryption** - AES-256-GCM for all sensitive data
- **Complete client workflow** - From inquiry to booking to session management
- **Professional admin dashboard** - Full control over all aspects of the business
- **SMS & Email integration** - Automated notifications (when configured)
- **Invitation code system** - Exclusive access control

---

## 🎯 Demo Flow (Step-by-Step)

### Part 1: New Visitor Experience (5 minutes)

1. **Navigate to Landing Page**
   - URL: `http://localhost:3000`
   - Show the beautiful gradient welcome screen
   - Point out: "Welcome to Sacred Space" heading

2. **Contact Form**
   - Fill out the inquiry form:
     - Name: "Michael Demo"
     - Email: "michael@demo.com"
     - Phone: "503-555-1234"
     - Message: "I'm interested in healing bodywork and would love to learn more about your practice."
   - Click "✨ Get in Touch with Ravi"
   - **Result**: Inquiry submitted - Ravi will review in admin panel

3. **Key Point to Emphasize**:
   - This creates a "lead" that Ravi can review
   - Ravi decides who gets access
   - Prevents random people from booking

---

### Part 2: Existing Client Path (5 minutes)

1. **Navigate to Client Portal**
   - URL: `http://localhost:3000/portal.html`
   - Show two tabs: "Returning Client" and "Have Invitation Code"

2. **Demo the Invitation Code System**
   - Click "Have Invitation Code" tab
   - Enter code: `DEMO-2026`
   - Email field can be left empty or use any email
   - Click "🎟️ Redeem Invitation"
   - **Result**: Redirected to full site

3. **Key Point to Emphasize**:
   - Invitation codes can be:
     - Printed on business cards
     - Sent via email after inquiry review
     - Single-use or multi-use
     - Have expiration dates
   - This gives Ravi control over who accesses the site

---

### Part 3: Full Site Experience (10 minutes)

After entering the demo code, you'll see the complete website:

1. **Navigation**
   - About section - Ravi's story and approach
   - Services - Different session types with pricing
   - FAQ - Common questions
   - Testimonials - Client experiences
   - **Book a Session** - The intake form

2. **Browse Services Section**
   - Scroll to Services
   - Show the different offerings:
     - 30 min Tantric Coaching - $111
     - 1 Hour "Angel" Session - $333
     - 90 Minute Session - $444
     - 2 Hour Session - $555
     - Couples Session - $666
     - Duo Session (with assistant) - $777

3. **Show Testimonials**
   - Beautiful quotes from real clients
   - Emphasize the trust and safety established

4. **Complete a Booking**
   - Click "Book a Session"
   - Fill out the intake form:
     - **Personal Info**: Name, Email, Phone, Gender/Pronouns
     - **Service Selection**: Choose "90 Minute Session" ($444)
     - **Availability Display**: Shows Ravi's typical schedule (Mon-Fri, time slots)
     - **Client Availability**: "Weekday afternoons work best"
     - **Intentions**: "Looking for stress relief and body reconnection"
     - **Concerns**: "Some lower back sensitivity"
     - **Health Notes**: "No major concerns"
     - **Sensitivities**: "Prefer low lighting"
     - **Agreement Checkboxes**: Age confirmation, boundaries agreement
     - **Electronic Signature**: 
       - Legal Name: "Michael Demo"
       - Date: (Auto-filled with today)
   - Click "Submit Application 🌹"
   - **Result**: Booking submitted successfully

5. **Key Point to Emphasize**:
   - Comprehensive intake form captures everything Ravi needs
   - Consent and boundaries clearly established
   - Professional and sacred space maintained

---

### Part 4: Admin Dashboard (15 minutes)

This is where Ravi manages everything.

1. **Login to Admin**
   - URL: `http://localhost:3000/admin.html`
   - Username: `ravi`
   - Password: `[your password]`

2. **Dashboard Overview**
   - Shows key statistics:
     - Total bookings
     - Confirmed sessions
     - Revenue tracking
     - Pending inquiries
   - Recent activity feed
   - Quick action buttons

3. **Populate Demo Data** (Important First Step!)
   - Go to "Export & Backup" page (last item in sidebar)
   - Scroll to bottom: "🎭 Demo Mode" section
   - Click "✨ Populate Demo Data"
   - **Result**: System now has sample:
     - 4 bookings (various statuses)
     - 2 clients with history
     - 2 inquiries
     - 2 invitation codes

4. **Tour Each Section**:

#### 📊 Overview
   - Dashboard statistics
   - Recent bookings list
   - Quick revenue summary

#### 📬 Inquiries (NEW!)
   - See "Michael Demo" inquiry we just submitted
   - Review client messages
   - Three actions:
     - **Send Invitation**: Generate and send invitation code
     - **Archive**: Mark as reviewed
     - **Delete**: Remove inquiry
   - Badge shows count of new inquiries

#### 📋 Bookings
   - View all session applications
   - Filter by status: All, Pending, Confirmed, Completed, Cancelled
   - Click on any booking to see full details
   - **Actions**:
     - Confirm booking (prompts for date/time)
     - Mark as completed
     - Add admin notes
     - Add session notes (private)
     - Send reminder email

#### 📅 Calendar
   - Visual calendar view
   - Confirmed bookings appear on their scheduled dates
   - Click on a date to see that day's sessions
   - Shows upcoming sessions list
   - **Demo**: After confirming a booking with a date, it appears here!

#### 👥 Clients
   - Client database with history
   - Shows:
     - Number of sessions attended
     - Total revenue per client
     - Last contact date
     - Tags (regular, new, referred-others)
   - Click client to see:
     - Full booking history
     - Admin notes
     - Contact information

#### 🎟️ Invitation Codes (NEW!)
   - Generate new codes with prefixes:
     - SACRED-XXXX
     - LOTUS-XXXX
     - HEALING-XXXX
     - BLISS-XXXX
   - Set expiration dates
   - Choose single-use or multi-use
   - Track: Created date, Used status, Redeemed by
   - **Print View**: Generate printable codes for business cards
   - Filter: All, Active, Used, Expired

#### ✏️ Content
   - Manage **Services**:
     - Edit names, prices, durations
     - Activate/deactivate offerings
     - Add new services
   - Manage **Testimonials**:
     - Approve submitted testimonials
     - Edit testimonial text
     - Feature testimonials
     - Mark as active/inactive
   - Manage **FAQs**:
     - Add new questions/answers
     - Reorder FAQs
     - Edit existing content
   - **Site Settings**:
     - Site name and tagline
     - Location information

#### ⚙️ Settings
   - **Availability**:
     - Set available days of week
     - Define time slots
     - Block specific dates (vacations, etc.)
   - **Email Configuration**:
     - SMTP settings
     - Email templates
     - Auto-confirmation toggles
     - Reminder settings (24 hours before)

#### 📤 Export & Backup
   - Export bookings to CSV
   - Export client list to CSV
   - Download full backup (JSON)
   - Restore from backup
   - **🎭 Demo Mode Section**:
     - Populate demo data
     - Clear all data (for fresh demos)

---

## 🎬 Recommended Demo Script

### Opening (30 seconds)
"I've built you a complete, secure system for managing your sacred healing practice. It handles everything from initial inquiries to scheduling to client management. Let me show you the full flow."

### Client Journey (5 minutes)
"First, let's see what a new visitor experiences..."
[Walk through landing page → inquiry form]

"Now let's see how existing clients or people with your business card access the site..."
[Walk through portal → demo code → full site → booking]

### Admin Power (10 minutes)
"Now let's go behind the scenes where you manage everything..."
[Populate demo data first, then tour each section]

"The system is designed to save you time while keeping everything organized and professional. All your client data is encrypted with military-grade security, and there's no tracking or cookies - privacy first."

### Key Features to Highlight (2 minutes)
- ✅ **Inquiry filtering** - You choose who gets access
- ✅ **Invitation codes** - Perfect for business cards
- ✅ **Calendar integration** - Visual schedule management
- ✅ **Client history** - Track sessions and revenue
- ✅ **Automated emails** - Confirmations and reminders (when configured)
- ✅ **SMS notifications** - Via Twilio (when configured)
- ✅ **Data export** - CSV export for accounting
- ✅ **Backup & restore** - Never lose data

### Closing (30 seconds)
"The system is ready to use today. You can start with the demo code, generate real invitation codes for your business cards, and begin accepting bookings. Everything is encrypted and secure, and you have complete control over your practice."

---

## 🔧 Technical Setup (For Production)

### Required Environment Variables
Create a `.env` file with:

```env
# Required
PORT=3000
ADMIN_USERNAME=ravi
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-secret-key-minimum-32-chars

# Optional - Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=Ravi's Sacred Healing <your-email@gmail.com>

# Optional - SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+15035551234

# Optional - Encryption
ENCRYPTION_KEY=your-encryption-key
```

### Starting the Server
```bash
npm install
node server.js
```

### Accessing the System
- **Client Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html
- **Client Portal**: http://localhost:3000/portal.html

---

## 📱 Mobile-Friendly

The entire system is fully responsive and works beautifully on:
- Desktop computers
- Tablets
- Mobile phones (iOS and Android)

---

## 🔒 Security Features

1. **AES-256-GCM Encryption** - Military-grade encryption for all stored data
2. **JWT Authentication** - Secure token-based authentication
3. **Rate Limiting** - Prevents brute force attacks
4. **Helmet Security** - HTTP security headers
5. **CORS Protection** - Prevents unauthorized cross-origin requests
6. **No Tracking** - Privacy-first design, no cookies or analytics
7. **XSS Protection** - Input sanitization to prevent attacks

---

## 🎯 Next Steps After Demo

1. **Change admin password** (in Settings)
2. **Configure email** (optional but recommended)
3. **Set up Twilio SMS** (optional)
4. **Customize services** and pricing
5. **Add/edit FAQs** and testimonials
6. **Generate invitation codes** for business cards
7. **Block unavailable dates** (vacations, etc.)
8. **Start accepting real bookings!**

---

## 🆘 Demo Troubleshooting

**Services not showing on booking form?**
- Make sure you entered the DEMO-2026 code at /portal.html
- The demo token allows the services API to work

**Can't log into admin?**
- Username: `ravi`
- Password is set in your .env file or defaults in server.js

**Want to start fresh?**
- Go to Export & Backup → Demo Mode
- Click "🗑️ Clear All Data"
- Then "✨ Populate Demo Data" for fresh samples

**Bookings not appearing on calendar?**
- Confirm the booking first (in Bookings page)
- Set a confirmed date and time
- Only confirmed bookings with dates show on calendar

---

## 💎 Why This System is Special

- **Built specifically** for Ravi's sacred practice
- **Privacy-first** - No tracking, no cookies
- **Professional** - Enterprise-level security and reliability
- **Complete** - Handles entire client journey
- **Easy to use** - Intuitive interface for both clients and admin
- **Flexible** - Easily customizable services, pricing, content
- **Secure** - Military-grade encryption protects sensitive client information
- **Time-saving** - Automates confirmations, reminders, and client management

---

## 📞 Support

This system is fully functional and ready for production use. All code is clean, well-documented, and follows best practices for security and performance.

**Demo Code**: `DEMO-2026` (use at /portal.html)

---

*Built with love for Ravi's Sacred Healing Practice* 🪷
