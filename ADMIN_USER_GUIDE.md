# 📚 Admin User Guide - Ravi's Sacred Healing


**Last Updated:** 2026-02-01

## Complete Guide to Your Admin Dashboard

---

## 🔐 Logging In

1. Navigate to: `http://localhost:3000/admin.html`
2. Enter your credentials:
   - **Username**: `ravi`
   - **Password**: Your secure password
3. Click "🪷 Enter Admin Portal"

**Security Note**: Your session stays active until you log out or close the browser. Always log out when finished, especially on shared computers.

---

## 📊 Dashboard Overview

When you first log in, you'll see the **Overview** page with:

### Statistics Cards
- **📋 Total Bookings**: All time booking count
- **✅ Confirmed Sessions**: Scheduled bookings
- **⏳ Pending**: Awaiting your confirmation
- **✨ Completed**: Finished sessions
- **💰 Total Revenue**: Lifetime earnings
- **👥 Total Clients**: Unique client count

### Recent Bookings
Quick view of your latest 5 bookings with:
- Client name
- Service type
- Status (color-coded)
- Date (if confirmed)
- Quick action buttons

### Quick Actions
- **🔄 Refresh** - Reload dashboard data
- Click any booking to view full details

---

## 📬 Inquiries Section

**Purpose**: Manage new visitor inquiries who filled out your landing page contact form.

### What You'll See
- List of all inquiries sorted by newest first
- Each inquiry shows:
  - Name and contact information
  - Their message
  - Submission date
  - Current status (new, contacted, archived)
- **Badge**: Shows count of new (unreviewed) inquiries

### Actions You Can Take

#### 1. **Send Invitation** 
- Click the envelope icon (📧)
- System generates a unique invitation code
- Opens your email client (if configured) or shows the code
- Code is automatically saved in the Invitation Codes section
- Client receives access to the full site

#### 2. **Archive**
- Click the folder icon (📁)
- Marks inquiry as "archived" (reviewed but not invited)
- Useful for inquiries you're not pursuing
- Keeps your active list clean

#### 3. **Delete**
- Click the trash icon (🗑️)
- Permanently removes the inquiry
- Use for spam or duplicate submissions
- **Warning**: This cannot be undone

### Workflow Best Practices
1. Check inquiries daily
2. Respond within 24-48 hours
3. Send invitation codes to qualified leads
4. Archive inquiries you're declining (keep records)
5. Delete obvious spam

---

## 📋 Bookings Section

**Purpose**: Manage all session applications and bookings.

### Understanding Booking Statuses

| Status | Color | Meaning |
|--------|-------|---------|
| **Pending** | Blue | New application, awaiting your review |
| **Confirmed** | Green | You've confirmed and scheduled the session |
| **Completed** | Purple | Session has occurred |
| **Cancelled** | Red | Session was cancelled |

### Filtering Bookings
- **All**: Shows every booking
- **Pending**: Applications waiting for your response
- **Confirmed**: Scheduled sessions
- **Completed**: Past sessions
- **Cancelled**: Cancelled appointments

### Viewing Booking Details
Click on any booking row to open the **Detail Modal** which shows:

#### Client Information
- Full name, email, phone number
- Gender and pronouns
- Text permission status
- Newsletter opt-in status

#### Session Details
- Selected service and price
- Session duration
- Availability they provided
- Booking date (when they submitted)

#### Intake Information
- **Intentions**: What they hope to achieve
- **Concerns**: Any worries or questions
- **Health/Trauma Notes**: Medical information
- **Sensory Sensitivities**: Preferences (scents, lighting, etc.)
- **Additional Info**: Any extra details

#### Dates & Times
- **Confirmed Date**: The scheduled session date (editable)
- **Confirmed Time**: The scheduled session time (editable)
- **Admin Notes**: Your private notes (only you see these)
- **Session Notes**: Post-session notes (for completed bookings)

### Actions on Bookings

#### 1. **Save Changes**
- Update confirmed date/time
- Add or edit admin notes
- Add session notes (after completion)
- Changes save immediately

