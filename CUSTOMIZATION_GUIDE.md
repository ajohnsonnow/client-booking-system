# Customization Guide - Generic Booking System

This guide will walk you through customizing the generic booking system for your specific business.

---

## 📝 Content Customization Checklist

### Step 1: Business Configuration (config.js)

Create your config file:
```bash
cp config.example.js config.js
```

Update these sections:

#### Basic Information
- [ ] Business name
- [ ] Your name (practitioner)
- [ ] City and state
- [ ] Contact email
- [ ] Phone number (optional)

#### Branding
- [ ] Logo emoji or icon
- [ ] Primary brand color
- [ ] Accent color
- [ ] Hero background image filename

#### Services
- [ ] List all your service offerings
- [ ] Set accurate pricing
- [ ] Write clear descriptions
- [ ] Specify durations

#### Availability
- [ ] Set your available days
- [ ] List your typical time slots

---

### Step 2: HTML Content Updates

#### index.html - Main Landing Page

**Hero Section** (Lines ~96-112)
- [ ] Update business name
- [ ] Update city/state
- [ ] Write your tagline
- [ ] Update call-to-action text

**Invitation Section** (Lines ~115-147)
- [ ] Write your welcome message
- [ ] Share your unique value proposition
- [ ] Explain your approach
- [ ] Update divider emoji if desired

**About Section** (Lines ~149-165)
- [ ] Write your personal story
- [ ] Share your training/background
- [ ] Explain your philosophy
- [ ] List certifications
- [ ] Credit mentors/teachers (if applicable)

**Services Section** (Lines ~167-246)
- [ ] Update section title
- [ ] Customize "What to Expect" steps
- [ ] List all services with pricing
- [ ] Write service descriptions
- [ ] Update payment methods
- [ ] Set cancellation policy

**FAQ Section** (Lines ~248-284)
- [ ] Update all FAQ answers
- [ ] Add/remove questions as needed
- [ ] Ensure accuracy for your practice

**Testimonials** (Lines ~286-312)
- [ ] Replace with real client testimonials
- [ ] Get proper permissions
- [ ] Maintain client anonymity if preferred
- [ ] Or remove section if not applicable

**Booking Form** (Lines ~314-560)
- [ ] Customize form fields
- [ ] Update agreements/consent language
- [ ] Modify intake questions
- [ ] Update boundaries/policies

**Footer** (Lines ~565-607)
- [ ] Update business name
- [ ] Add your contact info
- [ ] List your services
- [ ] Update location

---

### Step 3: Visual Customization

#### Replace Images

Add your images to `public/` folder:

1. **Hero Background** (`hero-image.jpg`)
   - Recommended: 1920x1080px or larger
   - JPG or WebP format
   - Should represent your healing space or vibe

2. **Practitioner Photo** (`practitioner-photo.jpg`)
   - Professional headshot or full-body
   - 800x1000px recommended
   - Shows you in your element

3. **Space Photo** (`space-image.jpg`) 
   - Your healing room or office
   - Creates trust and transparency
   - 1200x800px recommended

#### Update Colors (styles.css)

Find the `:root` section (top of file) and update:

```css
:root {
  /* Your brand colors */
  --color-burgundy: #YourPrimaryColor;
  --color-gold: #YourAccentColor;
  --color-rose: #YourSecondaryColor;
  
  /* Keep these or customize further */
  --color-cream: #FDF8F3;
  --color-text: #4A403A;
}
```

#### Fonts (Optional)

To use custom fonts, add to `<head>` in HTML files:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

Then update in styles.css:
```css
:root {
  --font-body: 'Your Font', sans-serif;
  --font-heading: 'Your Heading Font', serif;
}
```

---

### Step 4: Privacy Policy Updates

#### privacy.html

Critical sections to update:

1. **Contact Information** (Line ~276-282)
   - [ ] Your email address
   - [ ] Response timeframes
   - [ ] Contact methods

2. **Business Information** (Line ~166-170)
   - [ ] Your privacy philosophy
   - [ ] How you handle data
   - [ ] Your commitments

3. **Legal Requirements**
   - [ ] Add required disclosures for your location
   - [ ] GDPR compliance (if EU clients)
   - [ ] CCPA compliance (if California clients)
   - [ ] HIPAA compliance (if healthcare)

4. **Footer** (Line ~286-305)
   - [ ] Business name
   - [ ] Location
   - [ ] Copyright year
   - [ ] Contact info

---

### Step 5: Portal & Admin Updates

#### portal.html - Client Portal

- [ ] Update welcome message (Line ~30-45)
- [ ] Customize booking form fields
- [ ] Update service options to match config
- [ ] Modify consent/agreement language
- [ ] Update location references

#### admin.html - Admin Dashboard

Most content is generic, but you may want to:

- [ ] Update welcome message (Line ~990-1000)
- [ ] Customize email templates
- [ ] Modify dashboard branding
- [ ] Update demo code info

---

### Step 6: Environment Configuration

#### .env File Setup

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Admin Access
ADMIN_PASSWORD=your-very-secure-password-here

# Encryption Key (auto-generated on first run, or set manually)
ENCRYPTION_KEY=

# Email Configuration (for Gmail - free)
EMAIL_SERVICE=gmail
EMAIL_USER=yourbusiness@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM_NAME=Your Business Name

