// Enterprise-Grade Interactive Job Training Portal
// Performance optimized with modern JavaScript practices

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

class JobReadyApp {
    constructor() {
        this.observers = new Map();
        this.animationFrames = new Set();
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        this.setupSmoothScrolling();
        this.setupHeaderEffects();
        this.setupPartnersCarousel();
        this.setupFormValidation();
        this.setupIntersectionObserver();
        this.setupBusinessTracking();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerHeight = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupHeaderEffects() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        
        const handleScroll = throttle(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.classList.remove('scroll-up', 'scroll-down');
                return;
            }
            
            if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    setupPartnersCarousel() {
        const carousel = document.querySelector('.carousel-track');
        const container = document.querySelector('.partners-carousel');
        
        if (carousel && container) {
            container.addEventListener('mouseenter', () => {
                carousel.style.animationPlayState = 'paused';
            });
            
            container.addEventListener('mouseleave', () => {
                carousel.style.animationPlayState = 'running';
            });
        }
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    if (entry.target.classList.contains('stat-number')) {
                        const targetValue = parseInt(entry.target.getAttribute('data-count'));
                        this.animateCounter(entry.target, targetValue);
                        intersectionObserver.unobserve(entry.target);
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('.program-card, .company-logo, .form-container, .stat-number').forEach(el => {
            intersectionObserver.observe(el);
        });

        this.observers.set('intersection', intersectionObserver);
    }

    setupFormValidation() {
        const form = document.getElementById('applicationForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Handle radio buttons differently to prevent scrolling issues
            if (input.type === 'radio') {
                input.addEventListener('change', (e) => {
                    // Store current scroll position
                    const currentScrollTop = document.querySelector('.modal-body')?.scrollTop || 0;
                    
                    this.validateField(e.target);
                    
                    // Restore scroll position after validation
                    requestAnimationFrame(() => {
                        const modalBody = document.querySelector('.modal-body');
                        if (modalBody) {
                            modalBody.scrollTop = currentScrollTop;
                        }
                    });
                });
                
                // Prevent focus on radio button click
                input.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                
                return;
            }
            
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                if (!e.target.value.trim()) {
                    e.target.parentElement.classList.remove('focused');
                }
                this.validateField(e.target);
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(form);
        });
    }

    handleFormSubmit(form) {
        const validation = this.validateBusinessForm(form);
        
        if (validation.isValid) {
            this.submitApplication(form);
        } else {
            this.showNotification('error', 'Application Incomplete', validation.errors.join(' '));
        }
    }

    async submitApplication(form) {
        const loader = this.showLoader('Processing your application...');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.hideLoader(loader);
            this.showNotification('success', 
                'Application Submitted Successfully!', 
                'Our recruitment team will contact you within 24 hours.');
            
            form.reset();
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('focused', 'success', 'error');
            });
            
        } catch (error) {
            this.hideLoader(loader);
            this.showNotification('error', 'Submission Failed', 
                'Please try again or contact support.');
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        
        field.parentElement.classList.remove('error', 'success');
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        } else if (value) {
            switch (fieldName) {
                case 'email':
                    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    break;
                case 'phone':
                    isValid = /^[6-9]\d{9}$/.test(value);
                    break;
            }
        }
        
        if (value) {
            field.parentElement.classList.add(isValid ? 'success' : 'error');
        }
        
        return isValid;
    }

    validateBusinessForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        const errors = [];

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                const fieldName = this.getFieldDisplayName(field.name);
                errors.push(`${fieldName} is required or invalid.`);
            }
        });

        return { isValid, errors };
    }

    getFieldDisplayName(fieldName) {
        const displayNames = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email Address',
            phone: 'Phone Number',
            address: 'Address'
        };
        return displayNames[fieldName] || fieldName;
    }

    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const isPercentage = element.textContent.includes('%') || 
                           element.parentElement.querySelector('.stat-label').textContent.includes('%');
        
        const updateCounter = () => {
            start += increment;
            const currentValue = Math.floor(start);
            
            if (isPercentage) {
                element.textContent = currentValue + '%';
            } else {
                element.textContent = currentValue.toLocaleString();
            }
            
            if (start < target) {
                const frameId = requestAnimationFrame(updateCounter);
                this.animationFrames.add(frameId);
            } else {
                element.textContent = isPercentage ? target + '%' : target.toLocaleString();
            }
        };
        
        updateCounter();
    }

    showNotification(type, title, message, duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `professional-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                this.closeNotification(notification);
            }
        }, duration);
        
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.closeNotification(notification);
        });
        
        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                document.body.removeChild(notification);
            }
        }, 300);
    }

    showLoader(message = 'Processing...') {
        const loader = document.createElement('div');
        loader.className = 'professional-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <h3>${message}</h3>
                <p>Please wait while we process your information</p>
            </div>
        `;
        
        document.body.appendChild(loader);
        requestAnimationFrame(() => loader.classList.add('show'));
        
        return loader;
    }

    hideLoader(loader) {
        loader.classList.remove('show');
        setTimeout(() => {
            if (loader.parentElement) {
                document.body.removeChild(loader);
            }
        }, 300);
    }

    setupBusinessTracking() {
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            
            switch (action) {
                case 'open-modal':
                    this.openModal();
                    this.trackEvent('modal_open', 'application_form');
                    break;
                case 'close-modal':
                    this.closeModal();
                    this.trackEvent('modal_close', 'application_form');
                    break;
            }

            if (e.target.closest('.submit-button')) {
                this.trackEvent('form_submit_attempt', 'application_form');
            }
            if (e.target.closest('.logo-container')) {
                const brandName = e.target.closest('.logo-container').querySelector('.brand-name')?.textContent || 'unknown';
                this.trackEvent('partner_logo_click', brandName);
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('applicationModal').style.display !== 'none') {
                this.closeModal();
            }
        });

        // Close modal on overlay click
        document.getElementById('applicationModal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        document.addEventListener('visibilitychange', () => {
            this.trackEvent(document.visibilityState === 'hidden' ? 'page_hidden' : 'page_visible', 'user_engagement');
        });
    }

    openModal() {
        const modal = document.getElementById('applicationModal');
        if (modal) {
            modal.style.display = 'block';
            // Trigger animation
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('applicationModal');
        if (modal) {
            modal.classList.remove('active');
            
            // Hide modal after animation
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                
                // Reset form if needed
                const form = modal.querySelector('#applicationForm');
                if (form) {
                    form.querySelectorAll('.form-group').forEach(group => {
                        group.classList.remove('focused', 'success', 'error');
                    });
                }
            }, 300);
        }
    }

    trackEvent(action, label = '') {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'User Interaction',
                event_label: label
            });
        }
        console.log(`Analytics: ${action} - ${label}`);
    }
}