#### 2. **Confirm Booking**
- Button appears for pending bookings
- **Important**: You must enter a confirmed date and time
- Prompts: "Send confirmation email to client?"
- Changes status from pending → confirmed
- Client receives notification (if email configured)

#### 3. **Mark as Completed**
- Available for confirmed bookings
- Click after session is finished
- Moves booking to completed status
- Client record is automatically created/updated
- Revenue is counted in dashboard

#### 4. **Cancel Booking**
- Changes status to cancelled
- Keeps record for your reference
- Can add reason in admin notes

#### 5. **Send Reminder**
- Manually trigger reminder email
- Useful for upcoming appointments
- Can be sent multiple times

#### 6. **Send Custom Email**
- Opens email form
- Enter custom subject and message
- Useful for personal follow-ups

### Quick Actions (From List)
- **👁️ View**: Open full booking details
- **✅ Quick Confirm**: Fast-track confirmation
- **📧 Remind**: Send reminder email

### Calendar Integration
**Important**: Bookings only appear on the calendar after:
1. Status is set to "Confirmed" AND
2. A confirmed date is entered

---

## 📅 Calendar Section

**Purpose**: Visual overview of your scheduled sessions.

### Calendar Display
- Shows current month
- Confirmed bookings appear on their scheduled dates
- **Color coding**:
  - Light purple background = has bookings that day
  - Today is highlighted
  - Blocked dates shown in red

### Navigating the Calendar
- **◀ Previous Month**: Go back one month
- **▶ Next Month**: Go forward one month
- **Today Button**: Jump back to current month

### Day Details
- Click any day to see bookings scheduled
- Each booking shows:
  - Time
  - Client name
  - Service type
- Days show up to 2 bookings, then "+X more"

### Upcoming Sessions Panel
- Right side of calendar
- Lists next 5 confirmed sessions
- Shows:
  - Client name and avatar
  - Service type
  - Date and time
- Click any session to view full details

### Blocking Dates
**Note**: Currently blocked dates are managed in Settings → Availability

---

## � Messages Section (NEW!)

**Purpose**: Secure, encrypted communication between you and your clients.

### How Secure Messaging Works
- **End-to-end encryption**: All messages are encrypted with AES-256-GCM
- **Client-to-Ravi only**: Clients can ONLY message you, not each other
- **Private and confidential**: Messages stored securely on your server
- **No third-party access**: Your conversations stay between you and your clients

### Messages Inbox

#### Viewing Your Inbox
1. Click **"Messages"** in the left navigation
2. You'll see a list of all client conversations
3. Each conversation shows:
   - 🟢 **Green dot**: Unread message from client
   - Client name and email
   - Preview of last message
   - Time/date of last message
   - Total message count

#### Conversation View
Click any conversation to see the full thread:
- Messages displayed in bubble format
- **Your messages**: Appear on the right (burgundy)
- **Client messages**: Appear on the left (cream)
- Timestamps shown for each message
- Scrollable history of entire conversation

### Replying to Messages

1. Click on a conversation to open it
2. Type your reply in the text box at the bottom
3. Click **"Send"** or press Enter
4. Message is immediately encrypted and saved
5. Client sees it when they log into their portal

### Message Indicators
- **Badge on Messages nav**: Shows total unread count
- **Green dot on conversations**: Indicates unread messages
- Messages marked as read when you open the conversation

### Best Practices for Secure Messaging
1. Use for sensitive follow-up discussions
2. Keep records of important client communications
3. Respond within 24-48 hours
4. Use for scheduling clarifications
5. Document any agreement changes in writing

---

## 👥 Clients Section (ENHANCED!)

**Purpose**: Manage your client database with powerful navigation and safety tools.

### Client Navigator (Card View)

The new client navigator shows visual cards for each client:

#### What Each Card Shows
- **Client avatar**: First initial in a colored circle
- **Name and email**: Primary identification
- **Session count**: Total completed sessions
- **Revenue**: Lifetime value
- **Message indicator**: 🔴 Red dot if they have unread messages for you
- **Status badge**: 
  - 🟢 Active (normal)
  - 🟡 Suspended (temporarily restricted)
  - 🔴 Banned (permanently blocked)