# SMS Notifications (optional - Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Site Configuration
SITE_PASSWORD=optional-visitor-password
```

**Important:**
- Use a strong admin password (12+ characters, mixed case, numbers, symbols)
- Never commit `.env` to version control
- Use app-specific passwords for Gmail (not your regular password)

---

## 🎨 Advanced Customization

### Adding New Services

1. Add to `config.js`:
```javascript
services: [
  {
    id: "new-service",
    name: "New Service Name",
    duration: "60 minutes",
    price: "$150",
    description: "What makes this service special"
  }
]
```

2. Add to booking form in `portal.html`:
```html
<div class="service-option">
  <input type="radio" name="service" value="new-service" id="service-new">
  <label for="service-new" class="service-option-label">
    <span class="service-option-price">$150</span>
    <span class="service-option-name">New Service Name</span>
  </label>
</div>
```

### Customizing Email Templates

Edit `communications.js` - find the email templates around line 150-300:

```javascript
function sendBookingConfirmation(booking) {
  const emailContent = `
    <h2>Booking Confirmed!</h2>
    <p>Hello ${booking.name},</p>
    <p>Your booking has been confirmed...</p>
    <!-- Customize this HTML -->
  `;
  // ...
}
```

### Modifying Form Fields

To add custom intake questions:

1. Add HTML in `portal.html`:
```html
<div class="form-group">
  <label for="custom-field">Your Question?</label>
  <input type="text" id="custom-field" name="customField">
</div>
```

2. Update form processing in `app.js`:
```javascript
const formData = {
  // ... existing fields
  customField: document.getElementById('custom-field').value
};
```

3. Update server endpoint in `server.js` to save the new field

---

## 🚀 Testing Your Customizations

### Local Testing Checklist

- [ ] Run `npm start` and visit http://localhost:3000
- [ ] Test the inquiry form
- [ ] Try logging into admin (/admin.html)
- [ ] Create a test invitation code
- [ ] Book a test appointment
- [ ] Check email notifications (if configured)
- [ ] Test mobile responsiveness
- [ ] Verify all links work
- [ ] Check all images load
- [ ] Test booking flow end-to-end

### Pre-Launch Checklist

- [ ] All Ravi-specific content removed
- [ ] Your business info everywhere
- [ ] Privacy policy updated and accurate
- [ ] Contact info correct
- [ ] Images uploaded and displaying
- [ ] Colors match your brand
- [ ] Services and pricing accurate
- [ ] Email notifications working
- [ ] Admin login working
- [ ] Backup system tested
- [ ] SSL certificate installed (for production)
- [ ] Domain name configured
- [ ] Performed security review

---

## 💡 Tips & Best Practices

### Content Writing

- **Be authentic**: Share your real story and approach
- **Be clear**: Avoid jargon, explain your process simply
- **Be professional**: Maintain appropriate boundaries
- **Be specific**: Give concrete details about services
- **Be welcoming**: Create an inviting, safe tone

### Photography

- **Professional quality**: Invest in good photos
- **Good lighting**: Natural light works best
- **Authentic**: Show your real space and presence
- **Consistent**: Match your brand aesthetic
- **Optimized**: Compress images for web (use TinyPNG.com)

### Pricing Strategy

- **Research competitors**: Know your market
- **Value-based**: Price on value, not just time
- **Clear packages**: Make choices easy
- **Payment options**: Offer flexibility where possible
- **Update regularly**: Review and adjust as needed

### Privacy & Trust

- **Be transparent**: Explain how you handle data
- **Secure everything**: Use HTTPS in production
- **Regular backups**: Automate and test restores
- **Consent-focused**: Make agreements clear
- **Professional boundaries**: Document and maintain

---

## 🆘 Common Customization Issues

### "My changes aren't showing"

1. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
2. Make sure you're editing files in `generic-version` branch
3. Restart the server (`npm start`)
4. Check browser console for errors

### "Images not loading"

1. Images must be in `public/` folder
2. Use correct filename in HTML (case-sensitive)
3. Check image file extensions (.jpg, .png, .webp)
4. Verify file paths are relative (`image.jpg` not `/image.jpg`)

### "Emails not sending"

1. Check `.env` file has correct EMAIL_* variables
2. For Gmail: Use app-specific password, not account password
3. Enable "Less secure app access" (or use app password)
4. Check `communications.js` is properly configured
5. Check server console for error messages

### "Can't login to admin"

1. Check `ADMIN_PASSWORD` in `.env` file
2. Make sure there are no extra spaces in password
3. Try resetting: Change password in `.env` and restart server
4. Check browser console for errors

---

## 📚 Additional Resources

- **Email Setup**: See `FREE_COMMUNICATIONS_SETUP.md`
- **Deployment**: See `SETUP_GUIDE.md`
- **Admin Guide**: See `ADMIN_USER_GUIDE.md`
- **Backups**: See `BACKUP_GUIDE.md`

---

## ✅ Customization Complete?

Once you've completed all customizations:

1. Test everything thoroughly
2. Create a backup
3. Deploy to production
4. Monitor for first few days
5. Gather feedback and iterate

**Congratulations!** Your custom booking system is ready to launch! 🎉
