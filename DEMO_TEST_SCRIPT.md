# 🎭 Demo Test Script for Ravi

**Last Updated:** 2026-02-01  
**Server URL:** http://localhost:3000  
**Admin URL:** http://localhost:3000/admin.html

---

## 🚀 Pre-Demo Checklist

- [ ] Server running (`node server.js`)
- [ ] Demo data populated (Admin → Settings → Populate Demo Data)
- [ ] Browser cleared of old sessions (Ctrl+Shift+Delete)
- [ ] Two browser windows ready (one for admin, one for client)

---

## 📋 FULL FEATURE TEST SCRIPT

### PART 1: Public Website Tour (5 min)

**Open:** http://localhost:3000

1. **Password Gate**
   - [ ] Gate appears requiring password
   - [ ] Enter: `DEMO-2026`
   - [ ] Gate dissolves, site loads

2. **Landing Page**
   - [ ] Hero section with Ravi's welcome message
   - [ ] Smooth scroll navigation works
   - [ ] "What to Expect" shows steps 1-2 on top row, 3-4 on bottom row

3. **Services Section (Clickable Cards!)**
   - [ ] Click any service card (e.g., "$444 Standard Session")
   - [ ] Card shows selected state (burgundy outline)
   - [ ] Scroll down to booking form
   - [ ] Verify that service is PRE-SELECTED in "Select Your Service"

4. **Testimonials & FAQs**
   - [ ] Testimonials display properly
   - [ ] FAQs expand/collapse on click

---

### PART 2: Client Booking Flow (5 min)

**Stay on:** http://localhost:3000 → Scroll to booking form

1. **Complete Intake Form**
   - [ ] Fill out:
     - Name: "Demo Client"
     - Email: "demo@test.com"
     - Phone: (503) 555-1234 (auto-formats!)
     - Gender: Select any
     - Pronouns: Any
   - [ ] Service pre-selected from card click works
   - [ ] Enter availability text
   - [ ] Fill intentions (optional for demo)

2. **Agreements**
   - [ ] Check all required boxes:
     - Age confirmation (21+)
     - Consent to touch
     - Safety acknowledgment
     - Legal services acknowledgment
     - Cancellation policy
     - Confidentiality

3. **Submit Booking**
   - [ ] Click "Submit Application"
   - [ ] Success message appears
   - [ ] Booking confirmation shown

---

### PART 3: Admin Dashboard Tour (10 min)

**Open:** http://localhost:3000/admin.html

1. **Login**
   - [ ] Username: `ravi`
   - [ ] Password: `healing2026` (or your custom password)
   - [ ] Dashboard loads

2. **Overview Page**
   - [ ] Stats cards show: Bookings, Confirmed, Pending, Completed, Revenue, Clients
   - [ ] Recent bookings list visible
   - [ ] Your new demo booking appears as "Pending"

3. **Inquiries Section**
   - [ ] Click "Inquiries" in left nav
   - [ ] Shows landing page contact form submissions
   - [ ] Can send invitation code
   - [ ] Can archive or delete

4. **Bookings Section**
   - [ ] Click "Bookings" in left nav
   - [ ] Filter buttons work (All, Pending, Confirmed, etc.)
   - [ ] Click the new demo booking
   - [ ] Modal shows full intake details
   - [ ] Set confirmed date and time
   - [ ] Click "Confirm Booking"
   - [ ] Status changes to "Confirmed"

5. **Calendar Section**
   - [ ] Click "Calendar" in left nav
   - [ ] Navigate months with arrows
   - [ ] Confirmed booking appears on scheduled date
   - [ ] Click day to see booking details
   - [ ] "Upcoming Sessions" panel on right

---

### PART 4: Client Navigator & Management (5 min)

**Stay in Admin → Click "Clients"**

1. **Client Card Grid**
   - [ ] Visual cards for each client
   - [ ] Shows: Avatar, name, email, sessions, revenue
   - [ ] Search box filters cards in real-time
   - [ ] Red dot appears if client has unread messages

2. **Click a Client Card**
   - [ ] Full modal opens with 4 tabs

3. **Tab 1: Info**
   - [ ] Contact information displayed
   - [ ] Account status shown
   - [ ] Session statistics

4. **Tab 2: Messages**
   - [ ] Conversation thread displayed
   - [ ] Can send messages to client
   - [ ] Messages encrypted

5. **Tab 3: History**
   - [ ] All bookings for this client
   - [ ] Status color-coded

6. **Tab 4: Actions (Important!)**
   - [ ] Suspend button (temporary block)
   - [ ] Ban button (permanent block)
   - [ ] Admin notes field
   - [ ] Test suspend: Click "Suspend Client"
     - [ ] Confirmation modal appears
     - [ ] Choose duration (1 day, 1 week, etc.)
     - [ ] Enter reason
     - [ ] Toggle email notification
     - [ ] Confirm suspension
   - [ ] Client status changes to "Suspended"
   - [ ] Reinstate button appears
   - [ ] Click "Reinstate Client" to restore access