#### Card Actions
- **Click card**: Opens full client detail modal
- **Hover**: Card lifts for visual feedback
- **Search**: Filter cards by name or email

### Client Detail Modal (4 Tabs)

Click any client card to open the comprehensive detail modal:

#### Tab 1: 📋 Info
- **Contact Information**: Name, email, phone, gender, pronouns
- **Account Status**: Active, Suspended, or Banned (with reason if applicable)
- **Statistics**: Total sessions, revenue, first session date
- **Quick Email**: Button to send email directly

#### Tab 2: 💬 Messages
- Full conversation history with this client
- Send new messages directly from the modal
- Messages appear in same encrypted thread
- Real-time updates

#### Tab 3: 📅 History
- Complete booking history
- Every session (pending, confirmed, completed, cancelled)
- Date, service, price, and status for each
- Click any booking to view full details

#### Tab 4: ⚠️ Actions
Safety and administrative controls:

**Account Status Management**
- **Suspend Client**: Temporarily restrict access
  - Choose duration: 1 day, 1 week, 1 month, or indefinite
  - Enter reason (required)
  - Optional: Send notification email to client
  - Client sees friendly message explaining suspension
  
- **Ban Client**: Permanently block access
  - Enter reason (required)
  - Optional: Send notification email
  - Client cannot log in or book sessions
  - Can be reversed if needed

- **Reinstate Client**: Restore full access
  - Clears suspension/ban status
  - Optional: Send welcome-back email
  - Full access immediately restored

**Admin Notes**
- Private notes only you can see
- Track important client information
- Session preferences and history
- Any concerns or special requirements

### Suspend vs. Ban: When to Use

| Action | Duration | Use Case |
|--------|----------|----------|
| **Suspend** | Temporary | Boundary violations, payment issues, cooling-off period |
| **Ban** | Permanent | Serious violations, safety concerns, repeated issues |
| **Reinstate** | Immediate | Issue resolved, second chance, mistake correction |

### Safety & Boundaries

When a client is suspended or banned:
1. ❌ Cannot log into client portal
2. ❌ Cannot submit new bookings
3. ❌ Cannot send messages
4. ✅ Their data is preserved (for records)
5. ✅ You can still view their history
6. ✅ You can reinstate at any time

**Notification Options**
When suspending or banning, you can choose to:
- Send email explaining the action
- Keep it silent (no notification)
- The email includes your stated reason

### Client Management Best Practices
1. Add notes after each session
2. Review client history before appointments
3. Use suspension for temporary boundary issues
4. Document reasons clearly for your records
5. Reinstate promptly when issues are resolved
6. Use messaging for sensitive follow-ups

---

## 🎟️ Invitation Codes Section

**Purpose**: Generate and manage exclusive access codes.

### What Are Invitation Codes?
- Unique codes that grant access to your full website
- Used instead of passwords
- Can be printed on business cards
- Can be sent to approved inquiries
- More personal than generic password

### Code Prefixes
Choose from:
- **SACRED-XXXX**: Spiritual/sacred focus
- **LOTUS-XXXX**: Beautiful, symbolic
- **HEALING-XXXX**: Therapeutic emphasis
- **BLISS-XXXX**: Positive, joyful
- **CUSTOM**: Enter your own prefix

The XXXX will be random characters (e.g., SACRED-H8K2)

### Generating New Codes

1. Click **"+ Generate New Code"**
2. Modal opens with options:
   - **Prefix**: Choose from dropdown or enter custom
   - **Single Use**: Toggle on/off
     - ON = Code works once then deactivates
     - OFF = Code can be used multiple times
   - **Expiration Date**: Optional
     - Leave blank = never expires
     - Set date = code expires at midnight on that date
   - **Note**: Optional reminder for yourself
     - Example: "Business card batch May 2026"
3. Click **"Generate Code"**
4. Code is created and shown immediately

