// Progress Bar
function updateProgressBar() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
}

window.addEventListener('scroll', updateProgressBar);

// Course Selection
function initCourseSelection() {
    const coursePills = document.querySelectorAll('.course-pill');
    const selectedCourseInput = document.getElementById('selectedCourse');
    const finalSelectedCourseInput = document.getElementById('finalSelectedCourse');
    
    coursePills.forEach(pill => {
        pill.addEventListener('click', function() {
            const course = this.getAttribute('data-course');
            const isNotSure = course === 'Not sure';
            
            // Update active state
            coursePills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            // Update hidden inputs
            if (selectedCourseInput) {
                selectedCourseInput.value = isNotSure ? 'Не определился' : course;
            }
            if (finalSelectedCourseInput) {
                finalSelectedCourseInput.value = isNotSure ? 'Не определился' : course;
            }
        });
    });
}

// Count Up Animation
function initCountUp() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        const count = +counter.innerText;
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => initCountUp(), 1);
        } else {
            counter.innerText = target;
        }
    });
}

// Urgency Timer
function startUrgencyTimer() {
    const timerElement = document.getElementById('urgencyTimer');
    if (!timerElement) return;
    
    let timeLeft = 2 * 60 * 60 + 15 * 60 + 47; // 2 hours, 15 minutes, 47 seconds
    
    function updateTimer() {
        if (timeLeft <= 0) {
            timerElement.textContent = '00:00:00';
            document.querySelector('.urgency-badge').textContent = 'Места закончились';
            return;
        }
        
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        timeLeft--;
        setTimeout(updateTimer, 1000);
    }
    
    updateTimer();
}

// Contact Modal
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function goToFaqFromModal() {
    closeContactModal();
    smoothTo('#faq');
}

function smoothTo(selector) {
    const targetSelector = selector === '#form' ? '#final-cta' : selector;
    const target = document.querySelector(targetSelector);

    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// Compatibility: old calls now open the contact modal instead of WhatsApp
function openWhatsApp() {
    openContactModal();
}

// Form Submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Simple validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#EF4444';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Отправляем...';
    submitBtn.disabled = true;
    
    // Send to Formspree
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showNotification('Спасибо! Мы свяжемся с вами в течение 2 часов', 'success');
            form.reset();
            document.querySelectorAll('.course-pill').forEach(pill => pill.classList.remove('active'));
        } else {
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        showNotification('Ошибка отправки. Пожалуйста, попробуйте еще раз или напишите нам в WhatsApp', 'error');
        console.error('Form submission error:', error);
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#ECFDF5' : '#FEF2F2'};
        color: ${type === 'success' ? '#065F46' : '#DC2626'};
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        border: 1px solid ${type === 'success' ? '#A7F3D0' : '#FECACA'};
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Scroll to Form with Course Pre-selection
function scrollToForm(course = null) {
    const formSection = document.getElementById('final-cta');
    if (formSection) {
        // Pre-select course
        const coursePills = document.querySelectorAll('.course-pill');
        coursePills.forEach(pill => {
            if (pill.getAttribute('data-course') === course) {
                pill.click();
            }
        });
        
        // Scroll to form
        formSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const topnav = document.querySelector('.topnav');
    
    if (menuBtn && topnav) {
        menuBtn.setAttribute('aria-label', 'Открыть меню');
        menuBtn.setAttribute('aria-expanded', 'false');

        menuBtn.addEventListener('click', () => {
            const isActive = topnav.classList.toggle('active');
            menuBtn.classList.toggle('active', isActive);
            menuBtn.setAttribute('aria-expanded', String(isActive));
        });

        topnav.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', () => {
                topnav.classList.remove('active');
                menuBtn.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }
}
// FAQ Accordion
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');

        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isActive = answer.classList.contains('active');

            document.querySelectorAll('.faq-answer').forEach(el => {
                el.classList.remove('active');
            });

            document.querySelectorAll('.faq-toggle').forEach(el => {
                el.textContent = '+';
                el.style.transform = 'rotate(0deg)';
            });

            if (!isActive) {
                answer.classList.add('active');

                if (toggle) {
                    toggle.textContent = '−';
                    toggle.style.transform = 'rotate(180deg)';
                }
            }
        });
    });
}

// Intersection Observer for Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                if (entry.target.classList.contains('stat-number')) {
                    initCountUp();
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll('.stat-card, .track-card, .testimonial-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}
// Simple notification sound
function playSimpleSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(720, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);
}

// Floating call button animation
function initFloatingCallAttention() {
    const floatingButton = document.querySelector('.floating-whatsapp');
    if (!floatingButton) return;

    setTimeout(() => {
        floatingButton.classList.add('expanded');
        playSimpleSound();
    }, 25000);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    initCourseSelection();
    startUrgencyTimer();
    initMobileMenu();
    initScrollAnimations();
    initFAQAccordion();
    initFloatingCallAttention();

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeContactModal();
        }
    });
    
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .topnav.active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            padding: 16px;
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translate(6px, 6px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }
    `;
    document.head.appendChild(style);
});
// Export functions for global access
window.openWhatsApp = openWhatsApp;
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.goToFaqFromModal = goToFaqFromModal;
window.smoothTo = smoothTo;
window.scrollToForm = scrollToForm;
