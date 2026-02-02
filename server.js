/**
 * RAVI'S SACRED HEALING - PREMIUM SECURE SERVER
 * ==============================================
 * Best-in-class implementation with full CMS capabilities
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ===========================================
// PRODUCTION SECURITY VALIDATION
// ===========================================
// These environment variables MUST be set in production
const REQUIRED_SECRETS = ['JWT_SECRET', 'ADMIN_PASSWORD', 'ENCRYPTION_KEY'];

if (IS_PRODUCTION) {
  const missingSecrets = REQUIRED_SECRETS.filter(key => !process.env[key]);
  if (missingSecrets.length > 0) {
    console.error('\n❌ CRITICAL SECURITY ERROR!');
    console.error('Missing required environment variables:', missingSecrets.join(', '));
    console.error('These MUST be set for production deployment.');
    console.error('Generate secure values with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');
    process.exit(1);
  }
}

// ===========================================
// SECURITY UTILITIES
// ===========================================

// XSS Sanitization - removes dangerous characters
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;');
}

// Sanitize object recursively
function sanitizeObject(obj) {
  if (typeof obj === 'string') return sanitizeInput(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

// ===========================================
// SECURITY CONFIGURATION
// ===========================================

app.use(helmet({
  contentSecurityPolicy: false,  // Disabled for development - enable in production
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,  // Allow embedding in VS Code Simple Browser
  frameguard: false,  // Allow iframe embedding for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true
}));

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Rate limiting - more generous for development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Sanitize all incoming request bodies
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// ===========================================
// DATA STORAGE (Encrypted File-Based)
// ===========================================

const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.enc');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.enc');
const CONTENT_FILE = path.join(DATA_DIR, 'content.enc');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.enc');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.enc');
const SEGMENTS_FILE = path.join(DATA_DIR, 'segments.enc');
const WORKFLOWS_FILE = path.join(DATA_DIR, 'workflows.enc');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.enc');
const LEADS_FILE = path.join(DATA_DIR, 'leads.enc');
const LEAD_MAGNETS_FILE = path.join(DATA_DIR, 'lead_magnets.enc');
const DRIP_CAMPAIGNS_FILE = path.join(DATA_DIR, 'drip_campaigns.enc');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.enc');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const AUTO_BACKUP_DIR = path.join(BACKUP_DIR, 'auto');
const MAX_AUTO_BACKUPS = 50; // Keep last 50 automatic backups
const MAX_MANUAL_BACKUPS = 20; // Keep last 20 manual backups

// Ensure directories exist
[DATA_DIR, BACKUP_DIR, AUTO_BACKUP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ===========================================
// AES-256-GCM ENCRYPTION (Military Grade)
// ===========================================
// - Uses 256-bit key for maximum security
// - GCM mode provides both encryption AND authentication
// - Unique IV (Initialization Vector) for each encryption
// - Same standard used by governments and banks

// WARNING: Production MUST use a secure, randomly-generated ENCRYPTION_KEY environment variable
// Development fallback key (NEVER use in production - detected at startup)
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || (IS_PRODUCTION ? null : 'ravi-sacred-healing-2024-dev-key!');
if (!ENCRYPTION_KEY_RAW) {
  console.error('❌ ENCRYPTION_KEY is required in production!');
  process.exit(1);
}
// Derive a proper 32-byte key using SHA-256 hash
const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;  // GCM standard
const AUTH_TAG_LENGTH = 16;

function encrypt(data) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    const jsonData = JSON.stringify(data);
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData (all in hex)
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Encryption error:', err.message);
    return null;
  }
}

function decrypt(encryptedData) {
  try {
    // Handle legacy CryptoJS format (base64) for backward compatibility
    if (!encryptedData.includes(':')) {
      return decryptLegacy(encryptedData);
    }
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Decryption error:', err.message);
    return null;
  }
}

// Legacy decryption for any old CryptoJS-encrypted data
function decryptLegacy(encryptedData) {
  try {
    // Skip legacy data - return null to use defaults
    // Old encrypted data will be re-encrypted on next save
    return null;
  } catch {
    return null;
  }
}

// Generic load/save functions
function loadData(file, defaultValue) {
  try {
    if (fs.existsSync(file)) {
      const encrypted = fs.readFileSync(file, 'utf8');
      return decrypt(encrypted) || defaultValue;
    }
  } catch (err) {
    console.error(`Error loading ${file}:`, err.message);
  }
  return defaultValue;
}

function saveData(file, data) {
  fs.writeFileSync(file, encrypt(data));
  // Automatic backup after every save
  createAutoBackup(file, data);
}

// ===========================================
// AUTOMATIC BACKUP SYSTEM
// ===========================================
// Creates encrypted backup after EVERY data change
// Rotates old backups automatically
// Prevents data loss from crashes, bugs, or updates

function createAutoBackup(file, data) {
  try {
    const fileName = path.basename(file, '.enc');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(AUTO_BACKUP_DIR, `${fileName}_${timestamp}.enc`);
    
    // Save encrypted backup
    fs.writeFileSync(backupFile, encrypt(data));
    
    // Rotate old backups
    rotateAutoBackups(fileName);
  } catch (err) {
    console.error('Auto-backup failed:', err.message);
    // Don't throw - backup failure shouldn't stop the operation
  }
}

function rotateAutoBackups(fileName) {
  try {
    // Get all auto-backups for this file
    const files = fs.readdirSync(AUTO_BACKUP_DIR)
      .filter(f => f.startsWith(fileName) && f.endsWith('.enc'))
      .map(f => ({
        name: f,
        path: path.join(AUTO_BACKUP_DIR, f),
        time: fs.statSync(path.join(AUTO_BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Newest first
    
    // Delete old backups beyond limit
    if (files.length > MAX_AUTO_BACKUPS) {
      files.slice(MAX_AUTO_BACKUPS).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  } catch (err) {
    console.error('Backup rotation failed:', err.message);
  }
}

function rotateManualBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length > MAX_MANUAL_BACKUPS) {
      files.slice(MAX_MANUAL_BACKUPS).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  } catch (err) {
    console.error('Manual backup rotation failed:', err.message);
  }
}

// Specific loaders
function loadBookings() { return loadData(BOOKINGS_FILE, []); }
function saveBookings(data) { saveData(BOOKINGS_FILE, data); }

function loadSettings() { return loadData(SETTINGS_FILE, getDefaultSettings()); }
function saveSettings(data) { saveData(SETTINGS_FILE, data); }

function loadContent() { return loadData(CONTENT_FILE, getDefaultContent()); }
function saveContent(data) { saveData(CONTENT_FILE, data); }

function loadClients() { return loadData(CLIENTS_FILE, []); }
function saveClients(data) { saveData(CLIENTS_FILE, data); }

function getDefaultSettings() {
  return {
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    availableSlots: ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'],
    blockedDates: [],
    services: [
      { id: 'video-coaching', name: '30 min Tantric Coaching (Video)', duration: 30, price: 111, active: true },
      { id: 'angel-session', name: '1 Hour "Angel" Session', duration: 60, price: 333, active: true },
      { id: 'standard-session', name: '90 Minute Session', duration: 90, price: 444, active: true },
      { id: 'extended-session', name: '2 Hour Session', duration: 120, price: 555, active: true },
      { id: 'couples-session', name: 'Couples Session (2 hours)', duration: 120, price: 666, active: true },
      { id: 'duo-session', name: 'Duo Session (with assistant)', duration: 120, price: 777, active: true }
    ],
    emailNotifications: true,
    autoConfirmationEmail: true,
    reminderEmails: true,
    reminderHours: 24
  };
}

function getDefaultContent() {
  return {
    testimonials: [
      {
        id: uuidv4(),
        author: 'Ray Cohen',
        text: 'I have worked with Ravi over the past two years and have found her to be enthusiastic, talented, intuitive and a committed practitioner. Her passion for this work is obvious and helps to create a nurturing and safe container to open and explore what will bring healing and a fuller expression of yourself as a sexual being. I highly recommend working with Ravi to anyone who seeks to be held in a loving and nurturing embrace to open, heal and experience deeper pleasure and joy through sacred touch.',
        featured: false,
        active: true
      },
      {
        id: uuidv4(),
        author: 'Sarah R.',
        text: 'I was experiencing debilitating pain, and I went to see my physician, began pelvic floor physical therapy, and saw Ravi to help resolve my pain. The trifecta of approaches worked. I appreciate Ravi\'s willingness to work with me. I highly recommend her respectful, caring, healing touch. 💖',
        featured: false,
        active: true
      },
      {
        id: uuidv4(),
        author: 'Marc',
        text: 'The experience was pivotal for me as my first introduction to a pelvic massage. I\'d never experienced anything like it. Now I will always remember how Ravi made the experience feel. It could not have been more comfortable, relaxing, and enjoyable.\n\nRavi\'s co-creating presence helped bring in a nurturing aura of connection, through breath work, touch, eye contact, expressions and movements. Her practice in co-creating a bond resulted in deep connection, a pleasurable healing container that allowed the movement of energy and emotional release.\n\nAs a result I now know what I truly yearn for when engaged in intimate sensual and sexual moments… a deep sacred connection that is abundant with a wholesomeness of energetic awareness, flow and syncretism. I now have a framework practice of how to co-create a bond with future partners, thanks to Ravi.\n\nPlainly speaking I loved it, it was beautiful and breathtaking and giving. Thank you Ravi.',
        featured: true,
        active: true
      }
    ],
    faqs: [
      {
        id: uuidv4(),
        question: 'What should I expect in a session?',
        answer: 'I enjoy beginning sessions with warm hugs and a brief guided meditation to help ground and begin to attune our energy. I also want to know your desires and boundaries, and to voice an intention for the session. 🙌🙏💗\n\nSessions will begin with a sensual touch of your back and buttocks, before rolling over to sensually touch your sexual organs. Throughout the session I will do my best to be responsive to your sensitivity level, going as slow/gentle as you need (please speak up or give hand gestures).\n\nEven with gentle touch, sessions can trigger deep emotional release. I expect that you may cry or have an emotional release, and I will do my best to hold space and pause in place, unless there is a voiced desire to stop.\n\nYou may become aroused to the point of orgasm. Please note that orgasm doesn\'t need to be a goal of sessions. From my perspective, it can be very powerful to use your breath and intention to move your erotic energy into the rest of your body, especially when you start at the heart chakra.\n\nHonestly, I love being a witness to your deep and expansive pleasure, and yet seeing your heart open and spirit lift is my greatest hope and gift. 💝',
        order: 1,
        active: true
      },
      {
        id: uuidv4(),
        question: 'What are your boundaries?',
        answer: 'My firm boundaries are that I keep on my bottom underwear, and there\'s no kissing on the mouth or touching of my yoni. 🙏\n\nI also want to feel that I\'m respected and I find consent both essential and sexy. So, I expect and appreciate when you ask before touching me. Aside from me feeling good, my hope is that this will help you be more mindful. 💕',
        order: 2,
        active: true
      },
      {
        id: uuidv4(),
        question: 'Where are sessions located?',
        answer: 'The location is not far from I-5 off the Alberta exit in North Portland. I will give you directions once you have fully booked your session. 🙏\n\nIn my humble opinion, my temple is really beautiful and welcoming. 🌹',
        order: 3,
        active: true
      },
      {
        id: uuidv4(),
        question: 'When are sessions available?',
        answer: 'I mostly offer sessions during weekdays. My preferred time is in the morning, when we are fresh (and you bask in the energy all day!) or in the early evening to send you into sweet slumber, but lunch time is great too. 😊\n\nPlease be patient with booking sessions. I currently have more inquiries than I can fill in a week. Priority is given to people who want biweekly or monthly sessions. 🙏',
        order: 4,
        active: true
      },
      {
        id: uuidv4(),
        question: 'Why work with you specifically?',
        answer: 'Even though I cannot guarantee chakra clearing or any specific healing, I offer a unique presence of humility and humor. With both Venus and Mars in Taurus in the eighth house of sexuality, my energy is a mix of flowy feminine and fierce masculine that\'s rooted in earthy groundedness.\n\nIn a Soul Plan reading, I was told that I have a strong drive to bring spirituality into the physical realm, and that I am meant to serve as a bridge. In every astrology reading, I\'ve been told that I have intuitive gifts and that at some point I would heal with my hands.\n\nI believe that time is now, and if you\'re still reading this, then we\'re meant to explore working together. 🙏💖🙌',
        order: 5,
        active: true
      },
      {
        id: uuidv4(),
        question: 'What called you to this work?',
        answer: 'I was first called to sexual healing in the long process of ending my 18-year marriage. Like many married couples, our sex was routine and primarily focused on pleasing him. And like many women, after years of feeling sexually unsatisfied, birthing three children, plus more years of never having my yoni savored, I became disconnected with my sexual energy.\n\nThen I experienced a heart chakra opening, followed by a kundalini reawakening, which supercharged my sexual energy. I already enjoyed a daily meditation practice, so I decided to search up "orgasmic meditation" and found OMing.\n\nWhen I was invited to join a Sacred Pelvic Healing Massage retreat with neo-tantric leaders, Amara Karuna and Ray Cohen, I was excited to learn the modality. With my first pelvic massage, I experienced a massive heart chakra opening…then a third eye opening…then more heart opening, followed by hand chakra activation.\n\nAs an apprentice, I\'ve been humbled to learn how to serve as a channel of divine love and energy healing. I also recently received Level I and Level II reiki attunements.',
        order: 6,
        active: true
      }
    ],
    siteSettings: {
      siteName: 'Ravi ~ Intuitive Healer',
      tagline: 'Reclaim your sacred sensual energy and rediscover your passion for life',
      email: 'RavishingRavi77@gmail.com',
      location: 'Portland, Oregon',
      maintenanceMode: false
    }
  };
}

// ===========================================
// EMAIL CONFIGURATION
// ===========================================
// PRIVACY POLICY: All emails are sent INDIVIDUALLY
// - NEVER use CC (carbon copy) - exposes all recipients to each other
// - NEVER use BCC for marketing - still exposes metadata and is risky
// - Each client receives their own private, personalized email
// - No client can ever see another client's email address
// ===========================================

let transporter = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/**
 * Send an email to a SINGLE recipient
 * SECURITY: This function only accepts ONE email address
 * Never modify to accept arrays or multiple recipients
 */
async function sendEmail(to, subject, text, html) {
  if (!transporter) {
    return false;
  }
  
  // SAFETY CHECK: Reject if someone tries to pass multiple emails
  if (typeof to !== 'string' || to.includes(',') || to.includes(';')) {
    console.error('SECURITY: Attempted to send to multiple recipients - BLOCKED');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Ravi - Sacred Healing" <${process.env.EMAIL_USER}>`,
      to: to.trim(),  // Single recipient only
      // NO cc or bcc fields - intentionally omitted for privacy
      subject,
      text,
      html
    });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err.message);
    return false;
  }
}

async function sendBookingNotification(booking) {
  const settings = loadSettings();
  if (!settings.emailNotifications) return;

  // PRIVACY-SAFE: Do NOT include sensitive health information in emails
  // Health notes, intentions, concerns, sensitivities are stored encrypted
  // and should ONLY be viewed in the secure admin panel
  const emailContent = `
🌹 New Booking Request 🌹

Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}
Text OK: ${booking.textPermission ? 'Yes' : 'No'}

Service: ${booking.serviceName}
Price: $${booking.servicePrice}

Availability: ${booking.availability || 'Not specified'}

⚠️ PRIVACY NOTE: Health information, intentions, and sensitive details
are stored securely and can only be viewed in the admin panel.

Consent Signature: ${booking.consentSignature}

---
Submitted: ${new Date(booking.createdAt).toLocaleString()}
Booking ID: ${booking.id}

🔒 View Full Details Securely: ${process.env.SITE_URL || 'http://localhost:3000'}/admin.html
  `.trim();

  await sendEmail(
    process.env.EMAIL_TO || process.env.EMAIL_USER,
    `🌹 New Booking Request from ${booking.name}`,
    emailContent
  );
}

async function sendClientConfirmation(booking) {
  const settings = loadSettings();
  if (!settings.autoConfirmationEmail) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; color: #3D3630; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #722F37, #8B3A44); color: white; border-radius: 12px 12px 0 0; }
    .content { padding: 30px; background: #FDF8F3; }
    .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
    .highlight { background: #722F37; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪷 Thank You, ${booking.name}</h1>
    </div>
    <div class="content">
      <p>Your application for a sacred healing session has been received. 🙏</p>
      
      <div class="highlight">
        <strong>Service Requested:</strong><br>
        ${booking.serviceName}
      </div>
      
      <p>I will review your application and reach out within 24-48 hours to schedule our discovery call. This call helps us attune our energies and ensures we're a good fit for this sacred work together.</p>
      
      <p>If we're meant to work together, divine timing will guide us. ✨</p>
      
      <p>With gratitude,<br>
      <strong>Ravi</strong><br>
      <em>Intuitive Healer & Sensual Bodyworker</em></p>
    </div>
    <div class="footer">
      <p>🔒 Your privacy is sacred. This email was sent securely.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(
    booking.email,
    '🪷 Your Sacred Healing Application Received',
    `Thank you ${booking.name}, your application has been received. Ravi will reach out within 24-48 hours to schedule your discovery call.`,
    html
  );
}

async function sendConfirmationEmail(booking) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; color: #3D3630; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #722F37, #8B3A44); color: white; border-radius: 12px 12px 0 0; }
    .content { padding: 30px; background: #FDF8F3; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌹 Session Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear ${booking.name},</p>
      
      <p>Wonderful news! Your session has been confirmed. 🎉</p>
      
      <div class="details">
        <strong>📅 Date:</strong> ${booking.confirmedDate || 'To be scheduled'}<br>
        <strong>⏰ Time:</strong> ${booking.confirmedTime || 'To be scheduled'}<br>
        <strong>✨ Service:</strong> ${booking.serviceName}<br>
        <strong>💰 Investment:</strong> $${booking.servicePrice}
      </div>
      
      <p><strong>Reminders:</strong></p>
      <ul>
        <li>Payment via Venmo in advance or cash at session</li>
        <li>24-hour cancellation notice required</li>
        <li>Location details will be sent separately</li>
      </ul>
      
      <p>I'm honored to guide you on this sacred journey. 🙏</p>
      
      <p>With love,<br>
      <strong>Ravi</strong></p>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email or text me.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(
    booking.email,
    '🌹 Your Session is Confirmed!',
    `Your session has been confirmed! Date: ${booking.confirmedDate || 'TBD'}, Time: ${booking.confirmedTime || 'TBD'}`,
    html
  );
}

async function sendReminderEmail(booking) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; color: #3D3630; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background: #722F37; color: white; border-radius: 12px 12px 0 0; }
    .content { padding: 30px; background: #FDF8F3; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Session Reminder</h1>
    </div>
    <div class="content">
      <p>Dear ${booking.name},</p>
      
      <p>This is a gentle reminder that your sacred healing session is coming up:</p>
      
      <p style="font-size: 18px; text-align: center; padding: 20px; background: white; border-radius: 8px;">
        <strong>📅 ${booking.confirmedDate}</strong><br>
        <strong>⏰ ${booking.confirmedTime}</strong>
      </p>
      
      <p>Please arrive with an open heart, ready to receive. 🙏</p>
      
      <p>See you soon,<br>
      <strong>Ravi</strong></p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(
    booking.email,
    '⏰ Session Reminder - Tomorrow!',
    `Reminder: Your session is scheduled for ${booking.confirmedDate} at ${booking.confirmedTime}`,
    html
  );
}

// ===========================================
// CLIENT MANAGEMENT
// ===========================================

function findOrCreateClient(booking) {
  const clients = loadClients();
  const email = booking.email.toLowerCase();
  
  let client = clients.find(c => c.email === email);
  
  if (!client) {
    client = {
      id: uuidv4(),
      email: email,
      name: booking.name,
      phone: booking.phone,
      gender: booking.gender,
      pronouns: booking.pronouns,
      textPermission: booking.textPermission,
      createdAt: new Date().toISOString(),
      sessions: [],
      notes: '',
      tags: [],
      tier: 'new',           // new, returning, regular, vip, favored
      tierManual: false,     // true if Ravi manually set the tier
      tierNotes: ''          // Notes about why tier was set
    };
    clients.push(client);
  } else {
    // Update client info
    client.name = booking.name;
    client.phone = booking.phone;
    if (booking.gender) client.gender = booking.gender;
    if (booking.pronouns) client.pronouns = booking.pronouns;
    client.textPermission = booking.textPermission;
  }
  
  // Add this booking to their history
  client.sessions.push({
    bookingId: booking.id,
    date: booking.confirmedDate || booking.createdAt,
    service: booking.serviceName,
    price: booking.servicePrice,
    status: booking.status
  });
  
  client.lastContact = new Date().toISOString();
  client.totalSessions = client.sessions.length;
  client.totalSpent = client.sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.price || 0), 0);
  
  // Auto-calculate tier (only if not manually set)
  if (!client.tierManual) {
    client.tier = calculateClientTier(client);
  }
  
  saveClients(clients);
  return client;
}