### Code List View
Each code displays:
- **The Code**: Large, easy to read
- **Created**: When you generated it
- **Expires**: Expiration date (if set)
- **Used**: Whether it's been redeemed
- **Redeemed By**: Who used it (if single-use and used)
- **Status Badge**: Active, Used, or Expired
- **Note**: Your reminder note

### Actions on Codes

#### Deactivate Code
- Click the "Deactivate" button
- Makes code unusable
- Useful if you need to revoke access
- Can't be reactivated (generate a new one instead)

#### Print View
1. Select multiple codes (checkboxes)
2. Click **"Print Selected (X)"**
3. Opens printer-friendly page with:
   - Your business name
   - Instructions for using code
   - Each selected code formatted nicely
   - Cut lines for business card size
4. Print and cut to distribute

### Filtering Codes
- **All**: Every code you've generated
- **Active**: Currently usable codes
- **Used**: Single-use codes that have been redeemed
- **Expired**: Codes past their expiration date

### Business Card Workflow
1. Generate batch of codes (e.g., 50 codes)
2. All with same expiration (e.g., 6 months out)
3. Add note: "Business card batch May 2026"
4. Select all new codes
5. Click "Print Selected"
6. Print on cardstock or give to printer
7. Cut and distribute

### Best Practices
- Generate codes in batches for events
- Use expiration dates for limited promotions
- Single-use codes for one-time gifts
- Multi-use codes for business cards
- Add notes to track code batches
- Regularly review and deactivate unused old codes

---

## ✏️ Content Section

**Purpose**: Manage all website content without touching code.

### Services Management

#### Viewing Services
- List shows all services with:
  - Service name
  - Duration (in minutes)
  - Price
  - Active status (toggle)

#### Adding New Service
1. Click **"+ Add Service"**
2. Enter:
   - **Service Name**: e.g., "3 Hour Extended Session"
   - **Duration**: In minutes (e.g., 180)
   - **Price**: In dollars (e.g., 650)
3. Click **"Add Service"**
4. Service is immediately available for booking

#### Editing Service
1. Click the edit icon (✏️) on any service
2. Modify name, duration, or price
3. Click **"Save"**
4. Changes reflect immediately on booking form

#### Activating/Deactivating Services
- Toggle the green/red status button
- **Active** (green): Appears on booking form
- **Inactive** (red): Hidden from clients
- Useful for seasonal or temporary offerings

#### Deleting Service
- Click the trash icon (🗑️)
- Confirms before deletion
- **Warning**: Cannot be undone
- Existing bookings with that service remain unaffected

### Testimonials Management

#### Viewing Testimonials
- List shows all testimonials with:
  - Author name
  - Preview of text
  - Featured status
  - Active status (visible on site or not)

#### Adding New Testimonial
1. Click **"+ Add Testimonial"**
2. Enter:
   - **Author Name**: Client name or initials
   - **Testimonial Text**: Their quote/review
   - **Featured**: Toggle if this should be prominently displayed
3. Click **"Add Testimonial"**
4. Review and activate when ready

#### Editing Testimonial
1. Click edit icon (✏️)
2. Modify text, author, or featured status
3. Save changes

#### Managing Visibility
- **Active** (green toggle): Shown on website
- **Inactive** (red toggle): Hidden from public
- **Featured**: Shown more prominently in testimonials section

#### Deleting Testimonial
- Click trash icon (🗑️)
- Confirms before deletion
- Removes from website immediately

### FAQs Management

#### Viewing FAQs
- Displayed in order they appear on website
- Shows:
  - Question
  - Answer preview
  - Order number
  - Active status

#### Adding New FAQ
1. Click **"+ Add FAQ"**
2. Enter:
   - **Question**: e.g., "What should I bring to my session?"
   - **Answer**: Full response (can include line breaks)
   - **Order**: Position in FAQ list (1 = first)
3. Click **"Add FAQ"**
4. Activate when ready to show on site

#### Editing FAQ
1. Click edit icon (✏️)
2. Modify question, answer, or order
3. Save changes
4. Changes appear immediately on website

