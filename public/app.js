/**
 * RAVI'S SACRED HEALING - CLIENT APPLICATION
 * ==========================================
 * Privacy-first, no tracking, secure interactions
 * WCAG 2.1 AA Accessible
 */

(function() {
  'use strict';

  // ===========================================
  // STATE & CONFIGURATION
  // ===========================================
  
  let authToken = null;
  let services = [];

  // ===========================================
  // DEMO MODE CHECK
  // ===========================================
  
  // Check if coming from demo mode (via portal with DEMO-2026 code)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') {
    // Demo mode - show main site immediately
    sessionStorage.setItem('sacredToken', 'demo-token');
    authToken = 'demo-token';
    setTimeout(() => {
      showMainSite();
      loadServices();
    }, 100);
  }

  // ===========================================
  // AUTHENTICATION
  // ===========================================

  // Check for existing session
  async function checkAuth() {
    const storedToken = sessionStorage.getItem('sacredToken');
    if (storedToken) {
      // Verify the token is still valid by making a test request
      try {
        const response = await fetch('/api/services', {
          headers: { 'Authorization': 'Bearer ' + storedToken }
        });
        if (response.ok) {
          authToken = storedToken;
          showMainSite();
          loadServices();
        } else {
          // Token invalid, clear it
          sessionStorage.removeItem('sacredToken');
        }
      } catch (err) {
        // Network error, try to show main site anyway
        authToken = storedToken;
        showMainSite();
        loadServices();
      }
    }
  }

  // Handle inquiry form submission (new flow)
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('inquiry-name').value.trim();
      const email = document.getElementById('inquiry-email').value.trim();
      const phone = document.getElementById('inquiry-phone').value.trim();
      const birthday = document.getElementById('inquiry-birthday').value;
      const message = document.getElementById('inquiry-message').value.trim();
      const errorEl = document.getElementById('inquiry-error');
      const submitBtn = document.getElementById('inquiry-btn');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      errorEl.textContent = '';

      try {
        const response = await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, birthday, message })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Show success message
          document.getElementById('contact-section').style.display = 'none';
          document.getElementById('inquiry-success').style.display = 'block';
        } else {
          errorEl.textContent = data.error || 'Something went wrong. Please try again.';
        }
      } catch (err) {
        errorEl.textContent = 'Connection error. Please try again.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '✨ Get in Touch with Ravi';
      }
    });
  }

  // Handle password form submission (legacy support)
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const password = document.getElementById('site-password').value;
      const errorEl = document.getElementById('password-error');
      const submitBtn = e.target.querySelector('button');
      
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.textContent = 'Verifying...';
      errorEl.textContent = '';

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          authToken = data.token;
          sessionStorage.setItem('sacredToken', authToken);
          showMainSite();
          loadServices();
        } else {
          errorEl.textContent = data.error || 'Invalid password. Please try again.';
          document.getElementById('site-password').focus();
        }
      } catch (err) {
        errorEl.textContent = 'Connection error. Please try again.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = 'Enter Sacred Space';
      }
    });
  }

  function showMainSite() {
    const gate = document.getElementById('password-gate');
    const mainSite = document.getElementById('main-site');
    
    gate.classList.add('hidden');
    gate.setAttribute('aria-hidden', 'true');
    mainSite.classList.remove('hidden');
    mainSite.removeAttribute('aria-hidden');
    document.body.style.overflow = 'auto';
    
    // Trigger smooth fade-in after a brief moment to ensure content is ready
    setTimeout(() => {
      mainSite.classList.add('visible');
    }, 50);
    
    // Set today's date in the signature date field
    const signatureDateField = document.getElementById('signatureDate');
    if (signatureDateField) {
      const today = new Date().toISOString().split('T')[0];
      signatureDateField.value = today;
    }
    
    // Move focus to main content for screen readers
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }

  // ===========================================
  // SERVICES & SCHEDULING
  // ===========================================

  async function loadServices() {
    try {
      const response = await fetch('/api/services', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        services = data.services;
        renderServiceOptions();
        renderAvailability(data.availableDays, data.availableSlots);
      }
    } catch (err) {
      console.error('Failed to load services');
      // Use default services
      services = [
        { id: 'video-coaching', name: '30 min Tantric Coaching (Video)', duration: 30, price: 111 },
        { id: 'angel-session', name: '1 Hour "Angel" Session', duration: 60, price: 333 },
        { id: 'standard-session', name: '90 Minute Session', duration: 90, price: 444 },
        { id: 'extended-session', name: '2 Hour Session', duration: 120, price: 555 },
        { id: 'couples-session', name: 'Couples Session (2 hours)', duration: 120, price: 666 },
        { id: 'duo-session', name: 'Duo Session (with assistant)', duration: 120, price: 777 }
      ];
      renderServiceOptions();
      // Show default availability
      renderAvailability(
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM']
      );
    }
  }

  function renderAvailability(days, slots) {
    const daysContainer = document.getElementById('availableDaysDisplay');
    const timesContainer = document.getElementById('availableTimesDisplay');
    
    if (!daysContainer || !timesContainer) return;

    const dayNames = {
      'monday': 'Mon',
      'tuesday': 'Tue', 
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };

    // Render available days as tags
    if (days && days.length > 0) {
      daysContainer.innerHTML = days.map(day => 
        `<span style="display: inline-block; padding: 4px 12px; background: var(--color-burgundy); color: white; border-radius: 20px; font-size: 0.85rem;">${dayNames[day] || day}</span>`
      ).join('');
    } else {
      daysContainer.innerHTML = '<span style="color: var(--color-text-light);">Contact for availability</span>';
    }

    // Render time slots
    if (slots && slots.length > 0) {
      timesContainer.innerHTML = `<strong>Time slots:</strong> ${slots.join(', ')}`;
    }
  }

  function renderServiceOptions() {
    const container = document.getElementById('service-options');
    if (!container) return;

    container.innerHTML = services.map((service, index) => `
      <div class="service-option">
        <input type="radio" name="serviceId" id="service-${service.id}" value="${service.id}" 
               data-name="${service.name}" data-price="${service.price}" ${index === 2 ? 'checked' : ''}
               aria-describedby="service-desc-${service.id}">
        <label for="service-${service.id}" class="service-option-label">
          <span class="service-option-price">$${service.price}</span>
          <span class="service-option-name" id="service-desc-${service.id}">${service.name}</span>
        </label>
      </div>
    `).join('');
  }

  // ===========================================
  // SERVICE CARD CLICK HANDLERS
  // ===========================================

  function setupServiceCardClicks() {
    // Make pricing service cards clickable to select the service in the form
    const serviceCards = document.querySelectorAll('.service-card[data-service-id]');
    
    serviceCards.forEach(card => {
      card.addEventListener('click', () => {
        const serviceId = card.dataset.serviceId;
        const radioButton = document.getElementById(`service-${serviceId}`);
        
        if (radioButton) {
          // Select the radio button
          radioButton.checked = true;
          
          // Add visual feedback to the card
          serviceCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        }
      });
      
      // Add hover effect feedback
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('selected')) {
          card.style.transform = '';
        }
      });
    });
  }

  // ===========================================
  // AVAILABILITY BUTTON HANDLERS
  // ===========================================

  function setupAvailabilityButtons() {
    const dayButtons = document.querySelectorAll('#dayButtons .avail-btn');
    const timeButtons = document.querySelectorAll('#timeButtons .avail-btn');
    const availabilityInput = document.getElementById('availability');
    
    if (!dayButtons.length || !timeButtons.length) return;
    
    // Track selections
    const selectedDays = new Set();
    const selectedTimes = new Set();
    
    // Day button clicks
    dayButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day;
        
        if (selectedDays.has(day)) {
          selectedDays.delete(day);
          btn.classList.remove('selected');
        } else {
          selectedDays.add(day);
          btn.classList.add('selected');
        }
        
        updateAvailabilityValue();
      });
    });
    
    // Time button clicks
    timeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const time = btn.dataset.time;
        
        if (selectedTimes.has(time)) {
          selectedTimes.delete(time);
          btn.classList.remove('selected');
        } else {
          selectedTimes.add(time);
          btn.classList.add('selected');
        }
        
        updateAvailabilityValue();
      });
    });
    
    // Build human-readable availability string
    function updateAvailabilityValue() {
      const dayNames = {
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday'
      };
      
      const timeNames = {
        'morning': 'mornings (9am-12pm)',
        'afternoon': 'afternoons (12pm-5pm)',
        'evening': 'evenings (5pm-8pm)'
      };
      
      let availability = '';
      
      if (selectedDays.size > 0) {
        const days = Array.from(selectedDays).map(d => dayNames[d]);
        availability = 'Available: ' + days.join(', ');
      }
      
      if (selectedTimes.size > 0) {
        const times = Array.from(selectedTimes).map(t => timeNames[t]);
        if (availability) {
          availability += ' — ' + times.join(', ');
        } else {
          availability = 'Preferred times: ' + times.join(', ');
        }
      }
      
      // Add any notes
      const notesInput = document.getElementById('availabilityNotes');
      if (notesInput && notesInput.value.trim()) {
        if (availability) {
          availability += '. Notes: ' + notesInput.value.trim();
        } else {
          availability = notesInput.value.trim();
        }
      }
      
      availabilityInput.value = availability;
    }
    
    // Also update when notes change
    const notesInput = document.getElementById('availabilityNotes');
    if (notesInput) {
      notesInput.addEventListener('input', updateAvailabilityValue);
    }
  }

  // ===========================================
  // PHONE NUMBER AUTO-FORMATTING
  // ===========================================

  function formatPhoneNumber(value) {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
      // Limit to 10 digits
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  }

  // Add phone formatting listener
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const cursorPosition = e.target.selectionStart;
      const oldLength = e.target.value.length;
      const formatted = formatPhoneNumber(e.target.value);
      e.target.value = formatted;
      
      // Adjust cursor position after formatting
      const newLength = formatted.length;
      const lengthDiff = newLength - oldLength;
      e.target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
    });
  }

  const inquiryPhoneInput = document.getElementById('inquiry-phone');
  if (inquiryPhoneInput) {
    inquiryPhoneInput.addEventListener('input', (e) => {
      const cursorPosition = e.target.selectionStart;
      const oldLength = e.target.value.length;
      const formatted = formatPhoneNumber(e.target.value);
      e.target.value = formatted;

      const newLength = formatted.length;
      const lengthDiff = newLength - oldLength;
      e.target.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
    });
  }

  // ===========================================
  // BOOKING FORM
  // ===========================================

  document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Submitting...';

    // Gather form data
    const selectedService = form.querySelector('input[name="serviceId"]:checked');
    
    const bookingData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      gender: form.gender.value.trim(),
      pronouns: form.pronouns.value.trim(),
      textPermission: form.textPermission.checked,
      newsletter: form.newsletter.checked,
      serviceId: selectedService?.value,
      serviceName: selectedService?.dataset.name,
      servicePrice: selectedService?.dataset.price,
      availability: form.availability.value.trim(),
      intentions: form.intentions.value.trim(),
      concerns: form.concerns.value.trim(),
      healthNotes: form.healthNotes.value.trim(),
      sensitivities: form.sensitivities.value.trim(),
      additionalInfo: form.additionalInfo.value.trim(),
      ageConfirmed: form.ageConfirmed.checked,
      boundariesAgreed: form.boundariesAgreed.checked,
      consentSignature: form.consentSignature.value.trim()
    };

    // Validation with accessible error messages
    const showError = (message, fieldId) => {
      alert(message);
      if (fieldId) {
        const field = document.getElementById(fieldId);
        if (field) field.focus();
      }
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = originalText;
    };

    if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.serviceId) {
      showError('Please fill in all required fields.', 'name');
      return;
    }
    
    // Validate email format
    if (!isValidEmail(bookingData.email)) {
      showError('Please enter a valid email address.', 'email');
      return;
    }

    if (!bookingData.ageConfirmed) {
      showError('You must confirm that you are over 18 years of age.', 'ageConfirmed');
      return;
    }

    if (!bookingData.boundariesAgreed) {
      showError('You must agree to the boundaries and understanding.', 'boundariesAgreed');
      return;
    }

    if (!bookingData.consentSignature) {
      showError('Please provide your electronic signature.', 'consentSignature');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        form.classList.add('hidden');
        const successEl = document.getElementById('booking-success');
        successEl.classList.remove('hidden');
        successEl.focus();
        scrollToSection('booking');
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      alert('Connection error. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = originalText;
    }
  });

  // ===========================================
  // UI INTERACTIONS
  // ===========================================

  // FAQ Toggle with ARIA support
  window.toggleFaq = function(button) {
    const item = button.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const wasExpanded = button.getAttribute('aria-expanded') === 'true';
    
    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(faq => {
      faq.classList.remove('active');
      const btn = faq.querySelector('.faq-question');
      const ans = faq.querySelector('.faq-answer');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (ans) ans.hidden = true;
    });
    
    // Open clicked FAQ if it wasn't already open
    if (!wasExpanded) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      if (answer) answer.hidden = false;
    }
  };

  // Initialize FAQ buttons with click handlers
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', function() {
      toggleFaq(this);
    });
    
    // Keyboard support
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFaq(this);
      }
    });
  });

  // Mobile Menu Toggle with ARIA
  window.toggleMobileMenu = function() {
    const navLinks = document.getElementById('nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    
    navLinks.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', !isExpanded);
    
    // Trap focus in mobile menu when open
    if (!isExpanded) {
      const firstLink = navLinks.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  };

  // Initialize mobile menu button
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // Smooth Scroll with keyboard accessibility
  window.scrollToSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const navHeight = document.querySelector('.main-nav')?.offsetHeight || 0;
      const targetPosition = section.offsetTop - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Set focus to section for screen readers
      section.setAttribute('tabindex', '-1');
      section.focus();
    }
    
    // Close mobile menu if open
    const navLinks = document.getElementById('nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (navLinks) navLinks.classList.remove('active');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    
    return false;
  };

  // Initialize smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        scrollToSection(href.substring(1));
      }
    });
  });

  // Navbar background on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.main-nav');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
  });

  // ===========================================
  // PRIVACY FEATURES
  // ===========================================

  // Clear session on page unload (optional - can be removed for persistent sessions)
  // window.addEventListener('beforeunload', () => {
  //   sessionStorage.removeItem('sacredToken');
  // });

  // Disable right-click context menu (privacy protection)
  document.addEventListener('contextmenu', (e) => {
    // Allow context menu on form inputs for accessibility
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      // e.preventDefault(); // Uncomment to enable
    }
  });

  // ===========================================
  // EMAIL VALIDATION
  // ===========================================
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  let tierCheckTimeout = null;
  let currentClientTier = null;
  
  function setupEmailValidation() {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;
    
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value.trim();
      if (email && !isValidEmail(email)) {
        emailInput.style.borderColor = '#f44336';
        emailInput.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.2)';
        
        // Show error message
        let errorMsg = emailInput.parentElement.querySelector('.email-error');
        if (!errorMsg) {
          errorMsg = document.createElement('span');
          errorMsg.className = 'email-error';
          errorMsg.style.cssText = 'color: #f44336; font-size: 0.85rem; margin-top: 4px; display: block;';
          emailInput.parentElement.appendChild(errorMsg);
        }
        errorMsg.textContent = 'Please enter a valid email address';
      } else {
        emailInput.style.borderColor = '';
        emailInput.style.boxShadow = '';
        const errorMsg = emailInput.parentElement.querySelector('.email-error');
        if (errorMsg) errorMsg.remove();
        
        // Check if returning client
        if (email && isValidEmail(email)) {
          checkClientTier(email);
        }
      }
    });
    
    // Also check on input with debounce
    emailInput.addEventListener('input', () => {
      if (tierCheckTimeout) clearTimeout(tierCheckTimeout);
      const email = emailInput.value.trim();
      
      if (email && isValidEmail(email)) {
        tierCheckTimeout = setTimeout(() => checkClientTier(email), 800);
      } else {
        // Reset form to full intake
        showIntakeLevel('full');
        updateEmailStatus('');
        currentClientTier = null;
      }
    });
  }
  
  async function checkClientTier(email) {
    const statusEl = document.getElementById('emailCheckStatus');
    if (statusEl) {
      statusEl.textContent = 'Checking...';
      statusEl.className = 'email-check-status checking';
    }
    
    try {
      const response = await fetch('/api/client/check-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        currentClientTier = data;
        
        if (data.found) {
          updateEmailStatus(`${data.tierInfo.emoji} ${data.tierInfo.label} client`, 'found');
          showIntakeLevel(data.tierInfo.intakeLevel, data.name);
          
          // Auto-fill name if we have it
          const nameInput = document.getElementById('name');
          if (nameInput && data.name && !nameInput.value) {
            nameInput.value = data.name;
          }
        } else {
          updateEmailStatus('', 'new');
          showIntakeLevel('full');
        }
      } else {
        updateEmailStatus('', '');
        showIntakeLevel('full');
      }
    } catch (err) {
      console.log('Could not check client tier:', err);
      updateEmailStatus('', '');
      showIntakeLevel('full');
    }
  }
  
  function updateEmailStatus(text, status) {
    const statusEl = document.getElementById('emailCheckStatus');
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = `email-check-status ${status || ''}`;
    }
  }
  
  function showIntakeLevel(level, clientName) {
    const fullSection = document.getElementById('fullIntakeSection');
    const shortSection = document.getElementById('shortIntakeSection');
    const minimalSection = document.getElementById('minimalIntakeSection');
    const banner = document.getElementById('returningClientBanner');
    const welcomeName = document.getElementById('welcomeBackName');
    
    // Reset all sections
    if (fullSection) fullSection.classList.remove('hidden');
    if (shortSection) shortSection.classList.add('hidden');
    if (minimalSection) minimalSection.classList.add('hidden');
    if (banner) banner.classList.add('hidden');
    
    // Remove required from textareas in hidden sections
    const allTextareas = document.querySelectorAll('#fullIntakeSection textarea, #shortIntakeSection textarea, #minimalIntakeSection textarea');
    allTextareas.forEach(ta => ta.removeAttribute('required'));
    
    if (level === 'full') {
      // New client - full intake
      if (fullSection) fullSection.classList.remove('hidden');
      if (shortSection) shortSection.classList.add('hidden');
      if (minimalSection) minimalSection.classList.add('hidden');
      if (banner) banner.classList.add('hidden');
    } else if (level === 'short') {
      // Regular client - short intake
      if (fullSection) fullSection.classList.add('hidden');
      if (shortSection) shortSection.classList.remove('hidden');
      if (minimalSection) minimalSection.classList.add('hidden');
      if (banner) banner.classList.remove('hidden');
      if (welcomeName) welcomeName.textContent = clientName ? `, ${clientName.split(' ')[0]}!` : '!';
    } else if (level === 'minimal') {
      // VIP/Favored - minimal intake
      if (fullSection) fullSection.classList.add('hidden');
      if (shortSection) shortSection.classList.add('hidden');
      if (minimalSection) minimalSection.classList.remove('hidden');
      if (banner) banner.classList.remove('hidden');
      if (welcomeName) welcomeName.textContent = clientName ? `, ${clientName.split(' ')[0]}!` : '!';
    }
  }

  // ===========================================
  // AUTO-FILL FROM PORTAL SESSION
  // ===========================================
  
  function autoFillFromPortal() {
    // Check if client info exists from portal login
    const clientInfoStr = sessionStorage.getItem('clientInfo');
    if (!clientInfoStr) return;
    
    try {
      const clientInfo = JSON.parse(clientInfoStr);
      
      // Auto-fill form fields
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const genderInput = document.getElementById('gender');
      const pronounsInput = document.getElementById('pronouns');
      
      if (nameInput && clientInfo.name) {
        nameInput.value = clientInfo.name;
      }
      if (emailInput && clientInfo.email) {
        emailInput.value = clientInfo.email;
      }
      if (phoneInput && clientInfo.phone) {
        phoneInput.value = formatPhoneNumber(clientInfo.phone);
      }
      if (genderInput && clientInfo.gender) {
        genderInput.value = clientInfo.gender;
      }
      if (pronounsInput && clientInfo.pronouns) {
        pronounsInput.value = clientInfo.pronouns;
      }
      
      // Show a helpful note that info was pre-filled
      const formSection = document.querySelector('#booking .form-section');
      if (formSection && clientInfo.name) {
        const note = document.createElement('div');
        note.className = 'prefill-note';
        note.innerHTML = `<span style="background: linear-gradient(135deg, rgba(114, 47, 55, 0.1), rgba(212, 175, 55, 0.1)); padding: 12px 16px; border-radius: 8px; display: block; margin-bottom: 16px; font-size: 0.9rem;">✨ Welcome back, ${clientInfo.name.split(' ')[0]}! Your information has been pre-filled.</span>`;
        formSection.insertBefore(note, formSection.firstChild);
      }
    } catch (err) {
      console.log('Could not parse client info');
    }
  }

  // ===========================================
  // INITIALIZATION
  // ===========================================

  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupServiceCardClicks(); // Make pricing cards clickable
    setupAvailabilityButtons(); // Make availability day/time buttons work
    setupEmailValidation(); // Email format validation
    autoFillFromPortal(); // Auto-fill form from portal session
    
    // Prevent body scroll when gate is visible
    const gate = document.getElementById('password-gate');
    if (gate && !gate.classList.contains('hidden')) {
      document.body.style.overflow = 'hidden';
      // Focus on password input for accessibility
      const passwordInput = document.getElementById('site-password');
      if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 100);
      }
    }
    
    // Handle escape key to close mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const navLinks = document.getElementById('nav-links');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (navLinks?.classList.contains('active')) {
          navLinks.classList.remove('active');
          menuBtn?.setAttribute('aria-expanded', 'false');
          menuBtn?.focus();
        }
      }
    });
  });

})();