// Mobile Menu Management
class MobileMenuManager {
    constructor() {
        this.nav = document.getElementById('mobileNav');
        this.isOpen = false;
        this.setupOverlay();
    }
    
    setupOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(this.overlay);
        this.overlay.addEventListener('click', () => this.close());
    }
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    
    open() {
        if (this.nav) {
            this.nav.classList.add('mobile-active');
            this.overlay.style.opacity = '1';
            this.overlay.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
            this.isOpen = true;
            
            const icon = document.querySelector('.mobile-menu-toggle i');
            if (icon) icon.className = 'fas fa-times';
        }
    }
    
    close() {
        if (this.nav) {
            this.nav.classList.remove('mobile-active');
            this.overlay.style.opacity = '0';
            this.overlay.style.visibility = 'hidden';
            document.body.style.overflow = '';
            this.isOpen = false;
            
            const icon = document.querySelector('.mobile-menu-toggle i');
            if (icon) icon.className = 'fas fa-bars';
        }
    }
}

// Global mobile menu function
window.toggleMobileMenu = () => {
    if (window.mobileMenuManager) {
        window.mobileMenuManager.toggle();
    }
};

// Language Translation System
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                'langToggle': 'हिंदी'
            },
            hi: {
                'langToggle': 'English'
            }
        };
        this.init();
    }
    
    init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        if (savedLang === 'hi') {
            this.switchToHindi();
        }
    }
    
    toggle() {
        if (this.currentLanguage === 'en') {
            this.switchToHindi();
        } else {
            this.switchToEnglish();
        }
        
        // Save preference
        localStorage.setItem('preferredLanguage', this.currentLanguage);
        
        // Track language switch
        if (window.jobReadyApp) {
            window.jobReadyApp.trackEvent('Language', 'Switch', this.currentLanguage);
        }
    }
    
    switchToHindi() {
        this.currentLanguage = 'hi';
        this.updateContent();
        this.updateButton();
        document.documentElement.lang = 'hi';
    }
    
    switchToEnglish() {
        this.currentLanguage = 'en';
        this.updateContent();
        this.updateButton();
        document.documentElement.lang = 'en';
    }
    
    updateContent() {
        const elements = document.querySelectorAll('[data-en][data-hi]');
        elements.forEach(element => {
            if (this.currentLanguage === 'hi') {
                // Handle HTML content vs text content
                if (element.innerHTML.includes('<span class="highlight">')) {
                    element.innerHTML = element.dataset.hi.replace('2 दिन', '<span class="highlight">2 दिन</span>');
                } else {
                    element.textContent = element.dataset.hi;
                }
            } else {
                if (element.innerHTML.includes('<span class="highlight">')) {
                    element.innerHTML = element.dataset.en.replace('2 Days', '<span class="highlight">2 Days</span>');
                } else {
                    element.textContent = element.dataset.en;
                }
            }
        });
        
        // Handle form input placeholders
        this.updateFormPlaceholders();
    }
    
    updateFormPlaceholders() {
        const inputs = document.querySelectorAll('input[data-en-placeholder][data-hi-placeholder], textarea[data-en-placeholder][data-hi-placeholder], select option[data-en][data-hi]');
        inputs.forEach(input => {
            if (input.tagName === 'OPTION') {
                // Handle select options
                input.textContent = this.currentLanguage === 'hi' ? input.dataset.hi : input.dataset.en;
            } else {
                // Handle input and textarea placeholders
                const placeholderKey = this.currentLanguage === 'hi' ? 'hiPlaceholder' : 'enPlaceholder';
                input.placeholder = input.dataset[placeholderKey] || '';
            }
        });
    }
    
    updateButton() {
        const langText = document.querySelector('.lang-text');
        if (langText) {
            langText.textContent = this.currentLanguage === 'en' ? 'हिंदी' : 'English';
        }
    }
}

// Global language toggle function
window.toggleLanguage = () => {
    if (window.languageManager) {
        window.languageManager.toggle();
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.jobReadyApp = new JobReadyApp();
    window.mobileMenuManager = new MobileMenuManager();
    window.languageManager = new LanguageManager();
});