#### Reordering FAQs
- Edit the "Order" number
- Lower numbers appear first (1, 2, 3...)
- Duplicate numbers are allowed but not recommended

#### Deleting FAQ
- Click trash icon (🗑️)
- Removes from website

### Site Settings

#### Editable Settings
- **Site Name**: Appears in headers and communications
- **Tagline**: Subtitle/description
- **Location**: City/region information

#### Updating Site Settings
1. Modify any field
2. Click **"Save Settings"**
3. Changes reflect across entire site

### Content Best Practices
1. Keep services current with your offerings
2. Add new testimonials as you receive permission
3. Feature your best testimonials
4. Keep FAQs updated with common questions
5. Use clear, welcoming language
6. Regularly review and refresh content

---

## ⚙️ Settings Section

**Purpose**: Configure availability, email, and system settings.

### Availability Settings

#### Available Days
- Check boxes for days you offer sessions
- Common patterns:
  - Weekdays only: Mon-Fri
  - Include weekends: Add Sat/Sun
  - Part-time: Select specific days
- These days are shown to clients as "Ravi's typical availability"

#### Available Time Slots
- Click **"+ Add Time Slot"**
- Enter time in format: "9:00 AM" or "2:00 PM"
- Add all your typical session start times
- Click X to remove a time slot
- Slots shown to clients on booking form

#### Blocking Specific Dates
- Click **"+ Block Date"**
- Select date from calendar picker
- Optionally add reason: "Vacation", "Conference", etc.
- Click **"Add Blocked Date"**
- Blocked dates:
  - Show as unavailable on calendar
  - Prevent accidental booking
  - Can be removed by clicking X

#### Saving Availability
- Click **"Save Availability Settings"**
- Changes apply immediately to:
  - Calendar view
  - Booking form display
  - Client portal information

### Email Settings

**Purpose**: Configure automated email notifications.

#### Email Server Configuration
If you want automated emails:
1. **SMTP Host**: Your email provider's server
   - Gmail: smtp.gmail.com
   - Outlook: smtp-mail.outlook.com
2. **SMTP Port**: Usually 587 or 465
3. **Email Address**: Your sending email
4. **Email Password**: App-specific password (not your regular password)
5. **From Name**: How you want to appear
   - Example: "Ravi's Sacred Healing"

**Important**: Use app-specific passwords for security:
- Gmail: Account Settings → Security → App passwords
- Outlook: Account Settings → Security → App passwords

#### Email Toggles
- **Email Notifications**: Master on/off switch
- **Auto-Confirmation Email**: Send when you confirm booking
- **Reminder Emails**: Send before appointments
- **Reminder Hours**: How many hours before (typically 24)

#### Email Templates
Automated emails include:
- **Confirmation**: "Your session is confirmed for [date] at [time]"
- **Reminder**: "Your session with Ravi is tomorrow at [time]"
- **Magic Link**: Secure login link for returning clients

#### Testing Email Setup
1. Configure settings and save
2. Confirm a test booking
3. Choose "Yes" when prompted to send confirmation
4. Check the client's email

#### Email Best Practices
- Set up early for professional communication
- Test with your own email first
- Keep reminder at 24 hours (good balance)
- Monitor email delivery (check spam folders)

---

## 📤 Export & Backup Section

**Purpose**: Download data for records and create safety backups.

### Export Bookings to CSV
- Click **"Download CSV"**
- Downloads spreadsheet with all bookings
- Includes:
  - Client info
  - Service details
  - Dates and times
  - Status
  - Revenue
- **Use for**:
  - Accounting and taxes
  - External scheduling systems
  - Data analysis
  - Year-end reports

### Export Clients to CSV
- Click **"Download CSV"**
- Downloads client list with:
  - Names and contact info
  - Session counts
  - Total revenue
  - Last contact dates
  - Tags
- **Use for**:
  - Mailing lists
  - CRM systems
  - Client analysis
  - Marketing campaigns

