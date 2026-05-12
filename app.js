// Progress Bar
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    progressBar.style.width = scrolled + '%';
}

window.addEventListener('scroll', updateProgressBar, { passive: true });

// Smooth Scroll Helper
function smoothTo(selector) {
    const targetSelector = selector === '#form' ? '#final-cta' : selector;
    const target = document.querySelector(targetSelector);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Course Selection
function initCourseSelection() {
    const coursePills = document.querySelectorAll('.course-pill');
    const selectedCourseInput = document.getElementById('selectedCourse');
    const finalSelectedCourseInput = document.getElementById('finalSelectedCourse');

    coursePills.forEach(pill => {
        pill.addEventListener('click', function () {
            const course = this.getAttribute('data-course');
            const value = course === 'Not sure' ? 'Не определился' : course;

            coursePills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            if (selectedCourseInput) selectedCourseInput.value = value;
            if (finalSelectedCourseInput) finalSelectedCourseInput.value = value;
        });
    });
}

// Urgency Timer
function startUrgencyTimer() {
    const timerElement = document.getElementById('urgencyTimer');
    if (!timerElement) return;

    let timeLeft = 2 * 60 * 60 + 15 * 60 + 47;

    function updateTimer() {
        if (timeLeft <= 0) {
            timerElement.textContent = '00:00:00';
            const urgencyBadge = document.querySelector('.urgency-badge');
            if (urgencyBadge) urgencyBadge.textContent = 'Места закончились';
            return;
        }

        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timeLeft--;
        window.setTimeout(updateTimer, 1000);
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

function openWhatsApp() {
    openContactModal();
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

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
        z-index: 3000;
        max-width: min(400px, calc(100vw - 32px));
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);
    window.setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        window.setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Form Submission
function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        const isCheckbox = field.type === 'checkbox';
        const fieldValid = isCheckbox ? field.checked : Boolean(field.value.trim());
        field.style.borderColor = fieldValid ? '' : '#EF4444';
        if (!fieldValid) isValid = false;
    });

    if (!isValid) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Отправляем...';
    submitBtn.disabled = true;

    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    })
        .then(response => {
            if (!response.ok) throw new Error('Form submission failed');
            showNotification('Спасибо! Мы свяжемся с вами в течение 2 часов', 'success');
            form.reset();
            document.querySelectorAll('.course-pill').forEach(pill => pill.classList.remove('active'));
        })
        .catch(error => {
            showNotification('Ошибка отправки. Пожалуйста, попробуйте ещё раз или свяжитесь с нами через контакты', 'error');
            console.error('Form submission error:', error);
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// Scroll to Form with Course Pre-selection
function scrollToForm(course = null) {
    if (course) {
        const targetPill = Array.from(document.querySelectorAll('.course-pill'))
            .find(pill => pill.getAttribute('data-course') === course);
        if (targetPill) targetPill.click();
    }

    const formSection = document.getElementById('final-cta') || document.getElementById('booking-form');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const topnav = document.querySelector('.topnav');
    if (!menuBtn || !topnav) return;

    function closeMenu() {
        topnav.classList.remove('active');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn.addEventListener('click', () => {
        const isOpen = topnav.classList.toggle('active');
        menuBtn.classList.toggle('active', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    topnav.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
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

            document.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('active'));
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

// Count Up Animation
function animateCounter(counter) {
    const targetAttr = counter.getAttribute('data-count');
    if (!targetAttr || counter.dataset.animated === 'true') return;

    const target = Number(targetAttr);
    if (!Number.isFinite(target)) return;

    counter.dataset.animated = 'true';
    const originalText = counter.textContent;
    const duration = 900;
    const startTime = performance.now();

    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.round(target * progress);
        counter.textContent = originalText.includes('+') ? `${value}+` : String(value);
        if (progress < 1) requestAnimationFrame(tick);
        else counter.textContent = originalText;
    }

    requestAnimationFrame(tick);
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.stat-card, .track-card, .testimonial-card, .mentor-card, .case-card, .pricing-card, .trust-item');

    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease';
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

    window.setTimeout(() => {
        floatingButton.classList.add('expanded');
        playSimpleSound();
    }, 25000);
}

// Runtime Styles
function injectRuntimeStyles() {
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
    `;
    document.head.appendChild(style);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function () {
    initCourseSelection();
    startUrgencyTimer();
    initMobileMenu();
    initScrollAnimations();
    initFAQAccordion();
    initFloatingCallAttention();
    injectRuntimeStyles();
    updateProgressBar();

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeContactModal();
    });

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
});

// Export functions for inline HTML handlers
window.openWhatsApp = openWhatsApp;
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.goToFaqFromModal = goToFaqFromModal;
window.smoothTo = smoothTo;
window.scrollToForm = scrollToForm;