---

### PART 5: Secure Messaging System (5 min)

**In Admin → Click "Messages"**

1. **Admin Inbox**
   - [ ] List of client conversations
   - [ ] Green dot = unread messages
   - [ ] Click a conversation
   - [ ] Full message thread displays
   - [ ] Your messages on right (burgundy)
   - [ ] Client messages on left (cream)

2. **Reply to Client**
   - [ ] Type message in text box
   - [ ] Click "Send"
   - [ ] Message appears in thread

**Now test from Client side:**

3. **Open Client Portal**
   - [ ] Go to: http://localhost:3000/portal.html
   - [ ] Login with invitation code or magic link
   - [ ] (Use DEMO-2026 code + any email for demo)

4. **Client Messages**
   - [ ] Click "Message Ravi" quick action
   - [ ] Previous messages visible
   - [ ] Type and send a message
   - [ ] Message appears in thread

5. **Verify in Admin**
   - [ ] Return to admin Messages
   - [ ] New message from client visible
   - [ ] Green dot indicator shows unread

---

### PART 6: Client Portal Features (5 min)

**Stay in Portal:** http://localhost:3000/portal.html

1. **Quick Actions**
   - [ ] Book Session → Links to booking form
   - [ ] Message Ravi → Opens secure chat
   - [ ] Share Experience → Opens testimonial form
   - [ ] Guidelines → Opens client guide (NEW!)
   - [ ] Preferences → Notification settings
   - [ ] Sign Out → Returns to login

2. **Client Guidelines (Important!)**
   - [ ] Click "Guidelines" quick action
   - [ ] Guide opens with:
     - Welcome message
     - Portal usage instructions
     - Secure messaging explanation
     - Sacred Container Agreement
     - Client commitments
     - Ravi's commitments
     - Terms of Service reminders

3. **Appointments**
   - [ ] Upcoming appointments shown
   - [ ] Session history visible
   - [ ] Can accept/reschedule proposed times

---

### PART 7: Content Management (3 min)

**In Admin → Click "Content"**

1. **Services**
   - [ ] Edit service prices/names
   - [ ] Add new service
   - [ ] Toggle service active/inactive

2. **Testimonials**
   - [ ] Add new testimonial
   - [ ] Feature/unfeature
   - [ ] Toggle visibility

3. **FAQs**
   - [ ] Edit existing FAQ
   - [ ] Reorder with Order field
   - [ ] Add new FAQ

---

### PART 8: Settings & Backups (3 min)

**In Admin → Click "Settings"**

1. **Availability**
   - [ ] Set available days
   - [ ] Add time slots
   - [ ] Block specific dates

2. **Email Settings**
   - [ ] Configure SMTP (optional for demo)
   - [ ] Toggle auto-confirmations

3. **Backup**
   - [ ] Click "Create Backup"
   - [ ] Backup created with timestamp
   - [ ] Download backup option

---

### PART 9: Invitation Codes (2 min)

**In Admin → Click "Invitation Codes"**

1. **Generate Code**
   - [ ] Click "+ Generate New Code"
   - [ ] Choose prefix (SACRED-, LOTUS-, etc.)
   - [ ] Set single-use or multi-use
   - [ ] Set expiration (optional)
   - [ ] Code generates successfully

2. **Manage Codes**
   - [ ] Filter: Active, Used, Expired
   - [ ] Deactivate a code
   - [ ] Print view for business cards

---

## ✅ Demo Success Criteria

By the end of this demo, Ravi should see:

1. ✅ **Professional Website** with beautiful design
2. ✅ **Clickable Service Cards** that pre-select in booking form
3. ✅ **Complete Booking System** with intake form
4. ✅ **Client Management** with visual card navigator
5. ✅ **Secure Messaging** with end-to-end encryption
6. ✅ **Ban/Suspend System** for boundary enforcement
7. ✅ **Client Guidelines** reinforcing sacred container
8. ✅ **Calendar** for scheduling overview
9. ✅ **Content Management** for easy updates
10. ✅ **Backup System** for data safety

---

## 🔧 Quick Commands

```bash
# Start Server
node server.js

# Server runs on port 3000
# Client Site: http://localhost:3000
# Admin Panel: http://localhost:3000/admin.html
# Client Portal: http://localhost:3000/portal.html

# Demo Access
# Password Gate: DEMO-2026
# Admin: ravi / healing2026
```

---

## 💡 Demo Tips

1. **Two Browser Windows**: Keep admin open in one, client in another
2. **Populate Demo Data First**: Settings → Scroll down → "Populate Demo Data"
3. **Show Real-time Updates**: Send message from portal, show it appear in admin
4. **Emphasize Security**: Highlight encrypted messaging, ban/suspend features
5. **Show Client Guide**: Demonstrate how it reinforces boundaries

---

*This script covers all major features. Estimated total demo time: 35-40 minutes.*