### Full Backup
- Click **"Download Backup"**
- Downloads complete JSON backup containing:
  - All bookings
  - All clients
  - All inquiries
  - All invitation codes
  - All content (services, FAQs, testimonials)
  - All settings
- **Encrypted** for security
- **Use for**:
  - Safety backups (do weekly!)
  - Moving to new server
  - Disaster recovery

### Restore from Backup
1. Click **"Upload Backup"**
2. Select your backup JSON file
3. Confirms: "This will replace all current data"
4. Click OK to restore
5. System reloads with restored data

**Warning**: Restore replaces everything. Make a current backup first!

### Backup Best Practices
1. **Weekly backups** - Download every Sunday
2. **Before major changes** - Backup before bulk deletions
3. **Store safely** - Keep backups in cloud storage or external drive
4. **Name clearly** - e.g., "ravi-backup-2026-01-28.json"
5. **Test restores** - Occasionally verify backups work

---

## 🎭 Demo Mode

**Purpose**: Demonstration and testing tools.

### Demo Invitation Code
**Code**: `DEMO-2026`
- Use at /portal.html
- Allows instant access to full site
- Perfect for showing system to others
- No email required

### Demo Walkthrough
Step-by-step guide showing:
1. Landing page → inquiry form
2. Portal → enter DEMO-2026 code
3. Full site → submit booking
4. Admin panel → manage everything

### Populate Demo Data
- Click **"✨ Populate Demo Data"**
- Instantly adds:
  - 4 sample bookings (various statuses)
  - 2 clients with history
  - 2 inquiries to review
  - 2 invitation codes
- **Use for**:
  - Testing the system
  - Learning the interface
  - Demonstrating to others
  - Training purposes

### Clear All Data
- Click **"🗑️ Clear All Data"**
- **Requires two confirmations** (safety)
- Deletes everything:
  - All bookings
  - All clients
  - All inquiries
  - All invitation codes
- Settings and content remain
- **Use for**:
  - Fresh start
  - Clearing test data
  - Resetting for real use

**Warning**: This cannot be undone. Make a backup first!

---

## 🔍 Common Tasks Quick Reference

### Processing a New Booking
1. Go to **Bookings** section
2. Click on the pending booking
3. Review intake information
4. Enter confirmed date and time
5. Click **"Confirm Booking"**
6. Choose "Yes" to send confirmation email
7. Booking appears on calendar

### Responding to an Inquiry
1. Go to **Inquiries** section
2. Read their message
3. Click **"Send Invitation"** (📧)
4. Code is generated automatically
5. Send code to client via email or text
6. They can now access your site

### Generating Business Card Codes
1. Go to **Invitation Codes**
2. Click **"+ Generate New Code"**
3. Choose prefix (e.g., LOTUS)
4. Set expiration (e.g., 6 months)
5. Leave "Single Use" OFF
6. Add note: "Business cards May 2026"
7. Repeat for desired quantity (e.g., 50 codes)
8. Select all new codes
9. Click **"Print Selected"**
10. Print and cut

### Completing a Session
1. Go to **Bookings** section
2. Find the booking
3. Click to open details
4. Add **Session Notes** (private, for your records)
5. Click **"Mark as Completed"**
6. Client is automatically added to Clients database
7. Revenue updates in dashboard

### Blocking Vacation Days
1. Go to **Settings** section
2. Under **Availability**
3. Click **"+ Block Date"**
4. Select each date
5. Add reason: "Vacation"
6. Click **"Save Availability Settings"**
7. Dates show as blocked on calendar

### Updating Your Services
1. Go to **Content** section
2. Find **Services**
3. Edit existing or add new
4. Set price and duration
5. Toggle active/inactive
6. Changes appear immediately on booking form

---

## 💡 Tips & Best Practices

### Daily Routine
- ✅ Check Inquiries (morning)
- ✅ Review new Bookings (morning)
- ✅ Confirm appointments (within 24 hours)
- ✅ Add session notes after each session
- ✅ Check Calendar for tomorrow's sessions