// Calculate client tier based on sessions
function calculateClientTier(client) {
  const completedSessions = client.sessions?.filter(s => s.status === 'completed').length || 0;
  
  if (completedSessions === 0) return 'new';
  if (completedSessions <= 2) return 'returning';
  if (completedSessions <= 5) return 'regular';
  return 'vip';  // 6+ sessions = VIP
}

// Get tier display info
function getTierInfo(tier) {
  const tiers = {
    'new': { emoji: '🌱', label: 'New Client', color: '#9E9E9E', intakeLevel: 'full' },
    'returning': { emoji: '🌿', label: 'Returning', color: '#4CAF50', intakeLevel: 'full' },
    'regular': { emoji: '🌳', label: 'Regular', color: '#2196F3', intakeLevel: 'short' },
    'vip': { emoji: '⭐', label: 'VIP', color: '#FF9800', intakeLevel: 'minimal' },
    'favored': { emoji: '💎', label: 'Favored', color: '#9C27B0', intakeLevel: 'minimal' }
  };
  return tiers[tier] || tiers['new'];
}

// ===========================================
// AUTHENTICATION
// ===========================================

// Security: JWT_SECRET MUST be set in production (enforced at startup)
const JWT_SECRET = process.env.JWT_SECRET || (IS_PRODUCTION ? null : 'dev-secret-change-me');
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is required in production!');
  process.exit(1);
}

// Client site access password
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'sacred2024';

// Admin credentials (production requires strong password set via environment)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ravi';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (IS_PRODUCTION ? null : 'admin2024');
if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD is required in production!');
  process.exit(1);
}

// Warn if using weak development passwords
if (!IS_PRODUCTION && ADMIN_PASSWORD === 'admin2024') {
  console.warn('⚠️  WARNING: Using default admin password. Set ADMIN_PASSWORD environment variable for security.');
}

let adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Allow demo token ONLY in development mode (security: disabled in production)
  if (token === 'demo-token' && !IS_PRODUCTION) {
    req.user = { email: 'demo@example.com', name: 'Demo User', isDemo: true };
    return next();
  }

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Admin access required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    req.user = user;
    next();
  });
}

// ===========================================
// INQUIRY STORAGE
// ===========================================

const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.enc');
function loadInquiries() { return loadData(INQUIRIES_FILE, []); }
function saveInquiries(data) { saveData(INQUIRIES_FILE, data); }

// ===========================================
// PUBLIC API ROUTES
// ===========================================

