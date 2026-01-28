/**
 * Business Configuration
 * Copy this file to config.js and customize for your business
 */

module.exports = {
  // Business Information
  business: {
    name: "Your Business Name",
    tagline: "Your Tagline or Subtitle",
    practitioner: "Your Name",
    location: {
      city: "Your City",
      state: "Your State",
      fullAddress: "Your City, State" // e.g., "Portland, Oregon"
    },
    email: "your-email@example.com",
    phone: "(555) 123-4567" // Optional
  },

  // Branding & Theme
  branding: {
    logoEmoji: "🌸", // Emoji or icon for your brand
    primaryColor: "#722F37", // Burgundy - update to your brand color
    accentColor: "#D4AF37", // Gold - update to your accent color
    heroImageUrl: "your-hero-image.jpg" // Hero background image filename
  },

  // Service Offerings
  services: [
    {
      id: "service1",
      name: "Service Package 1",
      duration: "60 minutes",
      price: "$100",
      description: "Description of your first service offering"
    },
    {
      id: "service2",
      name: "Service Package 2",
      duration: "90 minutes",
      price: "$150",
      description: "Description of your second service offering"
    },
    {
      id: "service3",
      name: "Service Package 3",
      duration: "120 minutes",
      price: "$200",
      description: "Description of your third service offering"
    }
  ],

  // Business Hours & Availability
  availability: {
    defaultDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    defaultTimeSlots: [
      "9:00 AM",
      "10:30 AM",
      "12:00 PM",
      "2:00 PM",
      "4:00 PM"
    ]
  },

  // Content Sections
  content: {
    heroTitle: "Welcome to Your Sacred Space",
    heroSubtitle: "Transform through healing and intuitive bodywork",
    
    aboutTitle: "About [Your Name]",
    aboutText: `Your story and approach to healing. Explain your philosophy, 
    your training, and what makes your practice unique.`,
    
    invitationTitle: "Are You Ready for Transformation?",
    invitationText: `Your invitation to potential clients. What will they 
    experience? What transformation can they expect?`,
    
    processSteps: [
      {
        icon: "📬",
        title: "Share Your Intention",
        description: "Tell us about yourself and what you're seeking"
      },
      {
        icon: "💌",
        title: "Receive Your Invitation",
        description: "If we're aligned, you'll receive a personal invitation code"
      },
      {
        icon: "🪷",
        title: "Begin Your Journey",
        description: "Book your session and step into transformation"
      }
    ]
  },

  // Privacy & Legal
  privacy: {
    dataRetention: "Your data retention policy",
    encryptionInfo: "AES-256-GCM encryption for all stored data",
    privacyPhilosophy: "Your privacy philosophy and commitment"
  },

  // Site Configuration
  site: {
    passwordProtected: true, // Set to false for public access
    requireInvitationCode: true, // Require codes to book appointments
    enableTestimonials: true,
    enableFAQs: true,
    enableInquiryForm: true
  }
};