### Weekly Routine
- ✅ Download backup (Sunday)
- ✅ Review pending bookings
- ✅ Send reminders for upcoming week
- ✅ Update blocked dates if needed
- ✅ Review revenue statistics

### Monthly Routine
- ✅ Export bookings for accounting
- ✅ Review and update content
- ✅ Generate new invitation codes if running low
- ✅ Archive old completed bookings
- ✅ Review client list and add notes

### Professional Communication
- Respond to inquiries within 24-48 hours
- Confirm bookings promptly
- Send reminders 24 hours before sessions
- Keep admin notes detailed but professional
- Follow up with completed clients

### Data Management
- Weekly backups (non-negotiable!)
- Regular exports for tax records
- Descriptive notes on clients
- Consistent tagging system
- Clean up old inquiries monthly

### Security
- Log out when finished
- Change password every 3-6 months
- Never share admin credentials
- Keep backup files secure
- Use strong, unique password

---

## 🆘 Troubleshooting

### "Can't log in"
- Check caps lock is off
- Verify username is exactly: ravi
- Contact system administrator for password reset

### "Bookings not showing on calendar"
- Ensure booking status is "Confirmed"
- Verify confirmed date is set
- Both status AND date are required

### "Emails not sending"
- Check Settings → Email configuration
- Verify SMTP details are correct
- Ensure you're using app-specific password
- Check if email notifications toggle is ON

### "Invitation code not working"
- Check if code is active (not deactivated)
- Verify code hasn't expired
- If single-use, check if already used
- Try copy-pasting code instead of typing

### "Lost data after backup restore"
- Backup restore replaces all data
- Check if you selected correct backup file
- Always backup before restoring

### "Can't export CSV"
- Browser may be blocking download
- Check browser's download settings
- Try different browser
- Ensure popup blocker allows downloads

---

## 📞 Getting Help

### Finding Information
1. **This User Guide**: Comprehensive reference
2. **Demo Mode**: Practice in safe environment
3. **Tooltips**: Hover over (?) icons for help

### System Information
- **Server**: Node.js with Express
- **Database**: Encrypted JSON files
- **Security**: AES-256-GCM encryption
- **Authentication**: JWT tokens

### Best Practices
- Use Demo Mode to learn without risk
- Make backups before major changes
- Document your processes
- Keep this guide handy

---

## 🎯 Quick Start Checklist

Getting started with your system:

- [ ] Log in to admin panel
- [ ] Change default password (Settings)
- [ ] Set your availability (days and times)
- [ ] Review and customize services
- [ ] Update FAQs as needed
- [ ] Configure email settings (optional)
- [ ] Generate invitation codes for business cards
- [ ] Download your first backup
- [ ] Process a test booking (use Demo Mode)
- [ ] Add your first real client

---

## 🌟 Advanced Features

### Client Tags System
Create your own tagging system:
- **regular**: Weekly/biweekly clients
- **monthly**: Monthly appointments
- **new**: First-time clients
- **referred**: Came via referral
- **vip**: Special clients

### Revenue Tracking
- Automatically calculated from completed bookings
- Export to CSV for detailed analysis
- Track by service type
- Monitor monthly trends

### Communication Templates
- Confirmation emails (automatic)
- Reminder emails (automatic)
- Custom emails (manual)
- SMS notifications (if configured)

### Calendar Integration
- Visual monthly view
- Upcoming sessions sidebar
- Blocked dates display
- Click-through to booking details

---

## 📚 Glossary

**Booking**: A client's session application
**Inquiry**: Initial contact from landing page
**Invitation Code**: Access code for full site
**Session**: The actual healing appointment
**Client**: Someone who has completed at least one booking
**Confirmed**: Booking with scheduled date/time
**Pending**: New booking awaiting your review
**Blocked Date**: Day you're unavailable
**Admin Notes**: Your private notes on bookings/clients
**Session Notes**: Post-session private notes

---

*This guide covers all features of your admin dashboard. Bookmark this page for easy reference!*

**System Version**: 1.0  
**Last Updated**: January 2026

🪷 Built with love for Ravi's Sacred Healing Practice