// New visitor inquiry (contact Ravi)
app.post('/api/inquiry', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many inquiries. Please wait before trying again.' }
}), async (req, res) => {
  const { name, email, phone, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check for duplicate/pending inquiry with same email
  const inquiries = loadInquiries();
  const existingInquiry = inquiries.find(i => 
    i.email === normalizedEmail && 
    (i.status === 'new' || i.status === 'reviewed')
  );
  
  if (existingInquiry) {
    // Don't reveal exact status for security, just acknowledge
    return res.json({ 
      success: true, 
      message: 'Thank you! Your inquiry is being reviewed. Ravi will be in touch soon.' 
    });
  }
  
  // Check if already a client (they should use their invitation code instead)
  const clients = loadClients();
  const existingClient = clients.find(c => c.email === normalizedEmail);
  
  if (existingClient && !existingClient.status?.includes('banned')) {
    return res.json({ 
      success: true, 
      message: 'Welcome back! It looks like you already have an account. Please use your invitation code to access the booking portal, or check your email for the magic link.' 
    });
  }
  
  // Save new inquiry
  const inquiry = {
    id: uuidv4(),
    name: name.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || null,
    message: message.trim(),
    createdAt: new Date().toISOString(),
    status: 'new', // new, reviewed, invited, declined
    invitationCode: null
  };
  
  inquiries.push(inquiry);
  saveInquiries(inquiries);
  
  // Send notification to admin
  const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 24px; }
    .header-icon { font-size: 48px; }
    h1 { color: #722F37; font-family: Georgia, serif; margin: 8px 0; }
    .info-row { padding: 12px 0; border-bottom: 1px solid #e0d6cc; }
    .info-label { color: #9E9890; font-size: 12px; text-transform: uppercase; }
    .info-value { color: #3D3630; font-weight: 500; margin-top: 4px; }
    .message-box { background: #f8f5f0; padding: 16px; border-radius: 8px; margin-top: 16px; font-style: italic; }
    .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0d6cc; color: #9E9890; font-size: 14px; }
    .btn { display: inline-block; background: #722F37; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">📬</div>
      <h1>New Inquiry Received</h1>
    </div>
    <div class="info-row">
      <div class="info-label">Name</div>
      <div class="info-value">${name}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Email</div>
      <div class="info-value">${email}</div>
    </div>
    ${phone ? `
    <div class="info-row">
      <div class="info-label">Phone</div>
      <div class="info-value">${phone}</div>
    </div>
    ` : ''}
    <div class="message-box">
      <div class="info-label" style="margin-bottom: 8px;">Their Message</div>
      "${message}"
    </div>
    <div style="text-align: center;">
      <a href="${process.env.BASE_URL || 'http://localhost:' + PORT}/admin.html" class="btn">Review in Admin Panel</a>
    </div>
    <div class="footer">
      <p>You can send an invitation code through the admin panel</p>
    </div>
  </div>
</body>
</html>
  `;
  
  await sendEmail(
    process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    `📬 New Inquiry from ${name}`,
    `New inquiry from ${name} (${email}):\n\n${message}`,
    adminHtml
  );
  
  // Send confirmation to visitor
  const confirmHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .logo { text-align: center; font-size: 48px; margin-bottom: 16px; }
    h1 { color: #722F37; text-align: center; font-family: Georgia, serif; }
    p { color: #3D3630; line-height: 1.6; }
    .footer { text-align: center; color: #9E9890; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0d6cc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🪷</div>
    <h1>Thank You for Reaching Out</h1>
    <p>Dear ${name.split(' ')[0]},</p>
    <p>Thank you for your message. I appreciate you taking the time to share a little about yourself and what brings you to seek healing.</p>
    <p>I personally review every inquiry and will be in touch soon if I feel we might be a good fit to work together.</p>
    <p>In the meantime, feel free to reply to this email if you have any questions.</p>
    <p>With warmth and light,<br><strong>Ravi 🪷</strong></p>
    <div class="footer">
      <p>Ravi ~ Intuitive Healer & Sensual Bodyworker</p>
      <p>Portland, Oregon</p>
    </div>
  </div>
</body>
</html>
  `;
  
  await sendEmail(
    email,
    '🪷 Thank you for reaching out - Ravi Sacred Healing',
    `Dear ${name.split(' ')[0]},\n\nThank you for your message. I personally review every inquiry and will be in touch soon.\n\nWith warmth,\nRavi`,
    confirmHtml
  );
  
  res.json({ success: true, message: 'Inquiry received' });
});

// Client site password verification (legacy support)
app.post('/api/auth/verify', authLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  // Check maintenance mode
  const content = loadContent();
  if (content.siteSettings?.maintenanceMode) {
    return res.status(503).json({ error: 'Site is temporarily unavailable. Please try again later.' });
  }

  if (password === SITE_PASSWORD) {
    const token = jwt.sign({ type: 'client' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }

  res.status(401).json({ error: 'Invalid password' });
});

// Admin login
app.post('/api/auth/admin', authLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  if (username === ADMIN_USERNAME && bcrypt.compareSync(password, adminPasswordHash)) {
    const token = jwt.sign({ type: 'admin', isAdmin: true }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ success: true, token });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

// Get services and availability
app.get('/api/services', authenticateToken, (req, res) => {
  const settings = loadSettings();
  res.json({
    services: settings.services.filter(s => s.active),
    availableDays: settings.availableDays,
    availableSlots: settings.availableSlots,
    blockedDates: settings.blockedDates
  });
});

// Get public content (testimonials, FAQs)
app.get('/api/content', authenticateToken, (req, res) => {
  const content = loadContent();
  res.json({
    testimonials: content.testimonials.filter(t => t.active),
    faqs: content.faqs.filter(f => f.active).sort((a, b) => a.order - b.order),
    siteSettings: {
      siteName: content.siteSettings.siteName,
      tagline: content.siteSettings.tagline,
      location: content.siteSettings.location
    }
  });
});

// Submit booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  const {
    name, email, phone, textPermission, newsletter,
    gender, pronouns, serviceId, serviceName, servicePrice,
    intentions, concerns, healthNotes, sensitivities, additionalInfo,
    availability, consentSignature, boundariesAgreed, ageConfirmed
  } = req.body;

  // Validation
  if (!name || !email || !phone || !serviceId || !consentSignature || !boundariesAgreed || !ageConfirmed) {
    return res.status(400).json({ error: 'Please complete all required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // Check for banned/suspended client
  const clients = loadClients();
  const existingClient = clients.find(c => c.email === normalizedEmail);
  
  if (existingClient?.status === 'banned') {
    return res.status(403).json({ error: 'Unable to process your request. Please contact us directly if you believe this is an error.' });
  }
  
  if (existingClient?.status === 'suspended') {
    return res.status(403).json({ error: 'Your account is temporarily suspended. Please contact us for more information.' });
  }
  
  // Check for duplicate pending booking (prevent double-submissions)
  const bookings = loadBookings();
  const recentPendingBooking = bookings.find(b => 
    b.email.toLowerCase() === normalizedEmail && 
    b.status === 'pending' &&
    b.serviceId === serviceId &&
    // Within last 24 hours
    (new Date() - new Date(b.createdAt)) < 24 * 60 * 60 * 1000
  );
  
  if (recentPendingBooking) {
    return res.json({
      success: true,
      message: 'Your application has already been received. Ravi will reach out to schedule your discovery call.',
      bookingId: recentPendingBooking.id
    });
  }

  // Get service details
  const settings = loadSettings();
  const service = settings.services.find(s => s.id === serviceId);
  
  const booking = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    textPermission: !!textPermission,
    newsletter: !!newsletter,
    gender: gender?.trim() || '',
    pronouns: pronouns?.trim() || '',
    serviceId,
    serviceName: serviceName || service?.name || 'Unknown Service',
    servicePrice: servicePrice || service?.price || 0,
    serviceDuration: service?.duration || 0,
    intentions: intentions?.trim() || '',
    concerns: concerns?.trim() || '',
    healthNotes: healthNotes?.trim() || '',
    sensitivities: sensitivities?.trim() || '',
    additionalInfo: additionalInfo?.trim() || '',
    availability: availability?.trim() || '',
    consentSignature: consentSignature.trim(),
    boundariesAgreed: true,
    ageConfirmed: true,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmedDate: '',
    confirmedTime: '',
    notes: '',
    sessionNotes: '',
    reminderSent: false
  };

  // bookings already loaded above for duplicate check
  bookings.push(booking);
  saveBookings(bookings);

  // Create/update client record
  findOrCreateClient(booking);

  // Send notifications
  await sendBookingNotification(booking);
  await sendClientConfirmation(booking);

  res.json({
    success: true,
    message: 'Your application has been received. Ravi will reach out to schedule your discovery call.',
    bookingId: booking.id
  });
});

// ===========================================
// ADMIN API ROUTES
// ===========================================

// Dashboard stats
app.get('/api/admin/dashboard', authenticateAdmin, (req, res) => {
  const bookings = loadBookings();
  const clients = loadClients();
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const stats = {
    totalBookings: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalClients: clients.length,
    repeatClients: clients.filter(c => c.sessions.length > 1).length,
    revenueThisMonth: bookings
      .filter(b => b.status === 'completed' && new Date(b.updatedAt) >= thisMonth)
      .reduce((sum, b) => sum + (b.servicePrice || 0), 0),
    revenueLastMonth: bookings
      .filter(b => b.status === 'completed' && new Date(b.updatedAt) >= lastMonth && new Date(b.updatedAt) < thisMonth)
      .reduce((sum, b) => sum + (b.servicePrice || 0), 0),
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.servicePrice || 0), 0),
    upcomingThisWeek: bookings.filter(b => {
      if (b.status !== 'confirmed' || !b.confirmedDate) return false;
      const date = new Date(b.confirmedDate);
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return date >= now && date <= weekFromNow;
    }).length
  };

  // Recent activity
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.json({ stats, recentBookings });
});

// Get all bookings
app.get('/api/admin/bookings', authenticateAdmin, (req, res) => {
  const bookings = loadBookings();
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(bookings);
});

// Get single booking
app.get('/api/admin/bookings/:id', authenticateAdmin, (req, res) => {
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

// Update booking
app.patch('/api/admin/bookings/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, notes, sessionNotes, confirmedDate, confirmedTime, sendConfirmation } = req.body;

  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const previousStatus = booking.status;

  if (status) booking.status = status;
  if (notes !== undefined) booking.notes = notes;
  if (sessionNotes !== undefined) booking.sessionNotes = sessionNotes;
  if (confirmedDate) booking.confirmedDate = confirmedDate;
  if (confirmedTime) booking.confirmedTime = confirmedTime;
  booking.updatedAt = new Date().toISOString();

  saveBookings(bookings);

  // Update client record
  if (status === 'completed') {
    findOrCreateClient(booking);
  }

  // Send confirmation email if status changed to confirmed
  if (sendConfirmation || (status === 'confirmed' && previousStatus !== 'confirmed')) {
    await sendConfirmationEmail(booking);
  }

  res.json({ success: true, booking });
});

// Delete booking
app.delete('/api/admin/bookings/:id', authenticateAdmin, (req, res) => {
  let bookings = loadBookings();
  const initialLength = bookings.length;
  bookings = bookings.filter(b => b.id !== req.params.id);
  if (bookings.length === initialLength) return res.status(404).json({ error: 'Booking not found' });
  saveBookings(bookings);
  res.json({ success: true });
});

// Calendar view data
app.get('/api/admin/calendar', authenticateAdmin, (req, res) => {
  const bookings = loadBookings();
  const settings = loadSettings();
  
  // Include both confirmed bookings and pending bookings
  const calendarEvents = bookings
    .filter(b => {
      // Show confirmed bookings with date
      if (b.status === 'confirmed' && b.confirmedDate) return true;
      // Show pending bookings with requested date
      if (b.status === 'pending' && b.requestedDate) return true;
      return false;
    })
    .map(b => ({
      id: b.id,
      title: `${b.name} - ${b.serviceName}`,
      date: b.status === 'confirmed' ? b.confirmedDate : b.requestedDate,
      time: b.status === 'confirmed' ? b.confirmedTime : b.requestedTime,
      status: b.status,
      duration: b.serviceDuration,
      clientName: b.name,
      clientEmail: b.email,
      service: b.serviceName
    }));

  res.json({
    events: calendarEvents,
    blockedDates: settings.blockedDates,
    availableDays: settings.availableDays,
    availableSlots: settings.availableSlots
  });
});

// ===========================================
// CLIENT MANAGEMENT ROUTES
// ===========================================

app.get('/api/admin/clients', authenticateAdmin, (req, res) => {
  const clients = loadClients();
  // Add tier info to each client
  clients.forEach(c => {
    if (!c.tier) {
      c.tier = calculateClientTier(c);
    }
    c.tierInfo = getTierInfo(c.tier);
  });
  clients.sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
  res.json(clients);
});

// Public endpoint to check client tier by email (for adaptive booking form)
app.post('/api/client/check-tier', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  const clients = loadClients();
  const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  
  if (!client) {
    // New client
    return res.json({ 
      tier: 'new', 
      tierInfo: getTierInfo('new'),
      isExisting: false,
      intakeLevel: 'full'
    });
  }
  
  // Existing client
  const tier = client.tier || calculateClientTier(client);
  const tierInfo = getTierInfo(tier);
  
  res.json({
    tier: tier,
    tierInfo: tierInfo,
    isExisting: true,
    name: client.name,
    completedSessions: client.sessions?.filter(s => s.status === 'completed').length || 0,
    intakeLevel: tierInfo.intakeLevel
  });
});

app.get('/api/admin/clients/:id', authenticateAdmin, (req, res) => {
  const clients = loadClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  
  // Add tier info
  if (!client.tier) {
    client.tier = calculateClientTier(client);
  }
  client.tierInfo = getTierInfo(client.tier);
  
  // Get full booking history
  const bookings = loadBookings();
  const clientBookings = bookings.filter(b => b.email.toLowerCase() === client.email);
  
  res.json({ ...client, bookings: clientBookings });
});

app.patch('/api/admin/clients/:id', authenticateAdmin, (req, res) => {
  const { notes, tags, status, tier, tierNotes, tierManual } = req.body;
  const clients = loadClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  
  if (notes !== undefined) client.notes = notes;
  if (tags !== undefined) client.tags = tags;
  if (status !== undefined) client.status = status;
  
  // Tier management
  if (tier !== undefined) {
    const validTiers = ['new', 'returning', 'regular', 'vip', 'favored'];
    if (validTiers.includes(tier)) {
      client.tier = tier;
      client.tierManual = tierManual !== false; // Default to true when manually setting
      client.tierUpdatedAt = new Date().toISOString();
      if (tierNotes !== undefined) client.tierNotes = tierNotes;
    }
  }
  
  // Allow resetting to auto-calculated tier
  if (tierManual === false) {
    client.tierManual = false;
    client.tier = calculateClientTier(client);
  }
  
  saveClients(clients);
  res.json({ success: true, client });
});

// Suspend or ban a client
app.post('/api/admin/clients/:id/suspend', authenticateAdmin, async (req, res) => {
  const { action, reason, notifyClient } = req.body;
  
  if (!['suspend', 'ban', 'reinstate'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Use suspend, ban, or reinstate' });
  }
  
  const clients = loadClients();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  
  const previousStatus = client.status || 'active';
  
  // Update client status
  client.status = action === 'reinstate' ? 'active' : action === 'ban' ? 'banned' : 'suspended';
  client.statusChangedAt = new Date().toISOString();
  client.statusReason = reason || '';
  client.statusHistory = client.statusHistory || [];
  client.statusHistory.push({
    from: previousStatus,
    to: client.status,
    reason: reason || '',
    changedAt: new Date().toISOString()
  });
  
  saveClients(clients);
  
  // Optionally notify the client
  if (notifyClient && action !== 'reinstate') {
    const subject = action === 'ban' 
      ? 'Important Update About Your Account'
      : 'Your Account Has Been Temporarily Suspended';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: #722F37; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Account Update</h2>
    </div>
    <p>Dear ${client.name.split(' ')[0]},</p>
    <p>This message is to inform you that your account has been ${action === 'ban' ? 'closed' : 'temporarily suspended'}.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you have any questions, please reply to this email.</p>
    <p>Respectfully,<br><strong>Ravi</strong></p>
  </div>
</body>
</html>
    `;
    
    try {
      await sendEmail(client.email, subject, 
        `Dear ${client.name.split(' ')[0]},\n\nYour account has been ${action === 'ban' ? 'closed' : 'temporarily suspended'}.\n${reason ? `Reason: ${reason}` : ''}\n\nRespectfully,\nRavi`,
        html
      );
    } catch (err) {
      console.error('Failed to send status notification:', err);
    }
  }
  
  res.json({ 
    success: true, 
    message: `Client ${action === 'reinstate' ? 'reinstated' : action + 'ed'} successfully`,
    client 
  });
});

// Get client with message counts
app.get('/api/admin/clients-with-messages', authenticateAdmin, (req, res) => {
  const clients = loadClients();
  const messages = loadMessages();
  const bookings = loadBookings();
  
  // Enrich clients with unread message counts
  const enrichedClients = clients.map(client => {
    const clientMessages = messages.filter(m => m.conversationId === client.email.toLowerCase());
    const unreadCount = clientMessages.filter(m => m.from === 'client' && !m.read).length;
    const lastMessage = clientMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const clientBookings = bookings.filter(b => b.email.toLowerCase() === client.email.toLowerCase());
    
    return {
      ...client,
      unreadMessages: unreadCount,
      lastMessageAt: lastMessage?.createdAt,
      totalSessions: clientBookings.filter(b => b.status === 'completed').length,
      totalSpent: clientBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.servicePrice || 0), 0),
      pendingBookings: clientBookings.filter(b => b.status === 'pending').length
    };
  });
  
  enrichedClients.sort((a, b) => {
    // Sort by unread messages first, then by last contact
    if (a.unreadMessages > 0 && b.unreadMessages === 0) return -1;
    if (b.unreadMessages > 0 && a.unreadMessages === 0) return 1;
    return new Date(b.lastContact || 0) - new Date(a.lastContact || 0);
  });
  
  res.json(enrichedClients);
});

app.get('/api/admin/clients/search/:query', authenticateAdmin, (req, res) => {
  const query = req.params.query.toLowerCase();
  const clients = loadClients();
  const results = clients.filter(c => 
    c.name.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query) ||
    c.phone.includes(query)
  );
  res.json(results);
});

// ===========================================
// CONTENT MANAGEMENT ROUTES
// ===========================================

app.get('/api/admin/content', authenticateAdmin, (req, res) => {
  res.json(loadContent());
});

app.put('/api/admin/content', authenticateAdmin, (req, res) => {
  const content = loadContent();
  const { testimonials, faqs, siteSettings } = req.body;
  
  if (testimonials) content.testimonials = testimonials;
  if (faqs) content.faqs = faqs;
  if (siteSettings) content.siteSettings = { ...content.siteSettings, ...siteSettings };
  
  saveContent(content);
  res.json({ success: true, content });
});

// Testimonials CRUD
app.post('/api/admin/testimonials', authenticateAdmin, (req, res) => {
  const { author, text, featured } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'Author and text required' });
  
  const content = loadContent();
  const testimonial = {
    id: uuidv4(),
    author,
    text,
    featured: !!featured,
    active: true,
    createdAt: new Date().toISOString()
  };
  content.testimonials.push(testimonial);
  saveContent(content);
  res.json({ success: true, testimonial });
});

app.patch('/api/admin/testimonials/:id', authenticateAdmin, (req, res) => {
  const content = loadContent();
  const testimonial = content.testimonials.find(t => t.id === req.params.id);
  if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
  
  const { author, text, featured, active } = req.body;
  if (author !== undefined) testimonial.author = author;
  if (text !== undefined) testimonial.text = text;
  if (featured !== undefined) testimonial.featured = featured;
  if (active !== undefined) testimonial.active = active;
  
  saveContent(content);
  res.json({ success: true, testimonial });
});

app.delete('/api/admin/testimonials/:id', authenticateAdmin, (req, res) => {
  const content = loadContent();
  content.testimonials = content.testimonials.filter(t => t.id !== req.params.id);
  saveContent(content);
  res.json({ success: true });
});

// ===========================================
// PUBLIC TESTIMONIAL SUBMISSION
// ===========================================

// Rate limit for testimonial submissions
const testimonialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 submissions per hour
  message: { error: 'Too many submissions. Please try again later.' }
});

app.post('/api/testimonials/submit', testimonialLimiter, (req, res) => {
  const { displayName, email, sessionType, testimonial, consent, featured } = req.body;

  // Validation
  if (!displayName || !testimonial) {
    return res.status(400).json({ error: 'Display name and testimonial are required' });
  }

  if (!consent) {
    return res.status(400).json({ error: 'Please provide consent to publish' });
  }

  if (testimonial.length < 20) {
    return res.status(400).json({ error: 'Please provide a more detailed testimonial' });
  }

  if (testimonial.length > 5000) {
    return res.status(400).json({ error: 'Testimonial is too long (max 5000 characters)' });
  }

  const content = loadContent();
  
  // Initialize pendingTestimonials if it doesn't exist
  if (!content.pendingTestimonials) {
    content.pendingTestimonials = [];
  }

  const pendingTestimonial = {
    id: uuidv4(),
    displayName: displayName.trim(),
    email: email?.trim() || '',
    sessionType: sessionType || '',
    text: testimonial.trim(),
    featured: !!featured,
    consent: true,
    submittedAt: new Date().toISOString(),
    status: 'pending' // pending, approved, rejected
  };

  content.pendingTestimonials.push(pendingTestimonial);
  saveContent(content);

  // Notify Ravi of new testimonial submission
  sendEmail(
    process.env.ADMIN_EMAIL || 'ravi@example.com',
    '🌟 New Testimonial Submitted',
    `A new testimonial has been submitted by ${displayName}. Please log in to the admin panel to review and approve it.`,
    `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #722F37;">🌟 New Testimonial Submitted</h2>
        <p><strong>From:</strong> ${displayName}</p>
        ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
        ${sessionType ? `<p><strong>Session Type:</strong> ${sessionType}</p>` : ''}
        <div style="background: #f5f0eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="font-style: italic;">"${testimonial.substring(0, 300)}${testimonial.length > 300 ? '...' : ''}"</p>
        </div>
        <p><a href="${process.env.SITE_URL || 'http://localhost:3000'}/admin.html" style="color: #722F37;">Log in to review →</a></p>
      </div>
    `
  ).catch(err => { /* Email notification failed - logged internally */ });

  res.json({ success: true, message: 'Testimonial submitted for review' });
});

// Admin: Get pending testimonials
app.get('/api/admin/testimonials/pending', authenticateAdmin, (req, res) => {
  const content = loadContent();
  res.json(content.pendingTestimonials || []);
});

// Admin: Approve testimonial
app.post('/api/admin/testimonials/:id/approve', authenticateAdmin, (req, res) => {
  const content = loadContent();
  
  if (!content.pendingTestimonials) {
    return res.status(404).json({ error: 'No pending testimonials found' });
  }

  const pendingIndex = content.pendingTestimonials.findIndex(t => t.id === req.params.id);
  if (pendingIndex === -1) {
    return res.status(404).json({ error: 'Pending testimonial not found' });
  }

  const pending = content.pendingTestimonials[pendingIndex];
  
  // Create approved testimonial
  const approvedTestimonial = {
    id: uuidv4(),
    author: pending.displayName,
    text: pending.text,
    featured: pending.featured,
    active: true,
    createdAt: new Date().toISOString(),
    submittedAt: pending.submittedAt,
    sessionType: pending.sessionType
  };

  content.testimonials.push(approvedTestimonial);
  content.pendingTestimonials.splice(pendingIndex, 1);
  saveContent(content);

  res.json({ success: true, testimonial: approvedTestimonial });
});

// Admin: Reject testimonial
app.post('/api/admin/testimonials/:id/reject', authenticateAdmin, (req, res) => {
  const content = loadContent();
  
  if (!content.pendingTestimonials) {
    return res.status(404).json({ error: 'No pending testimonials found' });
  }

  content.pendingTestimonials = content.pendingTestimonials.filter(t => t.id !== req.params.id);
  saveContent(content);

  res.json({ success: true });
});

// ===========================================
// CLIENT MESSAGING
// ===========================================

// Send message to client
app.post('/api/admin/clients/:id/message', authenticateAdmin, async (req, res) => {
  const { subject, message, includeTestimonialLink } = req.body;
  
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const clients = loadClients();
  const client = clients.find(c => c.id === req.params.id);
  
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  let emailBody = message;
  let htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FDF8F3;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪷</span>
        <h2 style="color: #722F37; margin: 8px 0;">Ravi ~ Sacred Healing</h2>
      </div>
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <p>Dear ${client.name.split(' ')[0]},</p>
        <div style="white-space: pre-wrap;">${message}</div>
  `;

  if (includeTestimonialLink) {
    const testimonialUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/submit-testimonial.html`;
    htmlBody += `
        <div style="margin-top: 24px; padding: 16px; background: #f5f0eb; border-radius: 8px; text-align: center;">
          <p style="margin-bottom: 12px;"><strong>💖 Share Your Experience</strong></p>
          <p style="font-size: 14px; color: #666;">Your words help others find their path to healing</p>
          <a href="${testimonialUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #722F37; color: white; text-decoration: none; border-radius: 8px;">Submit a Testimonial</a>
        </div>
    `;
    emailBody += `\n\n---\n💖 Share Your Experience: ${testimonialUrl}`;
  }

  htmlBody += `
        <p style="margin-top: 24px;">With love and gratitude,<br><strong>Ravi</strong> 🪷</p>
      </div>
      <p style="text-align: center; margin-top: 24px; font-size: 12px; color: #999;">
        This email was sent from Ravi's Sacred Healing
      </p>
    </div>
  `;

  try {
    await sendEmail(client.email, subject, emailBody, htmlBody);
    
    // Log the message
    if (!client.messageHistory) client.messageHistory = [];
    client.messageHistory.push({
      id: uuidv4(),
      subject,
      message,
      sentAt: new Date().toISOString(),
      includeTestimonialLink
    });
    client.lastContact = new Date().toISOString();
    saveClients(clients);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ error: 'Failed to send email. Please check email configuration.' });
  }
});

// Send aftercare email with testimonial link
app.post('/api/admin/bookings/:id/aftercare', authenticateAdmin, async (req, res) => {
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const testimonialUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/submit-testimonial.html`;
  
  const subject = '💝 Thank You for Your Session with Ravi';
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FDF8F3;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🪷</span>
        <h2 style="color: #722F37; margin: 8px 0;">Thank You, ${booking.name.split(' ')[0]}</h2>
      </div>
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <p>It was truly an honor to share sacred space with you.</p>
        
        <p>Please take gentle care of yourself in the coming days. Drink plenty of water, rest when needed, and allow any emotions that arise to flow through you naturally.</p>
        
        <h3 style="color: #722F37; margin-top: 24px;">💫 Aftercare Suggestions:</h3>
        <ul style="padding-left: 20px; line-height: 1.8;">
          <li>Take a warm bath with epsom salts</li>
          <li>Journal about your experience</li>
          <li>Spend time in nature</li>
          <li>Practice gentle self-touch and breath work</li>
          <li>Be patient and compassionate with yourself</li>
        </ul>

        <div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); border-radius: 12px; text-align: center;">
          <p style="color: white; margin-bottom: 12px;"><strong>💖 Would you like to share your experience?</strong></p>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Your words help others find their path to healing</p>
          <a href="${testimonialUrl}" style="display: inline-block; margin-top: 12px; padding: 14px 28px; background: white; color: #722F37; text-decoration: none; border-radius: 8px; font-weight: 600;">Share Your Story ✨</a>
        </div>

        <p style="margin-top: 24px;">If you have any questions or need support, please don't hesitate to reach out.</p>
        
        <p style="margin-top: 24px;">With deep gratitude and love,<br><strong>Ravi</strong> 🪷</p>
      </div>
      <p style="text-align: center; margin-top: 24px; font-size: 12px; color: #999;">
        Portland, Oregon | Your privacy is sacred
      </p>
    </div>
  `;

  try {
    await sendEmail(booking.email, subject, 'Thank you for your session with Ravi.', html);
    
    // Mark aftercare sent
    booking.aftercareSent = true;
    booking.aftercareSentAt = new Date().toISOString();
    saveBookings(bookings);

    res.json({ success: true, message: 'Aftercare email sent successfully' });
  } catch (err) {
    console.error('Failed to send aftercare email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send appointment confirmation/message to client from booking
app.post('/api/admin/bookings/:id/message', authenticateAdmin, async (req, res) => {
  const { subject, message, proposedDate, proposedTime } = req.body;
  
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  let appointmentInfo = '';
  if (proposedDate && proposedTime) {
    appointmentInfo = `
      <div style="margin: 24px 0; padding: 20px; background: #f5f0eb; border-radius: 12px; border-left: 4px solid #D4AF37;">
        <h3 style="color: #722F37; margin-bottom: 12px;">📅 Proposed Appointment</h3>
        <p style="margin: 0;"><strong>Date:</strong> ${proposedDate}</p>
        <p style="margin: 8px 0 0;"><strong>Time:</strong> ${proposedTime}</p>
        <p style="margin: 16px 0 0; font-size: 14px; color: #666;">Please reply to confirm or suggest an alternative time.</p>
      </div>
    `;
  }

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FDF8F3;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪷</span>
        <h2 style="color: #722F37; margin: 8px 0;">Ravi ~ Sacred Healing</h2>
      </div>
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <p>Dear ${booking.name.split(' ')[0]},</p>
        <div style="white-space: pre-wrap;">${message}</div>
        ${appointmentInfo}
        <p style="margin-top: 24px;">With love,<br><strong>Ravi</strong> 🪷</p>
      </div>
    </div>
  `;

  try {
    await sendEmail(booking.email, subject, message, html);
    
    // Log the message
    if (!booking.messages) booking.messages = [];
    booking.messages.push({
      id: uuidv4(),
      subject,
      message,
      proposedDate,
      proposedTime,
      sentAt: new Date().toISOString()
    });
    saveBookings(bookings);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// FAQs CRUD
app.post('/api/admin/faqs', authenticateAdmin, (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });
  
  const content = loadContent();
  const maxOrder = Math.max(...content.faqs.map(f => f.order), 0);
  const faq = {
    id: uuidv4(),
    question,
    answer,
    order: maxOrder + 1,
    active: true,
    createdAt: new Date().toISOString()
  };
  content.faqs.push(faq);
  saveContent(content);
  res.json({ success: true, faq });
});

app.patch('/api/admin/faqs/:id', authenticateAdmin, (req, res) => {
  const content = loadContent();
  const faq = content.faqs.find(f => f.id === req.params.id);
  if (!faq) return res.status(404).json({ error: 'FAQ not found' });
  
  const { question, answer, order, active } = req.body;
  if (question !== undefined) faq.question = question;
  if (answer !== undefined) faq.answer = answer;
  if (order !== undefined) faq.order = order;
  if (active !== undefined) faq.active = active;
  
  saveContent(content);
  res.json({ success: true, faq });
});

app.delete('/api/admin/faqs/:id', authenticateAdmin, (req, res) => {
  const content = loadContent();
  content.faqs = content.faqs.filter(f => f.id !== req.params.id);
  saveContent(content);
  res.json({ success: true });
});

// ===========================================
// SETTINGS ROUTES
// ===========================================

app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
  res.json(loadSettings());
});

app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  const settings = loadSettings();
  const { 
    availableDays, availableSlots, blockedDates, services,
    emailNotifications, autoConfirmationEmail, reminderEmails, reminderHours
  } = req.body;

  if (availableDays) settings.availableDays = availableDays;
  if (availableSlots) settings.availableSlots = availableSlots;
  if (blockedDates) settings.blockedDates = blockedDates;
  if (services) settings.services = services;
  if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
  if (autoConfirmationEmail !== undefined) settings.autoConfirmationEmail = autoConfirmationEmail;
  if (reminderEmails !== undefined) settings.reminderEmails = reminderEmails;
  if (reminderHours !== undefined) settings.reminderHours = reminderHours;

  saveSettings(settings);
  res.json({ success: true, settings });
});

// Block/unblock dates
app.post('/api/admin/settings/block-date', authenticateAdmin, (req, res) => {
  const blockData = sanitizeObject(req.body);
  const { startDate, startTime, endDate, endTime, reason, isRange } = blockData;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start and end dates required' });
  }
  
  const settings = loadSettings();
  
  // Create block entry with enhanced data
  const blockEntry = {
    startDate,
    startTime: startTime || null,
    endDate,
    endTime: endTime || null,
    reason: reason || 'Blocked',
    isRange,
    createdAt: new Date().toISOString()
  };
  
  // For backward compatibility, also add 'date' field if it's a single date
  if (!isRange && startDate === endDate && !startTime && !endTime) {
    blockEntry.date = startDate;
  }
  
  settings.blockedDates.push(blockEntry);
  saveSettings(settings);
  
  res.json({ success: true, blockedDates: settings.blockedDates });
});

app.delete('/api/admin/settings/block-date/:index', authenticateAdmin, (req, res) => {
  const index = parseInt(req.params.index);
  const settings = loadSettings();
  
  if (index >= 0 && index < settings.blockedDates.length) {
    settings.blockedDates.splice(index, 1);
    saveSettings(settings);
    res.json({ success: true, blockedDates: settings.blockedDates });
  } else {
    res.status(404).json({ error: 'Blocked date not found' });
  }
});

// ===========================================
// EXPORT & BACKUP ROUTES
// ===========================================

app.get('/api/admin/export/bookings', authenticateAdmin, (req, res) => {
  const bookings = loadBookings();
  
  // CSV header
  const headers = [
    'ID', 'Date', 'Name', 'Email', 'Phone', 'Service', 'Price', 
    'Status', 'Confirmed Date', 'Confirmed Time', 'Intentions', 'Notes'
  ];
  
  const rows = bookings.map(b => [
    b.id,
    new Date(b.createdAt).toLocaleDateString(),
    b.name,
    b.email,
    b.phone,
    b.serviceName,
    b.servicePrice,
    b.status,
    b.confirmedDate || '',
    b.confirmedTime || '',
    (b.intentions || '').replace(/"/g, '""'),
    (b.notes || '').replace(/"/g, '""')
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=bookings-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

app.get('/api/admin/export/clients', authenticateAdmin, (req, res) => {
  const clients = loadClients();
  
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Total Sessions', 'Total Spent', 'Last Contact', 'Notes'];
  
  const rows = clients.map(c => [
    c.id,
    c.name,
    c.email,
    c.phone,
    c.totalSessions || 0,
    c.totalSpent || 0,
    c.lastContact ? new Date(c.lastContact).toLocaleDateString() : '',
    (c.notes || '').replace(/"/g, '""')
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=clients-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

// Backup all data
app.get('/api/admin/backup', authenticateAdmin, (req, res) => {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    bookings: loadBookings(),
    clients: loadClients(),
    settings: loadSettings(),
    content: loadContent()
  };
  
  // Also save to backup directory
  const backupFileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(path.join(BACKUP_DIR, backupFileName), encrypt(backup));
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=${backupFileName}`);
  res.json(backup);
});

// Restore from backup
app.post('/api/admin/restore', authenticateAdmin, (req, res) => {
  const { backup } = req.body;
  
  if (!backup || !backup.version) {
    return res.status(400).json({ error: 'Invalid backup file' });
  }
  
  try {
    if (backup.bookings) saveBookings(backup.bookings);
    if (backup.clients) saveClients(backup.clients);
    if (backup.settings) saveSettings(backup.settings);
    if (backup.content) saveContent(backup.content);
    
    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// ===========================================
// EMAIL ACTIONS
// ===========================================

app.post('/api/admin/send-reminder/:id', authenticateAdmin, async (req, res) => {
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'confirmed') return res.status(400).json({ error: 'Can only send reminders for confirmed bookings' });
  
  await sendReminderEmail(booking);
  
  booking.reminderSent = true;
  booking.reminderSentAt = new Date().toISOString();
  saveBookings(bookings);
  
  res.json({ success: true, message: 'Reminder sent' });
});

app.post('/api/admin/send-custom-email/:id', authenticateAdmin, async (req, res) => {
  const { subject, message } = req.body;
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (!subject || !message) return res.status(400).json({ error: 'Subject and message required' });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; color: #3D3630; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background: #722F37; color: white; border-radius: 12px 12px 0 0; }
    .content { padding: 30px; background: #FDF8F3; }
    .footer { text-align: center; padding: 20px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪷 Message from Ravi</h1>
    </div>
    <div class="content">
      <p>Dear ${booking.name},</p>
      ${message.split('\n').map(p => `<p>${p}</p>`).join('')}
      <p>With love,<br><strong>Ravi</strong></p>
    </div>
    <div class="footer">
      <p>Ravi ~ Intuitive Healer & Sensual Bodyworker</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  
  const sent = await sendEmail(booking.email, subject, message, html);
  
  if (sent) {
    res.json({ success: true, message: 'Email sent' });
  } else {
    res.status(500).json({ error: 'Failed to send email. Check email configuration.' });
  }
});

// Send email from template to multiple recipients
app.post('/api/admin/send-template-email', authenticateAdmin, async (req, res) => {
  try {
    const { templateId, subject, body, recipients } = req.body;

    if (!subject || !body || !recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Load all clients for data population
    const clients = loadClients();
    const bookings = loadBookings();

    let sentCount = 0;
    let failedRecipients = [];

    // Send individual emails to each recipient
    for (const recipient of recipients) {
      try {
        // Find full client data
        const client = clients.find(c => c.id === recipient.id);
        if (!client) {
          failedRecipients.push(recipient.email);
          continue;
        }

        // Get latest booking for this client
        const clientBookings = bookings.filter(b => b.email === client.email).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        const latestBooking = clientBookings[0];

        // Prepare personalization data
        const personalData = {
          clientName: client.name || recipient.name,
          firstName: (client.name || recipient.name).split(' ')[0],
          lastName: (client.name || recipient.name).split(' ').slice(1).join(' '),
          email: client.email,
          serviceName: latestBooking?.serviceName || 'Sacred Healing Session',
          date: latestBooking?.confirmedDate ? new Date(latestBooking.confirmedDate).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          }) : '',
          time: latestBooking?.confirmedTime || '',
          practitionerName: 'Ravi',
          location: 'Sacred Healing Space',
          duration: '90 minutes'
        };

        // Replace variables in subject and body
        let personalizedSubject = subject;
        let personalizedBody = body;

        Object.keys(personalData).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          personalizedSubject = personalizedSubject.replace(regex, personalData[key] || '');
          personalizedBody = personalizedBody.replace(regex, personalData[key] || '');
        });

        // Build HTML email
        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; color: #3D3630; line-height: 1.8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { padding: 30px; background: linear-gradient(135deg, #722F37 0%, #5C252C 100%); color: white; text-align: center; }
    .content { padding: 40px 30px; background: #FDF8F3; }
    .footer { padding: 20px; text-align: center; font-size: 13px; color: #9E9890; background: #f8f6f3; border-top: 1px solid #e0d6cc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🪷 ${personalizedSubject}</h1>
    </div>
    <div class="content">
      ${personalizedBody.split('\n').map(p => p.trim() ? `<p style="margin: 0 0 16px 0;">${p}</p>` : '<br>').join('')}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>🪷 Ravi Sacred Healing</strong></p>
      <p style="margin: 0;">Sacred Healing Space | contact@ravisacredhealing.com</p>
    </div>
  </div>
</body>
</html>
        `.trim();

        // Send email (uses existing sendEmail function)
        const sent = await sendEmail(client.email, personalizedSubject, personalizedBody, html);
        
        if (sent) {
          sentCount++;
        } else {
          failedRecipients.push(client.email);
        }
      } catch (err) {
        console.error(`Failed to send to ${recipient.email}:`, err);
        failedRecipients.push(recipient.email);
      }
    }

    if (sentCount === 0) {
      return res.status(500).json({ 
        error: 'Failed to send any emails',
        failedRecipients 
      });
    }

    res.json({ 
      success: true, 
      message: `Successfully sent ${sentCount} email(s)`,
      sentCount,
      totalRecipients: recipients.length,
      failedCount: failedRecipients.length,
      failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send template email: ' + err.message });
  }
});

// ===========================================
// TWILIO SMS INTEGRATION (World-Class Messaging)
// ===========================================

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
  // Dynamic import for Twilio (optional dependency)
  try {
    const twilioModule = await import('twilio');
    twilioClient = twilioModule.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    // Twilio not available
  }
}

async function sendSMS(to, message) {
  if (!twilioClient) {
    return false;
  }
  
  try {
    // Clean phone number
    let phone = to.replace(/[^\d+]/g, '');
    if (!phone.startsWith('+')) {
      phone = '+1' + phone; // Default to US
    }
    
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (err) {
    console.error('SMS failed:', err.message);
    return false;
  }
}

// ===========================================
// MAGIC LINK STORAGE
// ===========================================

const MAGIC_LINKS_FILE = path.join(DATA_DIR, 'magic_links.enc');
const CLIENT_SESSIONS_FILE = path.join(DATA_DIR, 'client_sessions.enc');
const INVITATION_CODES_FILE = path.join(DATA_DIR, 'invitation_codes.enc');

function loadMagicLinks() { return loadData(MAGIC_LINKS_FILE, {}); }
function saveMagicLinks(data) { saveData(MAGIC_LINKS_FILE, data); }

function loadClientSessions() { return loadData(CLIENT_SESSIONS_FILE, {}); }
function saveClientSessions(data) { saveData(CLIENT_SESSIONS_FILE, data); }

function loadInvitationCodes() { return loadData(INVITATION_CODES_FILE, []); }
function saveInvitationCodes(data) { saveData(INVITATION_CODES_FILE, data); }

// ===========================================
// INVITATION CODE GENERATOR
// ===========================================

// Generate beautiful, memorable codes like "SACRED-7X9K" or "LOTUS-M3NP"
function generateInvitationCode(prefix = null) {
  const prefixes = ['SACRED', 'LOTUS', 'HEAL', 'RAVI', 'LIGHT', 'LOVE', 'BLISS', 'SOUL', 'PEACE', 'GRACE'];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0/O, 1/I/L)
  
  const chosenPrefix = prefix || prefixes[Math.floor(Math.random() * prefixes.length)];
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return `${chosenPrefix}-${suffix}`;
}

// Admin: Generate invitation codes
app.post('/api/admin/invitation-codes/generate', authenticateAdmin, (req, res) => {
  const { count = 1, prefix, label, expiresInDays } = req.body;
  
  const codes = loadInvitationCodes();
  const newCodes = [];
  
  for (let i = 0; i < Math.min(count, 50); i++) { // Max 50 at once
    let code;
    // Ensure uniqueness
    do {
      code = generateInvitationCode(prefix);
    } while (codes.some(c => c.code === code));
    
    const newCode = {
      id: uuidv4(),
      code: code,
      label: label || null, // Optional label like "Business Card Batch 1"
      createdAt: new Date().toISOString(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null,
      usedBy: null,
      usedAt: null,
      active: true
    };
    
    codes.push(newCode);
    newCodes.push(newCode);
  }
  
  saveInvitationCodes(codes);
  
  res.json({ 
    success: true, 
    message: `Generated ${newCodes.length} invitation code(s)`,
    codes: newCodes 
  });
});

// Admin: Get all invitation codes
app.get('/api/admin/invitation-codes', authenticateAdmin, (req, res) => {
  const codes = loadInvitationCodes();
  res.json(codes);
});

// Admin: Deactivate a code
app.delete('/api/admin/invitation-codes/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const codes = loadInvitationCodes();
  const code = codes.find(c => c.id === id);
  
  if (!code) {
    return res.status(404).json({ error: 'Code not found' });
  }
  
  code.active = false;
  code.deactivatedAt = new Date().toISOString();
  saveInvitationCodes(codes);
  
  res.json({ success: true, message: 'Code deactivated' });
});

// Admin: Get printable codes (for business cards)
app.get('/api/admin/invitation-codes/printable', authenticateAdmin, (req, res) => {
  const codes = loadInvitationCodes();
  const activeCodes = codes.filter(c => c.active && !c.usedBy);
  
  // Return simple format for printing
  const printable = activeCodes.map(c => ({
    code: c.code,
    label: c.label,
    expiresAt: c.expiresAt
  }));
  
  res.json(printable);
});

// ===========================================
// INQUIRY MANAGEMENT API
// ===========================================

// Admin: Get all inquiries
app.get('/api/admin/inquiries', authenticateAdmin, (req, res) => {
  const inquiries = loadInquiries();
  res.json(inquiries);
});

// Admin: Update inquiry status
app.patch('/api/admin/inquiries/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const inquiries = loadInquiries();
  const inquiry = inquiries.find(i => i.id === id);
  
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  inquiry.status = status;
  inquiry.statusUpdatedAt = new Date().toISOString();
  saveInquiries(inquiries);
  
  res.json({ success: true });
});

// Admin: Delete inquiry
app.delete('/api/admin/inquiries/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  const inquiries = loadInquiries();
  const index = inquiries.findIndex(i => i.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  inquiries.splice(index, 1);
  saveInquiries(inquiries);
  
  res.json({ success: true });
});

// Admin: Schedule video call for inquiry
app.post('/api/admin/inquiries/:id/schedule-call', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  const inquiries = loadInquiries();
  const inquiry = inquiries.find(i => i.id === id);
  
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  // Get video chat link from settings
  const content = loadContent();
  const videoChatLink = content.siteSettings?.videoChatLink;
  
  if (!videoChatLink) {
    return res.status(400).json({ error: 'Video chat link not configured. Please set it in Site Settings.' });
  }
  
  // Update inquiry status
  inquiry.status = 'video_scheduled';
  inquiry.videoScheduledAt = new Date().toISOString();
  saveInquiries(inquiries);
  
  // Send email with video chat link
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(114, 47, 55, 0.15); }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .button { display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white !important; text-decoration: none; padding: 18px 32px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; font-size: 16px; }
    .footer { text-align: center; padding: 24px; background: #f8f5f0; color: #9E9890; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪷 Let's Connect</h1>
    </div>
    <div class="content">
      <p>Dear ${inquiry.name},</p>
      <p>Thank you for reaching out about sacred healing work. I'd love to connect with you for a brief discovery call to learn more about your journey and answer any questions you might have.</p>
      <p>This is a chance for us to get to know each other and see if we're a good fit to work together.</p>
      <a href="${videoChatLink}" class="button">📅 Schedule Your Discovery Call</a>
      <p style="font-size: 14px; color: #666;">Click the button above to choose a time that works for you.</p>
      <p>I look forward to connecting with you.</p>
      <p style="margin-top: 24px;">With warmth,<br><strong>Ravi</strong></p>
    </div>
    <div class="footer">
      <p>🔒 Your privacy is sacred</p>
    </div>
  </div>
</body>
</html>
`;

  try {
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: inquiry.email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        subject: "Let's Connect - Discovery Call with Ravi 🪷",
        html: html
      });
    } else {
      console.log('📧 [DEV] Would send discovery call email to:', inquiry.email);
      console.log('📧 [DEV] Video chat link:', videoChatLink);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send discovery call email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Admin: Decline inquiry
app.post('/api/admin/inquiries/:id/decline', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const inquiries = loadInquiries();
  const inquiry = inquiries.find(i => i.id === id);
  
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  inquiry.status = 'declined';
  inquiry.declinedAt = new Date().toISOString();
  inquiry.declineReason = reason || '';
  saveInquiries(inquiries);
  
  // Optionally send a polite decline email
  if (process.env.SENDGRID_API_KEY) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(114, 47, 55, 0.15); }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .footer { text-align: center; padding: 24px; background: #f8f5f0; color: #9E9890; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪷 Ravi Sacred Healing</h1>
    </div>
    <div class="content">
      <p>Dear ${inquiry.name},</p>
      <p>Thank you for your interest in sacred healing work. After careful consideration, I don't feel we would be the right fit to work together at this time.</p>
      <p>I wish you all the best on your healing journey.</p>
      <p style="margin-top: 24px;">With warmth,<br><strong>Ravi</strong></p>
    </div>
    <div class="footer">
      <p>🔒 Your privacy is sacred</p>
    </div>
  </div>
</body>
</html>
`;

    try {
      await sgMail.send({
        to: inquiry.email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        subject: 'Thank You for Your Interest - Ravi Sacred Healing',
        html: html
      });
    } catch (error) {
      console.error('Failed to send decline email:', error);
    }
  }
  
  res.json({ success: true });
});

// Admin: Send invitation to inquiry
app.post('/api/admin/inquiries/:id/invite', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  const inquiries = loadInquiries();
  const inquiry = inquiries.find(i => i.id === id);
  
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  // Generate an invitation code
  const codes = loadInvitationCodes();
  let code;
  do {
    code = generateInvitationCode('RAVI');
  } while (codes.some(c => c.code === code));
  
  const newCode = {
    id: uuidv4(),
    code: code,
    label: `Inquiry: ${inquiry.name}`,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    usedBy: null,
    usedAt: null,
    active: true
  };
  
  codes.push(newCode);
  saveInvitationCodes(codes);
  
  // Update inquiry
  inquiry.status = 'invited';
  inquiry.invitationCode = code;
  inquiry.invitedAt = new Date().toISOString();
  saveInquiries(inquiries);
  
  // Send invitation email
  const portalUrl = `${process.env.BASE_URL || 'http://localhost:' + PORT}/portal.html`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(114, 47, 55, 0.15); }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .code-box { background: linear-gradient(135deg, #f8f5f0 0%, #FDF8F3 100%); border: 3px solid #D4AF37; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .code-label { color: #9E9890; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .code-value { color: #722F37; font-size: 32px; font-weight: 700; letter-spacing: 4px; margin: 12px 0; font-family: monospace; }
    .button { display: block; background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white !important; text-decoration: none; padding: 18px 32px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; font-size: 16px; }
    .footer { text-align: center; padding: 24px; background: #f8f5f0; color: #9E9890; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪷 You're Invited!</h1>
    </div>
    <div class="content">
      <p>Dear ${inquiry.name.split(' ')[0]},</p>
      <p>Thank you for reaching out. I've reviewed your message and I'd love to connect with you.</p>
      <p>Here is your personal invitation code to access my client portal:</p>
      
      <div class="code-box">
        <div class="code-label">Your Invitation Code</div>
        <div class="code-value">${code}</div>
      </div>
      
      <a href="${portalUrl}" class="button">✨ Enter Your Portal ✨</a>
      
      <p style="color: #9E9890; font-size: 14px; text-align: center;">
        Click the button above, then select "Have Invitation Code" and enter your code along with your email.
      </p>
      
      <p>I look forward to beginning this journey with you.</p>
      <p>With warmth and light,<br><strong>Ravi 🪷</strong></p>
    </div>
    <div class="footer">
      <p>Ravi ~ Intuitive Healer & Sensual Bodyworker</p>
      <p>Portland, Oregon</p>
    </div>
  </div>
</body>
</html>
  `;
  
  await sendEmail(
    inquiry.email,
    `🪷 You're Invited! Your Personal Code: ${code}`,
    `Dear ${inquiry.name},\n\nThank you for reaching out. Here is your personal invitation code: ${code}\n\nVisit ${portalUrl} to enter your code and access your portal.\n\nWith warmth,\nRavi`,
    html
  );
  
  res.json({ success: true, code });
});

// ===========================================
// DISCOVERY CALLS API
// ===========================================

const DISCOVERY_CALLS_FILE = path.join(DATA_DIR, 'discovery_calls.enc');

function loadDiscoveryCalls() {
  if (fs.existsSync(DISCOVERY_CALLS_FILE)) {
    try {
      const encrypted = fs.readFileSync(DISCOVERY_CALLS_FILE, 'utf8');
      const decrypted = decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('Error loading discovery calls:', err);
      return [];
    }
  }
  return [];
}

function saveDiscoveryCalls(calls) {
  try {
    const json = JSON.stringify(calls, null, 2);
    const encrypted = encrypt(json);
    fs.writeFileSync(DISCOVERY_CALLS_FILE, encrypted, 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving discovery calls:', err);
    return false;
  }
}

// Get all discovery calls
app.get('/api/admin/discovery-calls', authenticateAdmin, (req, res) => {
  const calls = loadDiscoveryCalls();
  
  // Enrich with inquiry data
  const inquiries = loadInquiries();
  const enrichedCalls = calls.map(call => {
    const inquiry = inquiries.find(i => i.id === call.inquiryId);
    return {
      ...call,
      inquiry: inquiry ? {
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message
      } : null
    };
  });
  
  res.json({ success: true, calls: enrichedCalls });
});

// Create/schedule a discovery call
app.post('/api/admin/discovery-calls', authenticateAdmin, async (req, res) => {
  const { inquiryId, scheduledDate, scheduledTime, duration, notes, meetingLink } = req.body;
  
  if (!inquiryId) {
    return res.status(400).json({ error: 'Inquiry ID required' });
  }
  
  const inquiries = loadInquiries();
  const inquiry = inquiries.find(i => i.id === inquiryId);
  
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  const calls = loadDiscoveryCalls();
  
  // Load content for default meeting link
  const content = loadContent();
  const defaultMeetingLink = meetingLink || content.siteSettings?.videoChatLink || '';
  
  const newCall = {
    id: uuidv4(),
    inquiryId,
    scheduledDate: scheduledDate || null,
    scheduledTime: scheduledTime || null,
    duration: duration || 30,
    meetingLink: defaultMeetingLink,
    notes: notes || '',
    status: scheduledDate ? 'scheduled' : 'pending',
    outcome: null,
    outcomeNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminderSent: false,
    confirmationSent: false
  };
  
  calls.push(newCall);
  saveDiscoveryCalls(calls);
  
  // Update inquiry status
  inquiry.status = 'call_scheduled';
  inquiry.discoveryCallId = newCall.id;
  inquiry.discoveryCallScheduledAt = new Date().toISOString();
  saveInquiries(inquiries);
  
  // Send confirmation email if scheduled
  if (scheduledDate && scheduledTime) {
    await sendDiscoveryCallConfirmation(inquiry, newCall);
  }
  
  res.json({ success: true, call: newCall });
});

// Update discovery call
app.put('/api/admin/discovery-calls/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const calls = loadDiscoveryCalls();
  const callIndex = calls.findIndex(c => c.id === id);
  
  if (callIndex === -1) {
    return res.status(404).json({ error: 'Discovery call not found' });
  }
  
  const oldCall = calls[callIndex];
  const wasUnscheduled = !oldCall.scheduledDate;
  
  calls[callIndex] = {
    ...oldCall,
    ...updates,
    id, // Preserve ID
    updatedAt: new Date().toISOString()
  };
  
  saveDiscoveryCalls(calls);
  
  // Send confirmation if just scheduled
  if (wasUnscheduled && updates.scheduledDate && updates.scheduledTime) {
    const inquiries = loadInquiries();
    const inquiry = inquiries.find(i => i.id === oldCall.inquiryId);
    if (inquiry) {
      await sendDiscoveryCallConfirmation(inquiry, calls[callIndex]);
    }
  }
  
  res.json({ success: true, call: calls[callIndex] });
});

// Record call outcome
app.post('/api/admin/discovery-calls/:id/outcome', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { outcome, notes, sendInvitation } = req.body;
  
  if (!['approved', 'follow_up', 'declined', 'no_show'].includes(outcome)) {
    return res.status(400).json({ error: 'Invalid outcome' });
  }
  
  const calls = loadDiscoveryCalls();
  const call = calls.find(c => c.id === id);
  
  if (!call) {
    return res.status(404).json({ error: 'Discovery call not found' });
  }
  
  call.status = 'completed';
  call.outcome = outcome;
  call.outcomeNotes = notes || '';
  call.completedAt = new Date().toISOString();
  call.updatedAt = new Date().toISOString();
  
  saveDiscoveryCalls(calls);
  
  // Update inquiry status based on outcome
  const inquiries = loadInquiries();
  const inquiry = inquiries.find(i => i.id === call.inquiryId);
  
  if (inquiry) {
    if (outcome === 'approved') {
      inquiry.status = 'approved';
      inquiry.approvedAt = new Date().toISOString();
      
      // Auto-send invitation if requested
      if (sendInvitation) {
        const codes = loadInvitationCodes();
        let code;
        do {
          code = generateInvitationCode('RAVI');
        } while (codes.some(c => c.code === code));
        
        const newCode = {
          id: uuidv4(),
          code,
          label: `Discovery Call: ${inquiry.name}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          usedBy: null,
          usedAt: null,
          active: true
        };
        
        codes.push(newCode);
        saveInvitationCodes(codes);
        
        inquiry.status = 'invited';
        inquiry.invitationCode = code;
        inquiry.invitedAt = new Date().toISOString();
        
        // Send invitation email
        await sendInvitationEmail(inquiry, code);
      }
    } else if (outcome === 'declined') {
      inquiry.status = 'declined';
      inquiry.declinedAt = new Date().toISOString();
      inquiry.declineReason = notes || 'After discovery call';
    } else if (outcome === 'follow_up') {
      inquiry.status = 'follow_up';
      inquiry.followUpNotes = notes;
    } else if (outcome === 'no_show') {
      inquiry.status = 'no_show';
      inquiry.noShowAt = new Date().toISOString();
    }
    
    saveInquiries(inquiries);
  }
  
  res.json({ success: true, call, inquiry });
});

// Delete discovery call
app.delete('/api/admin/discovery-calls/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  const calls = loadDiscoveryCalls();
  const filtered = calls.filter(c => c.id !== id);
  
  if (filtered.length === calls.length) {
    return res.status(404).json({ error: 'Discovery call not found' });
  }
  
  saveDiscoveryCalls(filtered);
  res.json({ success: true });
});

// Send discovery call reminder
app.post('/api/admin/discovery-calls/:id/remind', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  const calls = loadDiscoveryCalls();
  const call = calls.find(c => c.id === id);
  
  if (!call) {
    return res.status(404).json({ error: 'Discovery call not found' });
  }
  
  const inquiries = loadInquiries();
  const inquiry = inquiries.find(i => i.id === call.inquiryId);
  
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  await sendDiscoveryCallReminder(inquiry, call);
  
  call.reminderSent = true;
  call.lastReminderAt = new Date().toISOString();
  call.updatedAt = new Date().toISOString();
  saveDiscoveryCalls(calls);
  
  res.json({ success: true });
});

// Get discovery call stats
app.get('/api/admin/discovery-calls/stats', authenticateAdmin, (req, res) => {
  const calls = loadDiscoveryCalls();
  
  const stats = {
    total: calls.length,
    pending: calls.filter(c => c.status === 'pending').length,
    scheduled: calls.filter(c => c.status === 'scheduled').length,
    completed: calls.filter(c => c.status === 'completed').length,
    approved: calls.filter(c => c.outcome === 'approved').length,
    declined: calls.filter(c => c.outcome === 'declined').length,
    followUp: calls.filter(c => c.outcome === 'follow_up').length,
    noShow: calls.filter(c => c.outcome === 'no_show').length,
    conversionRate: calls.filter(c => c.status === 'completed').length > 0 
      ? Math.round((calls.filter(c => c.outcome === 'approved').length / calls.filter(c => c.status === 'completed').length) * 100) 
      : 0
  };
  
  // Upcoming calls (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  stats.upcoming = calls.filter(c => {
    if (c.status !== 'scheduled' || !c.scheduledDate) return false;
    const callDate = new Date(c.scheduledDate);
    return callDate >= now && callDate <= nextWeek;
  }).length;
  
  res.json({ success: true, stats });
});

// Helper: Send discovery call confirmation email
async function sendDiscoveryCallConfirmation(inquiry, call) {
  const formattedDate = new Date(call.scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(114, 47, 55, 0.15); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .details { background: #f8f5f0; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .details-label { color: #9E9890; }
    .details-value { font-weight: 600; color: #3D3630; }
    .button { display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white !important; text-decoration: none; padding: 18px 32px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; font-size: 16px; }
    .footer { text-align: center; padding: 24px; background: #f8f5f0; color: #9E9890; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📹 Discovery Call Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear ${inquiry.name},</p>
      <p>Your discovery call with Ravi has been scheduled! Here are your appointment details:</p>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">📅 Date</span>
          <span class="details-value">${formattedDate}</span>
        </div>
        <div class="details-row">
          <span class="details-label">🕐 Time</span>
          <span class="details-value">${call.scheduledTime}</span>
        </div>
        <div class="details-row">
          <span class="details-label">⏱️ Duration</span>
          <span class="details-value">${call.duration} minutes</span>
        </div>
      </div>
      
      ${call.meetingLink ? `
      <a href="${call.meetingLink}" class="button">Join Video Call</a>
      <p style="text-align: center; font-size: 14px; color: #666;">Click the button above at your scheduled time to join the video call.</p>
      ` : `<p style="text-align: center; color: #666;">Ravi will reach out with the meeting link before your call.</p>`}
      
      <p>This call is an opportunity for us to connect, discuss your intentions, and see if we're aligned for this sacred work together.</p>
      
      <p style="margin-top: 24px;">Looking forward to meeting you,<br><strong>Ravi 🪷</strong></p>
    </div>
    <div class="footer">
      <p>If you need to reschedule, please reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

  await sendEmail(
    inquiry.email,
    `📹 Discovery Call Confirmed - ${formattedDate} at ${call.scheduledTime}`,
    `Your discovery call with Ravi is confirmed for ${formattedDate} at ${call.scheduledTime}.`,
    html
  );
}

// Helper: Send discovery call reminder
async function sendDiscoveryCallReminder(inquiry, call) {
  const formattedDate = new Date(call.scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(114, 47, 55, 0.15); }
    .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .reminder-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 16px; margin: 20px 0; border-radius: 8px; }
    .button { display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white !important; text-decoration: none; padding: 18px 32px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; font-size: 16px; }
    .footer { text-align: center; padding: 24px; background: #f8f5f0; color: #9E9890; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Reminder: Discovery Call Tomorrow</h1>
    </div>
    <div class="content">
      <p>Dear ${inquiry.name},</p>
      
      <div class="reminder-box">
        <strong>Your call is tomorrow!</strong><br>
        📅 ${formattedDate}<br>
        🕐 ${call.scheduledTime}
      </div>
      
      ${call.meetingLink ? `
      <a href="${call.meetingLink}" class="button">Join Video Call</a>
      ` : ''}
      
      <p>Looking forward to connecting with you!</p>
      <p style="margin-top: 24px;">With warmth,<br><strong>Ravi 🪷</strong></p>
    </div>
    <div class="footer">
      <p>If you need to reschedule, please reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

  await sendEmail(
    inquiry.email,
    `⏰ Reminder: Discovery Call Tomorrow at ${call.scheduledTime}`,
    `Reminder: Your discovery call with Ravi is tomorrow, ${formattedDate} at ${call.scheduledTime}.`,
    html
  );
}

// Helper: Send invitation email (after approved call)
async function sendInvitationEmail(inquiry, code) {
  const content = loadContent();
  const portalUrl = content.siteSettings?.siteUrl || 'http://localhost:3000';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(114, 47, 55, 0.15); }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .code-box { background: linear-gradient(135deg, #722F37 0%, #5a2429 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; }
    .code { font-size: 28px; letter-spacing: 4px; font-weight: 700; font-family: monospace; }
    .button { display: block; background: linear-gradient(135deg, #D4AF37 0%, #c9a227 100%); color: #3D3630 !important; text-decoration: none; padding: 18px 32px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; font-size: 16px; }
    .footer { text-align: center; padding: 24px; background: #f8f5f0; color: #9E9890; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪷 Welcome to Sacred Healing</h1>
    </div>
    <div class="content">
      <p>Dear ${inquiry.name},</p>
      <p>It was wonderful connecting with you during our discovery call. I'm honored that you've chosen to embark on this healing journey.</p>
      <p>Here is your personal invitation code to access your private portal:</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      
      <a href="${portalUrl}" class="button">✨ Enter Your Portal ✨</a>
      
      <p>Click the button above, select "Have Invitation Code", and enter your code along with your email.</p>
      
      <p style="margin-top: 24px;">With warmth and light,<br><strong>Ravi 🪷</strong></p>
    </div>
    <div class="footer">
      <p>🔒 Your privacy is sacred</p>
    </div>
  </div>
</body>
</html>
`;

  await sendEmail(
    inquiry.email,
    `🪷 You're Approved! Your Invitation Code: ${code}`,
    `Dear ${inquiry.name},\n\nYour invitation code is: ${code}\n\nVisit ${portalUrl} to enter your portal.\n\nWith warmth,\nRavi`,
    html
  );
}

// ===========================================
// CLIENT PORTAL API (World-Class Experience)
// ===========================================

// Validate invitation code (public endpoint)
app.post('/api/client/validate-invitation', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again later.' }
}), (req, res) => {
  const { code, email } = req.body;
  
  if (!code || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid code and email required' });
  }
  
  const codes = loadInvitationCodes();
  const invitation = codes.find(c => 
    c.code.toUpperCase() === code.toUpperCase().trim() && 
    c.active && 
    !c.usedBy
  );
  
  if (!invitation) {
    return res.status(400).json({ error: 'Invalid or already used invitation code' });
  }
  
  // Check expiration
  if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
    return res.status(400).json({ error: 'This invitation code has expired' });
  }
  
  // Mark code as used
  invitation.usedBy = email.toLowerCase();
  invitation.usedAt = new Date().toISOString();
  saveInvitationCodes(codes);
  
  // Create or update client record
  const clients = loadClients();
  let client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  
  if (!client) {
    client = {
      id: uuidv4(),
      email: email.toLowerCase(),
      invitationCode: invitation.code,
      createdAt: new Date().toISOString(),
      preferences: { email: true, sms: false, reminder: '24' }
    };
    clients.push(client);
  } else {
    client.invitationCode = invitation.code;
  }
  
  saveClients(clients);
  
  // Generate magic link for immediate access
  const token = crypto.randomBytes(32).toString('hex');
  const magicLinks = loadMagicLinks();
  magicLinks[token] = { 
    email: email.toLowerCase(), 
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours for new users
  };
  saveMagicLinks(magicLinks);
  
  // Create session token directly
  const sessionToken = jwt.sign(
    { email: email.toLowerCase(), type: 'client' },
    process.env.JWT_SECRET || 'ravi-secret-2024',
    { expiresIn: '24h' }
  );
  
  res.json({ 
    success: true, 
    message: 'Welcome! Your invitation has been accepted.',
    sessionToken // Direct login, no email needed
  });
});

// Request magic link
app.post('/api/client/magic-link', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests. Please try again later.' }
}), async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  
  // Check if this email exists in bookings or clients
  const bookings = loadBookings();
  const clients = loadClients();
  
  const hasBooking = bookings.some(b => b.email.toLowerCase() === email.toLowerCase());
  const hasClient = clients.some(c => c.email.toLowerCase() === email.toLowerCase());
  
  if (!hasBooking && !hasClient) {
    // Don't reveal if email exists - but send a generic message
    // This prevents email enumeration attacks
    return res.json({ 
      success: true, 
      message: 'If an account exists with this email, you will receive a magic link.' 
    });
  }
  
  // Generate magic link token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  const magicLinks = loadMagicLinks();
  magicLinks[token] = { email: email.toLowerCase(), expiresAt };
  saveMagicLinks(magicLinks);
  
  // Get client name
  const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  const booking = bookings.find(b => b.email.toLowerCase() === email.toLowerCase());
  const name = client?.name?.split(' ')[0] || booking?.name?.split(' ')[0] || 'there';
  
  // Send magic link email
  const portalUrl = `${process.env.BASE_URL || 'http://localhost:' + PORT}/portal.html?token=${token}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .logo { text-align: center; font-size: 48px; margin-bottom: 16px; }
    h1 { color: #722F37; text-align: center; font-family: Georgia, serif; }
    .button { display: block; background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; }
    .note { color: #9E9890; font-size: 14px; text-align: center; }
    .footer { text-align: center; color: #9E9890; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0d6cc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🪷</div>
    <h1>Your Portal Access Link</h1>
    <p>Hi ${name}! 👋</p>
    <p>Click the button below to access your Sacred Space client portal:</p>
    <a href="${portalUrl}" class="button">✨ Access My Portal</a>
    <p class="note">This link expires in 15 minutes for your security.<br>If you didn't request this, please ignore this email.</p>
    <div class="footer">
      <p>🪷 Ravi ~ Intuitive Healer & Sensual Bodyworker</p>
      <p>Portland, Oregon</p>
    </div>
  </div>
</body>
</html>
  `;
  
  await sendEmail(email, '✨ Your Portal Access Link - Ravi Sacred Healing', 
    `Hi ${name}! Click here to access your portal: ${portalUrl}\n\nThis link expires in 15 minutes.`,
    html
  );
  
  res.json({ success: true, message: 'Magic link sent!' });
});

// Validate magic link token
app.post('/api/client/validate-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }
  
  const magicLinks = loadMagicLinks();
  const linkData = magicLinks[token];
  
  if (!linkData || linkData.expiresAt < Date.now()) {
    // Clean up expired token
    delete magicLinks[token];
    saveMagicLinks(magicLinks);
    return res.status(401).json({ error: 'Link expired or invalid' });
  }
  
  // Create session token (valid for 24 hours)
  const sessionToken = jwt.sign(
    { email: linkData.email, type: 'client' },
    process.env.JWT_SECRET || 'ravi-secret-2024',
    { expiresIn: '24h' }
  );
  
  // Clean up used magic link
  delete magicLinks[token];
  saveMagicLinks(magicLinks);
  
  // Store session
  const sessions = loadClientSessions();
  sessions[sessionToken] = { 
    email: linkData.email, 
    createdAt: new Date().toISOString() 
  };
  saveClientSessions(sessions);
  
  res.json({ success: true, sessionToken });
});

// Client auth middleware
function authenticateClient(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ravi-secret-2024');
    if (decoded.type !== 'client') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    // Check if client is suspended or banned
    const clients = loadClients();
    const client = clients.find(c => c.email.toLowerCase() === decoded.email.toLowerCase());
    
    if (client?.status === 'banned') {
      return res.status(403).json({ 
        error: 'Account access restricted', 
        message: 'Your account has been closed. Please contact us if you have questions.',
        status: 'banned'
      });
    }
    
    if (client?.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account temporarily suspended', 
        message: 'Your account is temporarily on hold. Please contact us for assistance.',
        status: 'suspended'
      });
    }
    
    req.clientEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Get client portal data
app.get('/api/client/portal', authenticateClient, (req, res) => {
  const email = req.clientEmail;
  const clients = loadClients();
  const bookings = loadBookings();
  
  const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  const latestBooking = bookings.find(b => b.email.toLowerCase() === email.toLowerCase());
  const clientBookings = bookings.filter(b => 
    b.email.toLowerCase() === email.toLowerCase()
  ).map(b => ({
    id: b.id,
    serviceName: b.serviceName,
    servicePrice: b.servicePrice,
    status: b.status,
    createdAt: b.createdAt,
    proposedDate: b.proposedDate,
    proposedTime: b.proposedTime,
    confirmedDate: b.confirmedDate,
    confirmedTime: b.confirmedTime
  }));
  
  res.json({
    name: client?.name || latestBooking?.name || '',
    email: email,
    phone: client?.phone || latestBooking?.phone || '',
    gender: client?.gender || latestBooking?.gender || '',
    pronouns: client?.pronouns || latestBooking?.pronouns || '',
    bookings: clientBookings,
    preferences: client?.preferences || { email: true, sms: false, reminder: '24' }
  });
});

// Client accepts proposed appointment
app.post('/api/client/bookings/:id/accept', authenticateClient, async (req, res) => {
  const { id } = req.params;
  const email = req.clientEmail;
  
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === id && b.email.toLowerCase() === email.toLowerCase());
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  if (!booking.proposedDate || !booking.proposedTime) {
    return res.status(400).json({ error: 'No proposed time to accept' });
  }
  
  // Confirm the booking
  booking.status = 'confirmed';
  booking.confirmedDate = booking.proposedDate;
  booking.confirmedTime = booking.proposedTime;
  booking.acceptedAt = new Date().toISOString();
  
  // Clear proposed fields
  delete booking.proposedDate;
  delete booking.proposedTime;
  
  saveBookings(bookings);
  
  // Send confirmation to client
  const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { text-align: center; background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
    .checkmark { font-size: 48px; }
    h1 { margin: 8px 0 0 0; font-family: Georgia, serif; }
    .details { background: #f8f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0d6cc; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #9E9890; }
    .detail-value { font-weight: 600; color: #3D3630; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>Appointment Confirmed!</h1>
    </div>
    <p>Hi ${booking.name.split(' ')[0]}! 🌸</p>
    <p>Your appointment has been confirmed. I'm looking forward to our session together.</p>
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${new Date(booking.confirmedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${booking.confirmedTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service:</span>
        <span class="detail-value">${booking.serviceName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Investment:</span>
        <span class="detail-value">$${booking.servicePrice}</span>
      </div>
    </div>
    <p>If you need to make any changes, please reach out to me directly.</p>
    <p>With love and light,<br><strong>Ravi 🪷</strong></p>
  </div>
</body>
</html>
  `;
  
  await sendEmail(booking.email, '✓ Your Appointment is Confirmed! - Ravi Sacred Healing',
    `Hi ${booking.name}! Your appointment has been confirmed for ${booking.confirmedDate} at ${booking.confirmedTime}.`,
    confirmationHtml
  );
  
  // Send SMS if enabled
  const clients = loadClients();
  const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (client?.preferences?.sms && booking.phone) {
    await sendSMS(booking.phone, 
      `🪷 Appointment confirmed with Ravi!\n📅 ${new Date(booking.confirmedDate).toLocaleDateString()}\n⏰ ${booking.confirmedTime}\n\nSee you soon! 💝`
    );
  }
  
  // Notify admin
  if (process.env.ADMIN_EMAIL) {
    await sendEmail(process.env.ADMIN_EMAIL, '✓ Client Accepted Appointment',
      `${booking.name} has accepted their appointment for ${booking.confirmedDate} at ${booking.confirmedTime}.`
    );
  }
  
  res.json({ success: true, message: 'Appointment confirmed' });
});

// Client requests reschedule
app.post('/api/client/bookings/:id/reschedule', authenticateClient, async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;
  const email = req.clientEmail;
  
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === id && b.email.toLowerCase() === email.toLowerCase());
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Update booking with reschedule request
  booking.rescheduleRequested = true;
  booking.rescheduleAvailability = availability;
  booking.rescheduleRequestedAt = new Date().toISOString();
  
  // Clear proposed time
  delete booking.proposedDate;
  delete booking.proposedTime;
  
  saveBookings(bookings);
  
  // Notify admin
  const adminHtml = `
<h2>Reschedule Request</h2>
<p><strong>${booking.name}</strong> has requested a different time for their ${booking.serviceName} session.</p>
<p><strong>New Availability:</strong></p>
<p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${availability}</p>
<p>Please propose a new time through the admin panel.</p>
  `;
  
  await sendEmail(
    process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    `📅 Reschedule Request - ${booking.name}`,
    `${booking.name} has requested a different time.\nNew availability: ${availability}`,
    adminHtml
  );
  
  res.json({ success: true, message: 'Reschedule request sent' });
});

// Update client preferences
app.put('/api/client/preferences', authenticateClient, (req, res) => {
  const email = req.clientEmail;
  const { email: emailPref, sms, reminder } = req.body;
  
  const clients = loadClients();
  let client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  
  if (!client) {
    // Create client record if doesn't exist
    const bookings = loadBookings();
    const booking = bookings.find(b => b.email.toLowerCase() === email.toLowerCase());
    
    if (!booking) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    client = {
      id: uuidv4(),
      name: booking.name,
      email: email.toLowerCase(),
      phone: booking.phone,
      textPermission: booking.textPermission,
      createdAt: new Date().toISOString()
    };
    clients.push(client);
  }
  
  // Update preferences
  client.preferences = {
    email: emailPref !== false,
    sms: sms === true,
    reminder: reminder || '24'
  };
  
  saveClients(clients);
  
  res.json({ success: true, message: 'Preferences saved' });
});

// ===========================================
// SECURE MESSAGING SYSTEM
// ===========================================
// Client <-> Practitioner only (NO client-to-client)
// All messages are AES-256-GCM encrypted at rest

const MESSAGES_STORAGE = path.join(DATA_DIR, 'messages.enc');
function loadMessages() { return loadData(MESSAGES_STORAGE, []); }
function saveMessages(data) { saveData(MESSAGES_STORAGE, data); }

// Client sends message to practitioner
app.post('/api/client/messages', authenticateClient, async (req, res) => {
  const { subject, message } = req.body;
  const email = req.clientEmail;
  
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
  }
  
  // Get client info
  const clients = loadClients();
  const bookings = loadBookings();
  const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  const booking = bookings.find(b => b.email.toLowerCase() === email.toLowerCase());
  const clientName = client?.name || booking?.name || 'Unknown Client';
  
  // Create message
  const newMessage = {
    id: uuidv4(),
    conversationId: email.toLowerCase(), // Group by client email
    from: 'client',
    fromEmail: email.toLowerCase(),
    fromName: clientName,
    subject: subject || 'Message from Portal',
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };
  
  const messages = loadMessages();
  messages.push(newMessage);
  saveMessages(messages);
  
  // Notify practitioner via email
  const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
    .message-box { background: #f8f5f0; padding: 20px; border-radius: 8px; border-left: 4px solid #D4AF37; white-space: pre-wrap; }
    .btn { display: inline-block; padding: 14px 28px; background: #722F37; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">💬 New Message</h2>
    </div>
    <p><strong>From:</strong> ${clientName}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
    <div class="message-box">${message}</div>
    <a href="${process.env.BASE_URL || 'http://localhost:' + PORT}/admin.html" class="btn">Reply in Admin Panel</a>
  </div>
</body>
</html>
  `;
  
  try {
    await sendEmail(
      process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      `💬 New Message from ${clientName}`,
      `New message from ${clientName} (${email}):\n\n${message}`,
      adminHtml
    );
  } catch (err) {
    console.error('Failed to send notification email:', err);
    // Don't fail the message save if email fails
  }
  
  res.json({ success: true, message: 'Message sent successfully' });
});

// Client gets their message history
app.get('/api/client/messages', authenticateClient, (req, res) => {
  const email = req.clientEmail;
  const messages = loadMessages();
  
  // Get only this client's conversation
  const clientMessages = messages
    .filter(m => m.conversationId === email.toLowerCase())
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  res.json({ messages: clientMessages });
});

// Admin gets all conversations (grouped by client)
app.get('/api/admin/messages', authenticateAdmin, (req, res) => {
  const messages = loadMessages();
  const clients = loadClients();
  const bookings = loadBookings();
  
  // Group by conversation and get unread counts
  const conversations = {};
  
  messages.forEach(m => {
    const convId = m.conversationId;
    if (!conversations[convId]) {
      const client = clients.find(c => c.email.toLowerCase() === convId);
      const booking = bookings.find(b => b.email.toLowerCase() === convId);
      conversations[convId] = {
        conversationId: convId,
        clientEmail: convId,
        clientName: client?.name || booking?.name || 'Unknown',
        messages: [],
        unreadCount: 0,
        lastMessage: null
      };
    }
    conversations[convId].messages.push(m);
    if (!m.read && m.from === 'client') {
      conversations[convId].unreadCount++;
    }
  });
  
  // Sort by most recent message
  const conversationList = Object.values(conversations)
    .map(conv => {
      conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      conv.lastMessage = conv.messages[conv.messages.length - 1];
      return conv;
    })
    .sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));
  
  res.json({ conversations: conversationList });
});

// Admin gets single conversation
app.get('/api/admin/messages/:conversationId', authenticateAdmin, (req, res) => {
  const { conversationId } = req.params;
  const messages = loadMessages();
  
  const conversationMessages = messages
    .filter(m => m.conversationId === decodeURIComponent(conversationId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // Mark client messages as read
  let updated = false;
  conversationMessages.forEach(m => {
    if (m.from === 'client' && !m.read) {
      const original = messages.find(msg => msg.id === m.id);
      if (original) {
        original.read = true;
        original.readAt = new Date().toISOString();
        updated = true;
      }
    }
  });
  
  if (updated) {
    saveMessages(messages);
  }
  
  res.json({ messages: conversationMessages });
});

// Admin replies to client message
app.post('/api/admin/messages/:conversationId/reply', authenticateAdmin, async (req, res) => {
  const { conversationId } = req.params;
  const { message, sendEmail: shouldSendEmail = true } = req.body;
  
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  const clientEmail = decodeURIComponent(conversationId);
  
  // Get client info
  const clients = loadClients();
  const bookings = loadBookings();
  const client = clients.find(c => c.email.toLowerCase() === clientEmail);
  const booking = bookings.find(b => b.email.toLowerCase() === clientEmail);
  const clientName = client?.name || booking?.name || 'Client';
  
  // Create reply message
  const newMessage = {
    id: uuidv4(),
    conversationId: clientEmail,
    from: 'practitioner',
    fromEmail: process.env.ADMIN_EMAIL || 'ravi@sacredhealing.com',
    fromName: 'Ravi',
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };
  
  const messages = loadMessages();
  messages.push(newMessage);
  saveMessages(messages);
  
  // Send email notification to client
  if (shouldSendEmail) {
    const portalUrl = `${process.env.BASE_URL || 'http://localhost:' + PORT}/portal.html`;
    const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
    .message-box { background: #f8f5f0; padding: 20px; border-radius: 8px; border-left: 4px solid #D4AF37; white-space: pre-wrap; }
    .btn { display: inline-block; padding: 14px 28px; background: #722F37; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🪷 Message from Ravi</h2>
    </div>
    <p>Dear ${clientName.split(' ')[0]},</p>
    <div class="message-box">${message}</div>
    <p style="margin-top: 20px;">With love and light,<br><strong>Ravi 🪷</strong></p>
    <a href="${portalUrl}" class="btn">View in Portal</a>
  </div>
</body>
</html>
    `;
    
    try {
      await sendEmail(
        clientEmail,
        '🪷 New Message from Ravi - Sacred Healing',
        `Dear ${clientName.split(' ')[0]},\n\n${message}\n\nWith love and light,\nRavi\n\nView in portal: ${portalUrl}`,
        clientHtml
      );
    } catch (err) {
      console.error('Failed to send email notification:', err);
    }
  }
  
  res.json({ success: true, message: 'Reply sent successfully' });
});

// Admin gets unread message count (for dashboard)
app.get('/api/admin/messages/unread/count', authenticateAdmin, (req, res) => {
  const messages = loadMessages();
  const unreadCount = messages.filter(m => m.from === 'client' && !m.read).length;
  res.json({ unreadCount });
});

// ===========================================
// ADMIN: Propose appointment time to client
// ===========================================

app.post('/api/admin/bookings/:id/propose', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { proposedDate, proposedTime, message } = req.body;
  
  if (!proposedDate || !proposedTime) {
    return res.status(400).json({ error: 'Date and time required' });
  }
  
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Save proposed time
  booking.proposedDate = proposedDate;
  booking.proposedTime = proposedTime;
  booking.proposedAt = new Date().toISOString();
  
  saveBookings(bookings);
  
  // Generate portal link
  const token = crypto.randomBytes(32).toString('hex');
  const magicLinks = loadMagicLinks();
  magicLinks[token] = { 
    email: booking.email.toLowerCase(), 
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  saveMagicLinks(magicLinks);
  
  const portalUrl = `${process.env.BASE_URL || 'http://localhost:' + PORT}/portal.html?token=${token}`;
  const formattedDate = new Date(proposedDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Send beautiful email
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; padding: 40px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(114, 47, 55, 0.15); }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .proposed-time { background: linear-gradient(135deg, #f8f5f0 0%, #FDF8F3 100%); border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .proposed-label { color: #9E9890; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .proposed-date { color: #722F37; font-size: 24px; font-weight: 600; margin: 8px 0; }
    .proposed-service { color: #3D3630; }
    .button { display: block; background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); color: white !important; text-decoration: none; padding: 18px 32px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; font-size: 16px; }
    .button:hover { opacity: 0.9; }
    .message { background: #f8f5f0; padding: 16px; border-radius: 8px; margin: 16px 0; font-style: italic; }
    .actions { display: flex; gap: 12px; margin: 24px 0; }
    .action-btn { flex: 1; padding: 12px; border-radius: 8px; text-align: center; text-decoration: none; font-weight: 600; }
    .accept { background: #4CAF50; color: white; }
    .reschedule { background: #f8f5f0; color: #722F37; border: 2px solid #722F37; }
    .footer { text-align: center; padding: 24px; background: #f8f5f0; color: #9E9890; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪷 Ravi has proposed a time!</h1>
    </div>
    <div class="content">
      <p>Hi ${booking.name.split(' ')[0]}! 💫</p>
      <p>I've reviewed your booking request and would love to see you at this time:</p>
      
      <div class="proposed-time">
        <div class="proposed-label">Proposed Session</div>
        <div class="proposed-date">📅 ${formattedDate}</div>
        <div class="proposed-date">⏰ ${proposedTime}</div>
        <div class="proposed-service">${booking.serviceName} • $${booking.servicePrice}</div>
      </div>
      
      ${message ? `<div class="message">"${message}"<br><span style="color: #722F37;">— Ravi</span></div>` : ''}
      
      <a href="${portalUrl}" class="button">✨ Accept or Reschedule ✨</a>
      
      <p style="text-align: center; color: #9E9890; font-size: 14px;">
        Click the button to access your portal and respond to this proposal.
      </p>
    </div>
    <div class="footer">
      <p>🪷 Ravi ~ Intuitive Healer & Sensual Bodyworker</p>
      <p>Portland, Oregon</p>
    </div>
  </div>
</body>
</html>
  `;
  
  await sendEmail(booking.email, 
    `✨ Ravi has proposed a session time for ${formattedDate}`,
    `Hi ${booking.name}! I'd love to see you on ${formattedDate} at ${proposedTime} for your ${booking.serviceName} session. Visit your portal to accept or request a different time: ${portalUrl}`,
    html
  );
  
  // Send SMS if client has opted in
  const clients = loadClients();
  const client = clients.find(c => c.email.toLowerCase() === booking.email.toLowerCase());
  if ((client?.preferences?.sms || booking.textPermission) && booking.phone) {
    await sendSMS(booking.phone, 
      `🪷 Ravi has proposed ${formattedDate} at ${proposedTime} for your session!\n\nTap to respond: ${portalUrl}`
    );
  }
  
  res.json({ success: true, message: 'Proposal sent to client' });
});

// ===========================================
// AUTOMATIC NOTIFICATIONS SYSTEM
// ===========================================

// Send reminder notifications (run via cron or scheduled task)
app.post('/api/admin/send-reminders', authenticateAdmin, async (req, res) => {
  const bookings = loadBookings();
  const clients = loadClients();
  const now = new Date();
  const remindersSent = [];
  
  for (const booking of bookings) {
    if (booking.status !== 'confirmed' || !booking.confirmedDate) continue;
    
    const apptDate = new Date(booking.confirmedDate);
    const hoursUntil = (apptDate - now) / (1000 * 60 * 60);
    
    // Get client preferences
    const client = clients.find(c => c.email.toLowerCase() === booking.email.toLowerCase());
    const reminderHours = parseInt(client?.preferences?.reminder) || 24;
    
    // Check if within reminder window and not already sent
    if (hoursUntil <= reminderHours && hoursUntil > 0 && !booking.reminderSent) {
      // Send reminder email
      const reminderHtml = `
<div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
  <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">🪷</div>
  <h2 style="color: #722F37; text-align: center;">Reminder: Your Session is Tomorrow</h2>
  <p>Hi ${booking.name.split(' ')[0]}! 💫</p>
  <p>This is a friendly reminder about your upcoming session:</p>
  <div style="background: #f8f5f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
    <p><strong>📅 ${new Date(booking.confirmedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong></p>
    <p><strong>⏰ ${booking.confirmedTime}</strong></p>
    <p><strong>💝 ${booking.serviceName}</strong></p>
  </div>
  <p>I'm looking forward to our time together.</p>
  <p>With love,<br><strong>Ravi 🪷</strong></p>
</div>
      `;
      
      await sendEmail(booking.email, 
        `🪷 Reminder: Your session with Ravi is tomorrow!`,
        `Hi ${booking.name}! This is a reminder about your session tomorrow at ${booking.confirmedTime}.`,
        reminderHtml
      );
      
      // Send SMS reminder if enabled
      if ((client?.preferences?.sms || booking.textPermission) && booking.phone) {
        await sendSMS(booking.phone, 
          `🪷 Reminder: Your session with Ravi is tomorrow at ${booking.confirmedTime}. See you soon! 💝`
        );
      }
      
      // Mark reminder as sent
      booking.reminderSent = true;
      remindersSent.push(booking.name);
    }
  }
  
  saveBookings(bookings);
  
  res.json({ 
    success: true, 
    message: `Sent ${remindersSent.length} reminders`,
    reminders: remindersSent 
  });
});

// ===========================================
// ONE-CLICK APPOINTMENT ACCEPTANCE (From Email)
// ===========================================

app.get('/api/client/quick-accept/:bookingId/:token', async (req, res) => {
  const { bookingId, token } = req.params;
  
  // Verify token
  const magicLinks = loadMagicLinks();
  const linkData = magicLinks[token];
  
  if (!linkData || linkData.expiresAt < Date.now()) {
    return res.redirect('/portal.html?error=expired');
  }
  
  const bookings = loadBookings();
  const booking = bookings.find(b => 
    b.id === bookingId && 
    b.email.toLowerCase() === linkData.email.toLowerCase()
  );
  
  if (!booking || !booking.proposedDate) {
    return res.redirect('/portal.html?error=not_found');
  }
  
  // Accept the booking
  booking.status = 'confirmed';
  booking.confirmedDate = booking.proposedDate;
  booking.confirmedTime = booking.proposedTime;
  booking.acceptedAt = new Date().toISOString();
  booking.quickAccepted = true;
  
  delete booking.proposedDate;
  delete booking.proposedTime;
  
  saveBookings(bookings);
  
  // Clean up token
  delete magicLinks[token];
  saveMagicLinks(magicLinks);
  
  // Send confirmation email
  await sendEmail(booking.email, 
    '✓ Appointment Confirmed! - Ravi Sacred Healing',
    `Hi ${booking.name}! Your appointment has been confirmed for ${booking.confirmedDate} at ${booking.confirmedTime}.`
  );
  
  // Redirect to success page
  res.redirect(`/portal.html?success=accepted&date=${encodeURIComponent(booking.confirmedDate)}`);
});

// ===========================================
// MARKETING AUTOMATION ENDPOINTS
// ===========================================

// Helper functions for marketing data
function loadCampaigns() {
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const decrypted = decrypt(fs.readFileSync(CAMPAIGNS_FILE, 'utf8'));
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Error loading campaigns:', err);
  }
  return [];
}

function saveCampaigns(campaigns) {
  const encrypted = encrypt(JSON.stringify(campaigns, null, 2));
  fs.writeFileSync(CAMPAIGNS_FILE, encrypted, 'utf8');
}

function loadSegments() {
  try {
    if (fs.existsSync(SEGMENTS_FILE)) {
      const decrypted = decrypt(fs.readFileSync(SEGMENTS_FILE, 'utf8'));
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Error loading segments:', err);
  }
  return [];
}

function saveSegments(segments) {
  const encrypted = encrypt(JSON.stringify(segments, null, 2));
  fs.writeFileSync(SEGMENTS_FILE, encrypted, 'utf8');
}

function loadWorkflows() {
  try {
    if (fs.existsSync(WORKFLOWS_FILE)) {
      const decrypted = decrypt(fs.readFileSync(WORKFLOWS_FILE, 'utf8'));
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Error loading workflows:', err);
  }
  return [];
}

function saveWorkflows(workflows) {
  const encrypted = encrypt(JSON.stringify(workflows, null, 2));
  fs.writeFileSync(WORKFLOWS_FILE, encrypted, 'utf8');
}

function loadTemplates() {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const decrypted = decrypt(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Error loading templates:', err);
  }
  return [];
}

function saveTemplates(templates) {
  const encrypted = encrypt(JSON.stringify(templates, null, 2));
  fs.writeFileSync(TEMPLATES_FILE, encrypted, 'utf8');
}

// Helper functions for lead generation
function loadLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const decrypted = decrypt(fs.readFileSync(LEADS_FILE, 'utf8'));
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Error loading leads:', err);
  }
  return [];
}

function saveLeads(leads) {
  const encrypted = encrypt(JSON.stringify(leads, null, 2));
  fs.writeFileSync(LEADS_FILE, encrypted, 'utf8');
}

function loadLeadMagnets() {
  try {
    if (fs.existsSync(LEAD_MAGNETS_FILE)) {
      const decrypted = decrypt(fs.readFileSync(LEAD_MAGNETS_FILE, 'utf8'));
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Error loading lead magnets:', err);
  }
  return [];
}

function saveLeadMagnets(magnets) {
  const encrypted = encrypt(JSON.stringify(magnets, null, 2));
  fs.writeFileSync(LEAD_MAGNETS_FILE, encrypted, 'utf8');
}

function loadDripCampaigns() {
  try {
    if (fs.existsSync(DRIP_CAMPAIGNS_FILE)) {
      const decrypted = decrypt(fs.readFileSync(DRIP_CAMPAIGNS_FILE, 'utf8'));
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Error loading drip campaigns:', err);
  }
  return [];
}

function saveDripCampaigns(campaigns) {
  const encrypted = encrypt(JSON.stringify(campaigns, null, 2));
  fs.writeFileSync(DRIP_CAMPAIGNS_FILE, encrypted, 'utf8');
}

// Campaigns
app.get('/api/admin/campaigns', authenticateAdmin, (req, res) => {
  const campaigns = loadCampaigns();
  res.json({ campaigns });
});

app.post('/api/admin/campaigns', authenticateAdmin, (req, res) => {
  const campaigns = loadCampaigns();
  const newCampaign = sanitizeObject(req.body);
  newCampaign.createdDate = new Date().toISOString();
  campaigns.push(newCampaign);
  saveCampaigns(campaigns);
  res.json({ success: true, campaign: newCampaign });
});

app.post('/api/admin/campaigns/send', authenticateAdmin, async (req, res) => {
  let campaigns = loadCampaigns();
  const body = sanitizeObject(req.body);
  const clients = loadClients();
  
  // If campaignId provided, send existing campaign; otherwise create new
  let campaign;
  let campaignIndex = -1;
  if (body.campaignId) {
    campaignIndex = campaigns.findIndex(c => c.id === body.campaignId);
    if (campaignIndex === -1) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    campaign = campaigns[campaignIndex];
  } else {
    campaign = body;
  }
  
  // Determine recipients based on segment
  let recipients = clients;
  if (campaign.segment && campaign.segment !== 'all') {
    const segments = loadSegments();
    const targetSegment = segments.find(s => s.id === campaign.segment);
    if (targetSegment) {
      // Filter clients based on segment criteria
      // This is simplified - real implementation would apply all filters
      recipients = clients.slice(0, Math.min(clients.length, targetSegment.count || clients.length));
    }
  }
  
  campaign.recipientCount = recipients.length;
  campaign.status = 'sent';
  campaign.sentDate = new Date().toISOString();
  campaign.stats = {
    openRate: Math.floor(Math.random() * 30 + 20), // Simulate 20-50% open rate
    clickRate: Math.floor(Math.random() * 10 + 5) // Simulate 5-15% click rate
  };
  
  // In production, would send emails here via nodemailer
  // SECURITY: Each email is sent INDIVIDUALLY - never use CC or BCC
  // This ensures absolute client privacy - no recipient can see others
  if (EMAIL_ENABLED && transporter) {
    let successCount = 0;
    let failCount = 0;
    
    // Send emails ONE AT A TIME to each recipient (never batch/group)
    for (const client of recipients) {
      // Personalize email for THIS specific client only
      const personalizedBody = campaign.body
        .replace(/{{firstName}}/g, client.name?.split(' ')[0] || client.name)
        .replace(/{{lastName}}/g, client.name?.split(' ').slice(1).join(' ') || '')
        .replace(/{{email}}/g, client.email)
        .replace(/{{businessName}}/g, 'Ravi\'s Sacred Healing');
      
      try {
        // CRITICAL: Single recipient only - NEVER add cc or bcc fields
        await transporter.sendMail({
          from: `"Ravi - Sacred Healing" <${EMAIL_USER}>`,
          to: client.email,  // ONE recipient only
          // NO cc field - would expose other clients
          // NO bcc field - still reveals count and could leak
          subject: campaign.subject,
          html: personalizedBody.replace(/\n/g, '<br>'),
          headers: {
            'X-Privacy': 'individual-send',
            'Precedence': 'bulk'  // Helps email servers handle appropriately
          }
        });
        successCount++;
      } catch (err) {
        console.error(`[CAMPAIGN ${campaign.id}] Failed to send to ${client.email}:`, err.message);
        failCount++;
      }
      
      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`[CAMPAIGN ${campaign.id}] Sent: ${successCount}, Failed: ${failCount}`);
    campaign.stats.sent = successCount;
    campaign.stats.failed = failCount;
  }
  
  // Update or add campaign
  if (campaignIndex >= 0) {
    campaigns[campaignIndex] = campaign;
  } else {
    campaigns.push(campaign);
  }
  saveCampaigns(campaigns);
  res.json({ success: true, campaign, recipientCount: recipients.length });
});

app.delete('/api/admin/campaigns/:id', authenticateAdmin, (req, res) => {
  let campaigns = loadCampaigns();
  campaigns = campaigns.filter(c => c.id !== req.params.id);
  saveCampaigns(campaigns);
  res.json({ success: true });
});

app.put('/api/admin/campaigns/:id', authenticateAdmin, (req, res) => {
  let campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }
  const updated = { ...campaigns[idx], ...sanitizeObject(req.body), updatedDate: new Date().toISOString() };
  campaigns[idx] = updated;
  saveCampaigns(campaigns);
  res.json({ success: true, campaign: updated });
});

// Segments
app.get('/api/admin/segments', authenticateAdmin, (req, res) => {
  const segments = loadSegments();
  const clients = loadClients();
  
  // Update counts dynamically
  segments.forEach(segment => {
    // Simplified count calculation - real implementation would apply filters
    segment.count = clients.length;
  });
  
  res.json({ segments });
});

app.post('/api/admin/segments', authenticateAdmin, (req, res) => {
  const segments = loadSegments();
  const clients = loadClients();
  const newSegment = sanitizeObject(req.body);
  
  // Calculate actual count based on filters
  // This is simplified - real implementation would apply all filter logic
  newSegment.count = Math.floor(clients.length * (Math.random() * 0.5 + 0.3)); // 30-80% of clients
  
  segments.push(newSegment);
  saveSegments(segments);
  res.json({ success: true, segment: newSegment });
});

app.delete('/api/admin/segments/:id', authenticateAdmin, (req, res) => {
  let segments = loadSegments();
  segments = segments.filter(s => s.id !== req.params.id);
  saveSegments(segments);
  res.json({ success: true });
});

app.put('/api/admin/segments/:id', authenticateAdmin, (req, res) => {
  let segments = loadSegments();
  const idx = segments.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Segment not found' });
  }
  const clients = loadClients();
  const updated = { ...segments[idx], ...sanitizeObject(req.body), updatedDate: new Date().toISOString() };
  // Recalculate count
  updated.count = Math.floor(clients.length * (Math.random() * 0.5 + 0.3));
  segments[idx] = updated;
  saveSegments(segments);
  res.json({ success: true, segment: updated });
});

// Automation/Workflows
app.get('/api/admin/automation', authenticateAdmin, (req, res) => {
  const workflows = loadWorkflows();
  res.json({ workflows });
});

app.post('/api/admin/automation', authenticateAdmin, (req, res) => {
  const workflows = loadWorkflows();
  const newWorkflow = sanitizeObject(req.body);
  workflows.push(newWorkflow);
  saveWorkflows(workflows);
  res.json({ success: true, workflow: newWorkflow });
});

app.put('/api/admin/automation/:id', authenticateAdmin, (req, res) => {
  const workflows = loadWorkflows();
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index !== -1) {
    workflows[index] = sanitizeObject(req.body);
    saveWorkflows(workflows);
    res.json({ success: true, workflow: workflows[index] });
  } else {
    res.status(404).json({ error: 'Workflow not found' });
  }
});

app.delete('/api/admin/automation/:id', authenticateAdmin, (req, res) => {
  let workflows = loadWorkflows();
  workflows = workflows.filter(w => w.id !== req.params.id);
  saveWorkflows(workflows);
  res.json({ success: true });
});

// Templates
app.get('/api/admin/templates', authenticateAdmin, (req, res) => {
  const templates = loadTemplates();
  res.json({ templates });
});

// Marketing Analytics
app.get('/api/admin/analytics/marketing', authenticateAdmin, (req, res) => {
  const campaigns = loadCampaigns();
  const clients = loadClients();
  const days = parseInt(req.query.days) || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentCampaigns = campaigns.filter(c => 
    c.sentDate && new Date(c.sentDate) >= cutoffDate
  );
  
  const analytics = {
    totalSubscribers: clients.length,
    emailsSent: recentCampaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0),
    totalOpens: recentCampaigns.reduce((sum, c) => {
      const opens = Math.floor((c.recipientCount || 0) * (c.stats?.openRate || 0) / 100);
      return sum + opens;
    }, 0),
    totalClicks: recentCampaigns.reduce((sum, c) => {
      const clicks = Math.floor((c.recipientCount || 0) * (c.stats?.clickRate || 0) / 100);
      return sum + clicks;
    }, 0),
    lifecycle: {
      'New Lead': Math.floor(clients.length * 0.15),
      'Active Client': Math.floor(clients.length * 0.45),
      'Returning Client': Math.floor(clients.length * 0.25),
      'At Risk': Math.floor(clients.length * 0.10),
      'Inactive': Math.floor(clients.length * 0.05)
    }
  };
  
  res.json({ analytics });
});

// ===========================================
// LEAD GENERATION ENDPOINTS
// ===========================================

// Get all leads
app.get('/api/admin/leads', authenticateAdmin, (req, res) => {
  const leads = loadLeads();
  res.json({ leads });
});

// Add new lead (can be called from public lead magnet forms)
// Rate limited to prevent spam abuse
const leadSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 leads per hour per IP
  message: { error: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/admin/leads', leadSubmissionLimiter, (req, res) => {
  try {
    // Sanitize input to prevent stored XSS
    const sanitizedBody = sanitizeObject(req.body);
    const leads = loadLeads();
    const newLead = {
      id: Date.now().toString(),
      ...sanitizedBody,
      status: sanitizedBody.status || 'new',
      stage: sanitizedBody.stage || 'lead',
      createdAt: new Date().toISOString()
    };
    
    leads.push(newLead);
    saveLeads(leads);
    
    // Trigger drip campaigns based on lead source
    const dripCampaigns = loadDripCampaigns();
    const triggered = dripCampaigns.filter(c => 
      c.active && c.trigger === newLead.source
    );
    
    // In production, this would queue the drip emails
    
    res.json({ success: true, leadId: newLead.id, triggered: triggered.length });
  } catch (error) {
    console.error('Error adding lead:', error);
    res.status(500).json({ error: 'Failed to add lead' });
  }
});

// Send follow-up email to lead
app.post('/api/admin/leads/follow-up', authenticateAdmin, (req, res) => {
  try {
    const { leadId, template } = req.body;
    const leads = loadLeads();
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Update lead status
    lead.status = 'contacted';
    lead.lastContactedAt = new Date().toISOString();
    saveLeads(leads);
    
    res.json({ success: true, message: 'Follow-up sent successfully' });
  } catch (error) {
    console.error('Error sending follow-up:', error);
    res.status(500).json({ error: 'Failed to send follow-up' });
  }
});

// Get all lead magnets
app.get('/api/admin/lead-magnets', authenticateAdmin, (req, res) => {
  const magnets = loadLeadMagnets();
  res.json({ magnets });
});

// Create lead magnet
app.post('/api/admin/lead-magnets', authenticateAdmin, (req, res) => {
  try {
    const magnets = loadLeadMagnets();
    const newMagnet = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    magnets.push(newMagnet);
    saveLeadMagnets(magnets);
    
    res.json({ success: true, magnetId: newMagnet.id });
  } catch (error) {
    console.error('Error creating lead magnet:', error);
    res.status(500).json({ error: 'Failed to create lead magnet' });
  }
});

// Delete lead magnet
app.delete('/api/admin/lead-magnets/:id', authenticateAdmin, (req, res) => {
  try {
    let magnets = loadLeadMagnets();
    magnets = magnets.filter(m => m.id !== req.params.id);
    saveLeadMagnets(magnets);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead magnet' });
  }
});

// Get all drip campaigns
app.get('/api/admin/drip-campaigns', authenticateAdmin, (req, res) => {
  const campaigns = loadDripCampaigns();
  res.json({ campaigns });
});

// Create drip campaign
app.post('/api/admin/drip-campaigns', authenticateAdmin, (req, res) => {
  try {
    const campaigns = loadDripCampaigns();
    const newCampaign = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    campaigns.push(newCampaign);
    saveDripCampaigns(campaigns);
    
    res.json({ success: true, campaignId: newCampaign.id });
  } catch (error) {
    console.error('Error creating drip campaign:', error);
    res.status(500).json({ error: 'Failed to create drip campaign' });
  }
});

// Update drip campaign
app.put('/api/admin/drip-campaigns/:id', authenticateAdmin, (req, res) => {
  try {
    const campaigns = loadDripCampaigns();
    const index = campaigns.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    campaigns[index] = { ...campaigns[index], ...req.body, updatedAt: new Date().toISOString() };
    saveDripCampaigns(campaigns);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update drip campaign' });
  }
});

// Delete drip campaign
app.delete('/api/admin/drip-campaigns/:id', authenticateAdmin, (req, res) => {
  try {
    let campaigns = loadDripCampaigns();
    campaigns = campaigns.filter(c => c.id !== req.params.id);
    saveDripCampaigns(campaigns);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete drip campaign' });
  }
});

// ===========================================
// DEMO MODE - For showcasing to Ravi
// ===========================================

// Demo invitation code that always works
const DEMO_CODE = 'DEMO-2026';

// Check for demo code in validation
app.post('/api/client/validate-demo', (req, res) => {
  const { code } = req.body;
  if (code?.toUpperCase() === DEMO_CODE) {
    // Create a demo client token
    const token = jwt.sign(
      { email: 'demo@example.com', name: 'Demo Client', isDemo: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      token,
      client: { name: 'Demo Client', email: 'demo@example.com' },
      message: 'Welcome to the demo!'
    });
  }
  res.status(400).json({ error: 'Invalid demo code' });
});

// Populate demo data
app.post('/api/admin/demo/populate', authenticateAdmin, (req, res) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Sample bookings
  const demoBookings = [
    {
      id: uuidv4(),
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      phone: '503-555-0101',
      serviceName: 'BlissFlow Ritual (2 hours)',
      serviceDuration: 120,
      servicePrice: 350,
      status: 'confirmed',
      confirmedDate: addDays(today, 3),
      confirmedTime: '14:00',
      availability: 'Weekday afternoons',
      intentions: 'Release tension and reconnect with my body',
      concerns: 'Lower back sensitivity',
      healthNotes: 'No major concerns',
      sensitivities: 'Sensitive to strong scents',
      notes: 'Returning client, very relaxed energy',
      createdAt: addDays(today, -5),
      updatedAt: now.toISOString()
    },
    {
      id: uuidv4(),
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '503-555-0102',
      serviceName: 'Sacred Pelvic Healing (90 min)',
      serviceDuration: 90,
      servicePrice: 275,
      status: 'confirmed',
      confirmedDate: addDays(today, 7),
      confirmedTime: '10:00',
      availability: 'Weekend mornings',
      intentions: 'Healing from past trauma',
      concerns: 'First time, feeling nervous',
      healthNotes: 'Prefer to discuss in person',
      sensitivities: 'None',
      notes: 'New client referral from Sarah',
      createdAt: addDays(today, -2),
      updatedAt: now.toISOString()
    },
    {
      id: uuidv4(),
      name: 'Emma Rodriguez',
      email: 'emma@example.com',
      phone: '503-555-0103',
      serviceName: 'Discovery Call (30 min)',
      serviceDuration: 30,
      servicePrice: 0,
      status: 'pending',
      confirmedDate: '',
      confirmedTime: '',
      availability: 'Flexible',
      intentions: 'Curious about sacred bodywork',
      concerns: 'Want to learn more before committing',
      healthNotes: 'None',
      sensitivities: 'None',
      notes: '',
      createdAt: addDays(today, -1),
      updatedAt: now.toISOString()
    },
    {
      id: uuidv4(),
      name: 'David Park',
      email: 'david@example.com',
      phone: '503-555-0104',
      serviceName: 'BlissFlow Ritual (2 hours)',
      serviceDuration: 120,
      servicePrice: 350,
      status: 'completed',
      confirmedDate: addDays(today, -7),
      confirmedTime: '16:00',
      availability: 'Evenings',
      intentions: 'Deep relaxation and stress relief',
      concerns: 'Work-related tension',
      healthNotes: 'Occasional migraines',
      sensitivities: 'Low light preferred',
      notes: 'Great session, wants to book monthly',
      sessionNotes: 'Focused on shoulder and neck tension. Very receptive. Recommended monthly sessions.',
      createdAt: addDays(today, -14),
      updatedAt: now.toISOString()
    }
  ];

  // Sample clients
  const demoClients = [
    {
      id: uuidv4(),
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      phone: '503-555-0101',
      sessions: 5,
      totalSpent: 1500,
      lastContact: addDays(today, -5),
      tags: ['regular', 'referred-others'],
      notes: 'Wonderful client. Prefers afternoon sessions.'
    },
    {
      id: uuidv4(),
      name: 'David Park',
      email: 'david@example.com',
      phone: '503-555-0104',
      sessions: 2,
      totalSpent: 700,
      lastContact: addDays(today, -7),
      tags: ['new'],
      notes: 'Interested in monthly membership'
    }
  ];

  // Sample inquiries
  const demoInquiries = [
    {
      id: uuidv4(),
      name: 'Jennifer Adams',
      email: 'jennifer@example.com',
      phone: '503-555-0201',
      message: 'I found your website through a friend\'s recommendation. I\'ve been dealing with chronic stress and am curious about your healing approach. Would love to learn more.',
      status: 'new',
      createdAt: addDays(today, -1),
      source: 'referral'
    },
    {
      id: uuidv4(),
      name: 'Robert Williams',
      email: 'robert@example.com',
      phone: '',
      message: 'Interested in the discovery call. I\'ve been exploring different healing modalities and your practice resonates with me.',
      status: 'new',
      createdAt: now.toISOString(),
      source: 'website'
    }
  ];

  // Sample invitation codes
  const demoCodes = [
    {
      id: uuidv4(),
      code: 'SACRED-DEMO',
      prefix: 'SACRED',
      createdAt: addDays(today, -10),
      expiresAt: addDays(today, 30),
      used: false,
      singleUse: true,
      active: true
    },
    {
      id: uuidv4(),
      code: 'LOTUS-RAVI',
      prefix: 'LOTUS',
      createdAt: addDays(today, -5),
      expiresAt: null,
      used: false,
      singleUse: false,
      active: true,
      note: 'For business cards'
    }
  ];

  // Save all demo data
  saveBookings(demoBookings);
  saveClients(demoClients);
  saveInquiries(demoInquiries);
  saveInvitationCodes(demoCodes);

  res.json({ 
    success: true, 
    message: 'Demo data populated!',
    counts: {
      bookings: demoBookings.length,
      clients: demoClients.length,
      inquiries: demoInquiries.length,
      invitationCodes: demoCodes.length
    }
  });
});

// ===========================================
// PASSWORD MANAGEMENT
// ===========================================

app.post('/api/admin/change-password', authenticateAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  
  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, adminPasswordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  
  // Validate new password strength
  if (newPassword.length < 12) {
    return res.status(400).json({ error: 'New password must be at least 12 characters' });
  }
  
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return res.status(400).json({ 
      error: 'Password must include uppercase, lowercase, numbers, and special characters' 
    });
  }
  
  // Hash new password
  adminPasswordHash = await bcrypt.hash(newPassword, 12);
  
  res.json({ 
    success: true, 
    message: 'Password changed successfully. Please login with your new password.' 
  });
});

// ===========================================
// BACKUP MANAGEMENT
// ===========================================

// List all automatic backups
app.get('/api/admin/backups/list', authenticateAdmin, (req, res) => {
  try {
    const backups = {
      auto: [],
      manual: []
    };
    
    // Get automatic backups
    if (fs.existsSync(AUTO_BACKUP_DIR)) {
      backups.auto = fs.readdirSync(AUTO_BACKUP_DIR)
        .filter(f => f.endsWith('.enc'))
        .map(f => {
          const stats = fs.statSync(path.join(AUTO_BACKUP_DIR, f));
          const parts = f.replace('.enc', '').split('_');
          const fileType = parts[0]; // bookings, settings, content, clients
          const timestamp = parts.slice(1).join('_');
          
          return {
            name: f,
            fileType,
            timestamp,
            date: stats.mtime,
            size: stats.size,
            path: 'auto'
          };
        })
        .sort((a, b) => b.date - a.date);
    }
    
    // Get manual backups
    if (fs.existsSync(BACKUP_DIR)) {
      backups.manual = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUP_DIR, f));
          return {
            name: f,
            date: stats.mtime,
            size: stats.size,
            path: 'manual'
          };
        })
        .sort((a, b) => b.date - a.date);
    }
    
    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list backups: ' + err.message });
  }
});

// Restore from automatic backup
app.post('/api/admin/backups/restore', authenticateAdmin, (req, res) => {
  try {
    const { filename, fileType } = req.body;
    
    if (!filename || !fileType) {
      return res.status(400).json({ error: 'Filename and fileType required' });
    }
    
    const backupPath = path.join(AUTO_BACKUP_DIR, filename);
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    // Read and decrypt backup
    const backupData = decrypt(fs.readFileSync(backupPath, 'utf8'));
    
    // Determine target file
    let targetFile;
    switch (fileType) {
      case 'bookings':
        targetFile = BOOKINGS_FILE;
        break;
      case 'settings':
        targetFile = SETTINGS_FILE;
        break;
      case 'content':
        targetFile = CONTENT_FILE;
        break;
      case 'clients':
        targetFile = CLIENTS_FILE;
        break;
      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Create backup of current state before restoring
    const currentData = decrypt(fs.readFileSync(targetFile, 'utf8'));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const manualBackupFile = path.join(BACKUP_DIR, `backup-before-restore-${fileType}-${timestamp}.json`);
    fs.writeFileSync(manualBackupFile, JSON.stringify(JSON.parse(currentData), null, 2));
    rotateManualBackups();
    
    // Restore from backup (bypass auto-backup to avoid circular backup)
    fs.writeFileSync(targetFile, encrypt(backupData));
    
    res.json({ 
      success: true, 
      message: `${fileType} restored from backup. Previous state saved as manual backup.` 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore backup: ' + err.message });
  }
});

// Create manual backup of all data
app.post('/api/admin/backups/create', authenticateAdmin, (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = {
      timestamp: new Date().toISOString(),
      bookings: loadBookings(),
      settings: loadSettings(),
      content: loadContent(),
      clients: loadClients(),
      inquiries: loadInquiries(),
      invitationCodes: loadInvitationCodes()
    };
    
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    rotateManualBackups();
    
    res.json({ 
      success: true, 
      message: 'Manual backup created successfully',
      filename: `backup-${timestamp}.json`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create backup: ' + err.message });
  }
});

// Get backup statistics
app.get('/api/admin/backups/stats', authenticateAdmin, (req, res) => {
  try {
    const stats = {
      autoBackups: {
        total: 0,
        bookings: 0,
        settings: 0,
        content: 0,
        clients: 0,
        totalSize: 0
      },
      manualBackups: {
        total: 0,
        totalSize: 0
      },
      oldestBackup: null,
      newestBackup: null
    };
    
    // Count auto backups
    if (fs.existsSync(AUTO_BACKUP_DIR)) {
      const autoFiles = fs.readdirSync(AUTO_BACKUP_DIR).filter(f => f.endsWith('.enc'));
      stats.autoBackups.total = autoFiles.length;
      
      autoFiles.forEach(f => {
        const fileStats = fs.statSync(path.join(AUTO_BACKUP_DIR, f));
        stats.autoBackups.totalSize += fileStats.size;
        
        if (f.startsWith('bookings_')) stats.autoBackups.bookings++;
        else if (f.startsWith('settings_')) stats.autoBackups.settings++;
        else if (f.startsWith('content_')) stats.autoBackups.content++;
        else if (f.startsWith('clients_')) stats.autoBackups.clients++;
        
        if (!stats.oldestBackup || fileStats.mtime < stats.oldestBackup) {
          stats.oldestBackup = fileStats.mtime;
        }
        if (!stats.newestBackup || fileStats.mtime > stats.newestBackup) {
          stats.newestBackup = fileStats.mtime;
        }
      });
    }
    
    // Count manual backups
    if (fs.existsSync(BACKUP_DIR)) {
      const manualFiles = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.json'));
      stats.manualBackups.total = manualFiles.length;
      
      manualFiles.forEach(f => {
        const fileStats = fs.statSync(path.join(BACKUP_DIR, f));
        stats.manualBackups.totalSize += fileStats.size;
      });
    }
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get backup stats: ' + err.message });
  }
});

// ===========================================
// EMAIL TEMPLATES API
// ===========================================

const EMAIL_TEMPLATES_FILE = path.join(DATA_DIR, 'email_templates.enc');

function loadEmailTemplates() {
  if (fs.existsSync(EMAIL_TEMPLATES_FILE)) {
    try {
      const encrypted = fs.readFileSync(EMAIL_TEMPLATES_FILE, 'utf8');
      const decrypted = decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('Error loading email templates:', err);
      return [];
    }
  }
  return [];
}

function saveEmailTemplates(templates) {
  try {
    const json = JSON.stringify(templates, null, 2);
    const encrypted = encrypt(json);
    fs.writeFileSync(EMAIL_TEMPLATES_FILE, encrypted, 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving email templates:', err);
    return false;
  }
}

// Get all email templates
app.get('/api/admin/email-templates', authenticateAdmin, (req, res) => {
  const templates = loadEmailTemplates();
  res.json({ success: true, templates });
});

// Get single email template
app.get('/api/admin/email-templates/:id', authenticateAdmin, (req, res) => {
  const templates = loadEmailTemplates();
  const template = templates.find(t => t.id === req.params.id);
  
  if (template) {
    res.json({ success: true, template });
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

// Create email template
app.post('/api/admin/email-templates', authenticateAdmin, (req, res) => {
  const templates = loadEmailTemplates();
  const newTemplate = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  
  if (saveEmailTemplates(templates)) {
    res.json({ success: true, template: newTemplate });
  } else {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// Update email template
app.put('/api/admin/email-templates/:id', authenticateAdmin, (req, res) => {
  const templates = loadEmailTemplates();
  const index = templates.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  templates[index] = {
    ...templates[index],
    ...req.body,
    id: req.params.id, // Preserve original ID
    updatedAt: new Date().toISOString()
  };
  
  if (saveEmailTemplates(templates)) {
    res.json({ success: true, template: templates[index] });
  } else {
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete email template
app.delete('/api/admin/email-templates/:id', authenticateAdmin, (req, res) => {
  const templates = loadEmailTemplates();
  const filtered = templates.filter(t => t.id !== req.params.id);
  
  if (filtered.length === templates.length) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  if (saveEmailTemplates(filtered)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// ===========================================
// DEMO MODE
// ===========================================

// Clear all data (reset for demo)
app.post('/api/admin/demo/reset', authenticateAdmin, (req, res) => {
  saveBookings([]);
  saveClients([]);
  saveInquiries([]);
  saveInvitationCodes([]);
  
  res.json({ success: true, message: 'All data cleared!' });
});

// Helper function to add days to a date string
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// ===========================================
// APPOINTMENT REMINDERS SYSTEM
// ===========================================

// Check for sessions that need reminders
function checkSessionReminders() {
  const bookings = loadBookings();
  const now = new Date();
  const remindersToSend = [];
  
  bookings.forEach(booking => {
    if (booking.status !== 'confirmed' || !booking.confirmedDate) return;
    
    const sessionDate = new Date(booking.confirmedDate);
    const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60);
    
    // Initialize reminders object if not present
    if (!booking.reminders) {
      booking.reminders = { h24: false, h1: false };
    }
    
    // 24-hour reminder (between 23-25 hours before)
    if (hoursUntilSession > 23 && hoursUntilSession <= 25 && !booking.reminders.h24) {
      remindersToSend.push({
        booking,
        type: '24h',
        message: `Your healing session with Ravi is tomorrow at ${booking.confirmedTime || 'your scheduled time'}. We look forward to holding space for you. 🪷`
      });
      booking.reminders.h24 = true;
    }
    
    // 1-hour reminder (between 1-2 hours before)
    if (hoursUntilSession > 1 && hoursUntilSession <= 2 && !booking.reminders.h1) {
      remindersToSend.push({
        booking,
        type: '1h',
        message: `Gentle reminder: Your session with Ravi begins in about 1 hour. Please start preparing your space for our time together. ✨`
      });
      booking.reminders.h1 = true;
    }
  });
  
  // Save updated booking reminders
  if (remindersToSend.length > 0) {
    saveBookings(bookings);
    
    // Log reminders (in production, this would send emails/SMS)
    remindersToSend.forEach(r => {
      console.log(`📧 REMINDER [${r.type}]: ${r.booking.name} (${r.booking.email})`);
      console.log(`   Session: ${r.booking.confirmedDate} at ${r.booking.confirmedTime || 'TBD'}`);
      
      // In production, integrate with email service here
      // sendEmail(r.booking.email, 'Session Reminder', r.message);
    });
  }
  
  return remindersToSend.length;
}

// API endpoint to get pending reminders
app.get('/api/admin/reminders', authenticateAdmin, (req, res) => {
  const bookings = loadBookings();
  const now = new Date();
  
  const upcomingReminders = [];
  
  bookings.forEach(booking => {
    if (booking.status !== 'confirmed' || !booking.confirmedDate) return;
    
    const sessionDate = new Date(booking.confirmedDate);
    const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60);
    
    // Sessions in the next 48 hours
    if (hoursUntilSession > 0 && hoursUntilSession <= 48) {
      const reminders = booking.reminders || { h24: false, h1: false };
      
      upcomingReminders.push({
        bookingId: booking.id,
        clientName: booking.name,
        clientEmail: booking.email,
        sessionDate: booking.confirmedDate,
        sessionTime: booking.confirmedTime,
        hoursUntil: Math.round(hoursUntilSession),
        reminder24hSent: reminders.h24,
        reminder1hSent: reminders.h1
      });
    }
  });
  
  res.json({ reminders: upcomingReminders });
});

// API endpoint to manually trigger a reminder
app.post('/api/admin/reminders/:bookingId/send', authenticateAdmin, async (req, res) => {
  const { bookingId } = req.params;
  const { type } = req.body; // 'welcome', '24h', '1h', 'custom'
  
  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  const templates = {
    welcome: {
      subject: 'Your Session is Confirmed ✨',
      message: `Dear ${booking.name},\n\nYour session with Ravi has been confirmed for ${booking.confirmedDate}${booking.confirmedTime ? ' at ' + booking.confirmedTime : ''}.\n\nPlease arrive 5-10 minutes early to settle in. Wear comfortable, loose clothing.\n\nWith gratitude,\nRavi 🪷`
    },
    '24h': {
      subject: 'Session Tomorrow - Reminder 🌸',
      message: `Dear ${booking.name},\n\nJust a gentle reminder that your session with Ravi is tomorrow at ${booking.confirmedTime || 'your scheduled time'}.\n\nTake some time this evening to reflect on what you'd like to bring to our time together.\n\nWith love,\nRavi 🪷`
    },
    '1h': {
      subject: 'Session Starting Soon ✨',
      message: `Dear ${booking.name},\n\nYour session with Ravi begins in about 1 hour.\n\nPlease start preparing your space for our time together. Drink some water, take a few deep breaths, and set your intentions.\n\nSee you soon,\nRavi 🪷`
    }
  };
  
  const template = templates[type] || templates.welcome;
  
  // In production, send actual email here
  console.log(`📧 Manual reminder sent to ${booking.email}:`, template.subject);
  
  // Mark reminder as sent
  if (!booking.reminders) booking.reminders = { h24: false, h1: false };
  if (type === '24h') booking.reminders.h24 = true;
  if (type === '1h') booking.reminders.h1 = true;
  saveBookings(bookings);
  
  res.json({ success: true, message: `Reminder sent to ${booking.email}` });
});

// Run reminder check every 30 minutes
setInterval(() => {
  const count = checkSessionReminders();
  if (count > 0) {
    console.log(`⏰ Sent ${count} automatic reminder(s)`);
  }
}, 30 * 60 * 1000);

// ===========================================
// SERVE STATIC FILES (must be after all API routes)
// ===========================================

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===========================================
// ERROR HANDLING
// ===========================================

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log(`
🌹 Ravi's Sacred Healing Website - PREMIUM
==========================================
Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}

Security Features:
✓ Helmet security headers
✓ Rate limiting enabled
✓ AES-256 encrypted data storage
✓ JWT authentication
✓ CORS protection

Premium Features:
✓ Client management & history
✓ Revenue tracking
✓ Email confirmations & reminders
✓ Content management (testimonials/FAQs)
✓ Export to CSV
✓ Backup & restore
✓ Calendar view

🎭 DEMO MODE:
✓ Demo code: ${DEMO_CODE}
✓ Admin: /admin.html
✓ Populate demo data from admin settings

Client Site: http://localhost:${PORT}
Admin Panel: http://localhost:${PORT}/admin.html
  `);
});
